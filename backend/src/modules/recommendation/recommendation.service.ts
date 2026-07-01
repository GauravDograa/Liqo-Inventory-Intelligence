import * as repo from "./recommendation.repository";
import {
  getCategoryPolicy,
  RECOMMENDATION_RULES,
} from "./recommendation.config";
import {
  buildRecommendationMlSignals,
  RecommendationFeatureSnapshot,
} from "./recommendation.ml";
import * as forecastService from "../forecast/forecast.service";
import { prisma } from "../../prisma/client";

type InventoryRow = Awaited<
  ReturnType<typeof repo.getInventoryWithStoreAndSku>
>[number];

export const generateTransferRecommendations = async (
  organizationId: string,
  provider?: forecastService.DemandSignalSource,
  modelName?: string
) => {
  console.log("=== GENERATE RECOMMENDATIONS START ===");

  const inventory = await repo.getInventoryWithStoreAndSku(
    organizationId
  );
  const demandContext = await forecastService.getDemandSignals(
    organizationId,
    {
      horizonDays: RECOMMENDATION_RULES.defaultForecastHorizonDays,
      historyWindowDays: RECOMMENDATION_RULES.velocityWindowDays,
      provider,
      modelName,
    }
  );
  const demandSignalMap = new Map(
    demandContext.signals.map((item) => [
      `${item.storeId}_${item.skuId}`,
      item,
    ])
  );

  console.log("Inventory count:", inventory.length);

  const recommendations: any[] = [];
  const skuMap: Record<string, InventoryRow[]> = {};

  inventory.forEach((item) => {
    if (!skuMap[item.skuId]) {
      skuMap[item.skuId] = [];
    }
    skuMap[item.skuId].push(item);
  });

  for (const skuId in skuMap) {
    const skuInventory = skuMap[skuId];
    const category = skuInventory[0]?.sku?.category || null;
    const policy = getCategoryPolicy(category);

    if (skuInventory.length < 2) continue;

    const enriched = skuInventory.map((item) => {
      const demandSignal =
        demandSignalMap.get(`${item.storeId}_${item.skuId}`) || null;
      const velocityPerDay =
        demandSignal?.observedVelocityPerDay || 0;
      const planningVelocity = Math.max(
        demandSignal?.planningVelocityPerDay || velocityPerDay,
        RECOMMENDATION_RULES.minimumVelocityPerDay
      );

      return {
        ...item,
        demandSignal,
        velocityPerDay,
        targetUnits: Math.ceil(
          planningVelocity * policy.targetCoverageDays
        ),
        safetyUnits: Math.ceil(
          planningVelocity * policy.safetyCoverageDays
        ),
        coverageDays: getDemandCoverageDays(
          item.unitsSaleable,
          velocityPerDay
        ),
      };
    });
    const averageUnits =
      enriched.reduce((sum, item) => sum + item.unitsSaleable, 0) /
      enriched.length;

    const surplusStores = enriched
      .filter(
        (item) =>
          item.unitsSaleable > item.targetUnits &&
          item.unitsSaleable - item.targetUnits >=
            RECOMMENDATION_RULES.minimumTransferUnits
      )
      .sort((a, b) => {
        const ageDiff = b.stockAgeDays - a.stockAgeDays;
        if (ageDiff !== 0) return ageDiff;
        return b.unitsSaleable - a.unitsSaleable;
      });

    const deficitStores = enriched
      .filter(
        (item) =>
          item.velocityPerDay >= RECOMMENDATION_RULES.minimumVelocityPerDay &&
          item.unitsSaleable < item.targetUnits
      )
      .sort((a, b) => {
        const shortageDiff =
          b.targetUnits - b.unitsSaleable - (a.targetUnits - a.unitsSaleable);
        if (shortageDiff !== 0) return shortageDiff;
        return b.velocityPerDay - a.velocityPerDay;
      });

    console.log(
      "SKU:",
      skuId,
      "Surplus stores:",
      surplusStores.length,
      "Deficit stores:",
      deficitStores.length
    );

    for (const source of surplusStores) {
      let availableToTransfer = Math.max(
        0,
        source.unitsSaleable -
          Math.max(source.targetUnits, source.safetyUnits)
      );

      if (availableToTransfer < RECOMMENDATION_RULES.minimumTransferUnits) {
        continue;
      }

      for (const destination of deficitStores) {
        if (source.storeId === destination.storeId) continue;

        const shortage = Math.max(
          0,
          destination.targetUnits - destination.unitsSaleable
        );

        if (shortage < RECOMMENDATION_RULES.minimumTransferUnits) {
          continue;
        }

        const transferQty = Math.min(
          Math.floor(availableToTransfer),
          Math.floor(shortage)
        );

        if (transferQty < RECOMMENDATION_RULES.minimumTransferUnits) {
          continue;
        }

        const beforeCoverage = destination.coverageDays;
        const afterCoverage = getDemandCoverageDays(
          destination.unitsSaleable + transferQty,
          destination.velocityPerDay
        );

        const featureSnapshot: RecommendationFeatureSnapshot = {
          currentUnits: source.unitsSaleable,
          sourceCoverageDays: source.coverageDays,
          destinationCoverageDays: destination.coverageDays,
          sourceVelocityPerDay: source.velocityPerDay,
          destinationVelocityPerDay: destination.velocityPerDay,
          stockAgeDays: source.stockAgeDays,
          grossMarginPct: source.sku.mrp
            ? Number(
                (
                  ((source.sku.mrp - source.sku.acquisitionCost) /
                    source.sku.mrp) *
                  100
                ).toFixed(2)
              )
            : null,
          demandSource: destination.demandSignal?.source,
          sourceDemandConfidence:
            source.demandSignal?.confidence || 0,
          destinationDemandConfidence:
            destination.demandSignal?.confidence || 0,
        };
        const imbalanceBefore = Math.max(
          0,
          Math.abs(source.unitsSaleable - destination.unitsSaleable)
        );
        const mlSignals = buildRecommendationMlSignals({
          sourceCoverageDays: source.coverageDays,
          destinationCoverageDays: destination.coverageDays,
          transferQty,
          destinationVelocityPerDay: destination.velocityPerDay,
          stockAgeDays: source.stockAgeDays,
          grossMarginPct: featureSnapshot.grossMarginPct,
          imbalanceBefore,
          destinationDemandConfidence:
            destination.demandSignal?.confidence || 0,
        });

        recommendations.push({
          skuCategory: source.sku.category,
          skuId,
          moveFrom: source.store.name,
          moveTo: destination.store.name,
          quantity: transferQty,
          reason: `Raise destination toward ${policy.targetCoverageDays} days of coverage while relieving aging surplus stock`,
          impact: {
            demandCoverageDays: Number(
              (afterCoverage - beforeCoverage).toFixed(1)
            ),
            imbalanceBefore,
            beforeCoverageDays: beforeCoverage,
            afterCoverageDays: afterCoverage,
            targetCoverageDays: policy.targetCoverageDays,
            stockAgeDays: source.stockAgeDays,
          },
          featureSnapshot,
          mlSignals,
        });

        console.log("Transfer created:", {
          skuId,
          from: source.store.name,
          to: destination.store.name,
          qty: transferQty,
        });

        source.unitsSaleable -= transferQty;
        source.coverageDays = getDemandCoverageDays(
          source.unitsSaleable,
          source.velocityPerDay
        );
        destination.unitsSaleable += transferQty;
        destination.coverageDays = getDemandCoverageDays(
          destination.unitsSaleable,
          destination.velocityPerDay
        );
        availableToTransfer -= transferQty;

        if (
          availableToTransfer <
          RECOMMENDATION_RULES.minimumTransferUnits
        ) {
          break;
        }
      }
    }

    if (
      !recommendations.some((item) => item.skuId === skuId)
    ) {
      const peerSurplusStores = enriched
        .filter(
          (item) =>
            item.unitsSaleable >
              averageUnits + RECOMMENDATION_RULES.fallbackPeerGapUnits
        )
        .sort((a, b) => {
          const ageDiff = b.stockAgeDays - a.stockAgeDays;
          if (ageDiff !== 0) return ageDiff;
          return b.unitsSaleable - a.unitsSaleable;
        });

      const peerNeedStores = enriched
        .filter(
          (item) =>
            item.unitsSaleable <
            averageUnits - RECOMMENDATION_RULES.fallbackPeerGapUnits
        )
        .sort((a, b) => {
          const gapA = averageUnits - a.unitsSaleable;
          const gapB = averageUnits - b.unitsSaleable;
          if (gapB !== gapA) return gapB - gapA;
          return b.velocityPerDay - a.velocityPerDay;
        });

      for (const source of peerSurplusStores) {
        let availableToTransfer = Math.max(
          0,
          source.unitsSaleable -
            Math.max(source.targetUnits, source.safetyUnits)
        );

        for (const destination of peerNeedStores) {
          if (source.storeId === destination.storeId) continue;

          const peerGap = Math.max(
            0,
            averageUnits - destination.unitsSaleable
          );
          const transferQty = Math.min(
            Math.floor(availableToTransfer),
            Math.floor(peerGap)
          );

          if (transferQty < RECOMMENDATION_RULES.minimumTransferUnits) {
            continue;
          }

          const beforeCoverage = destination.coverageDays;
          const afterCoverage = getDemandCoverageDays(
            destination.unitsSaleable + transferQty,
            destination.velocityPerDay
          );

          const featureSnapshot: RecommendationFeatureSnapshot = {
            currentUnits: source.unitsSaleable,
            sourceCoverageDays: source.coverageDays,
            destinationCoverageDays: destination.coverageDays,
            sourceVelocityPerDay: source.velocityPerDay,
            destinationVelocityPerDay: destination.velocityPerDay,
            stockAgeDays: source.stockAgeDays,
            grossMarginPct: source.sku.mrp
              ? Number(
                  (
                    ((source.sku.mrp - source.sku.acquisitionCost) /
                      source.sku.mrp) *
                    100
                  ).toFixed(2)
                )
              : null,
            demandSource: destination.demandSignal?.source,
            sourceDemandConfidence:
              source.demandSignal?.confidence || 0,
            destinationDemandConfidence:
              destination.demandSignal?.confidence || 0,
          };
          const imbalanceBefore = Math.max(
            0,
            Math.abs(source.unitsSaleable - destination.unitsSaleable)
          );
          const mlSignals = buildRecommendationMlSignals({
            sourceCoverageDays: source.coverageDays,
            destinationCoverageDays: destination.coverageDays,
            transferQty,
            destinationVelocityPerDay: destination.velocityPerDay,
            stockAgeDays: source.stockAgeDays,
            grossMarginPct: featureSnapshot.grossMarginPct,
            imbalanceBefore,
            destinationDemandConfidence:
              destination.demandSignal?.confidence || 0,
          });

          recommendations.push({
            skuCategory: source.sku.category,
            skuId,
            moveFrom: source.store.name,
            moveTo: destination.store.name,
            quantity: transferQty,
            reason: "Reduce peer stock imbalance for aging inventory when all stores already exceed base coverage",
            impact: {
              demandCoverageDays: Number(
                (afterCoverage - beforeCoverage).toFixed(1)
              ),
              imbalanceBefore,
              beforeCoverageDays: beforeCoverage,
              afterCoverageDays: afterCoverage,
              targetCoverageDays: policy.targetCoverageDays,
              stockAgeDays: source.stockAgeDays,
            },
            featureSnapshot,
            mlSignals,
          });

          source.unitsSaleable -= transferQty;
          source.coverageDays = getDemandCoverageDays(
            source.unitsSaleable,
            source.velocityPerDay
          );
          destination.unitsSaleable += transferQty;
          destination.coverageDays = getDemandCoverageDays(
            destination.unitsSaleable,
            destination.velocityPerDay
          );
          availableToTransfer -= transferQty;

          if (
            availableToTransfer <
            RECOMMENDATION_RULES.minimumTransferUnits
          ) {
            break;
          }
        }
      }
    }
  }

  recommendations.sort((a, b) => {
    const scoreDiff =
      (b.mlSignals?.rankingScore || 0) -
      (a.mlSignals?.rankingScore || 0);
    if (scoreDiff !== 0) return scoreDiff;

    const qtyDiff = b.quantity - a.quantity;
    if (qtyDiff !== 0) return qtyDiff;

    return (
      (b.impact?.stockAgeDays || 0) -
      (a.impact?.stockAgeDays || 0)
    );
  });

  console.log("Total recommendations:", recommendations.length);
  console.log("=== GENERATE RECOMMENDATIONS END ===");

  return recommendations;
};


export const generateRetailInventoryRecommendations = async (organizationId: string) => {
  const inventory = await prisma.retailInventory.findMany({
    where: {
      organizationId,
      quantityAvailable: { gt: 0 },
      deletedAt: null,
      store: { locationType: "STORE", deletedAt: null },
    },
    include: {
      store: true,
      product: {
        include: { category: true },
      },
    },
  });

  const byProduct = new Map<string, typeof inventory>();

  for (const item of inventory) {
    const group = byProduct.get(item.productId) ?? [];
    group.push(item);
    byProduct.set(item.productId, group);
  }

  const recommendations: any[] = [];

  for (const rows of byProduct.values()) {
    if (rows.length < 2) {
      continue;
    }

    const sorted = [...rows].sort((a, b) => b.quantityAvailable - a.quantityAvailable);
    const source = sorted[0];
    const destination = sorted[sorted.length - 1];
    const gap = source.quantityAvailable - destination.quantityAvailable;
    const quantity = Math.min(
      Math.floor(gap / 2),
      Math.max(0, source.quantityAvailable - Math.max(source.reorderLevel, source.safetyStockLevel))
    );

    if (quantity < RECOMMENDATION_RULES.minimumTransferUnits) {
      continue;
    }

    const beforeCoverageDays = destination.quantityAvailable;
    const afterCoverageDays = destination.quantityAvailable + quantity;

    recommendations.push({
      skuCategory: source.product.category?.name ?? "Uncategorized",
      skuId: source.product.sku,
      moveFrom: source.store.name,
      moveTo: destination.store.name,
      quantity,
      reason: "Balance ERP inventory by moving surplus units from the highest-stock store to the lowest-stock store.",
      impact: {
        demandCoverageDays: quantity,
        imbalanceBefore: gap,
        beforeCoverageDays,
        afterCoverageDays,
        targetCoverageDays: Math.max(destination.reorderLevel, destination.safetyStockLevel),
        stockAgeDays: 90,
      },
      featureSnapshot: {
        currentUnits: source.quantityAvailable,
        sourceCoverageDays: source.quantityAvailable,
        destinationCoverageDays: destination.quantityAvailable,
        sourceVelocityPerDay: 0,
        destinationVelocityPerDay: 0,
        stockAgeDays: 90,
        grossMarginPct: Number(source.product.mrp || 0) > 0
          ? Number((((Number(source.product.mrp) - Number(source.product.baseCost || 0)) / Number(source.product.mrp)) * 100).toFixed(2))
          : null,
        sourceDemandConfidence: 0.68,
        destinationDemandConfidence: 0.68,
      },
      mlSignals: {
        confidence: 0.72,
        rankingScore: Number((0.72 + Math.min(gap / 100, 1)).toFixed(2)),
        readyForModel: false,
      },
    });
  }

  return recommendations.sort((a, b) => b.quantity - a.quantity).slice(0, 25);
};
function getDemandCoverageDays(
  quantity: number,
  velocityPerDay: number
) {
  if (velocityPerDay <= 0) {
    return 0;
  }

  return Number((quantity / velocityPerDay).toFixed(1));
}
