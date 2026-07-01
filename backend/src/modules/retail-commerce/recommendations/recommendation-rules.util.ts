import { Prisma } from "@prisma/client";
import { InventorySignal, RecommendationCandidate } from "./recommendation-engine.types";

const money = (value: Prisma.Decimal.Value) => new Prisma.Decimal(value).toDecimalPlaces(2);
const confidence = (value: number) => new Prisma.Decimal(Math.max(0, Math.min(0.99, value))).toDecimalPlaces(2);

const coverageDays = (quantity: number, velocityPerDay: number) => {
  if (velocityPerDay <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Number((quantity / velocityPerDay).toFixed(1));
};

const targetCoverageDays = 21;
const deadstockCoverageDays = 90;
const highDemandVelocityPerDay = 1.5;
const recommendationExpiryDays = 7;

const expiresAt = () => {
  const date = new Date();
  date.setDate(date.getDate() + recommendationExpiryDays);
  return date;
};

export const buildRecommendationCandidates = (
  inventorySignals: InventorySignal[]
): RecommendationCandidate[] => {
  const candidates: RecommendationCandidate[] = [];
  const byProduct = new Map<string, InventorySignal[]>();

  for (const signal of inventorySignals) {
    byProduct.set(signal.productId, [...(byProduct.get(signal.productId) ?? []), signal]);
    const coverage = coverageDays(signal.quantityAvailable, signal.velocityPerDay);

    if (signal.quantityAvailable < signal.reorderLevel) {
      const shortage = Math.max(signal.reorderLevel - signal.quantityAvailable, 1);
      const suggestedQuantity = Math.max(signal.reorderQuantity, shortage);
      candidates.push({
        type: "RESTOCK",
        productId: signal.productId,
        destinationStoreId: signal.storeId,
        quantity: suggestedQuantity,
        confidenceScore: confidence(0.62 + Math.min(shortage / Math.max(signal.reorderLevel, 1), 0.3)),
        reason: `${signal.storeName} is below reorder level for ${signal.productName}; replenish ${suggestedQuantity} units to restore availability.`,
        signals: {
          rule: "LOW_STOCK_REPLENISHMENT",
          quantityAvailable: signal.quantityAvailable,
          reorderLevel: signal.reorderLevel,
          reorderQuantity: signal.reorderQuantity,
          velocityPerDay: signal.velocityPerDay,
          coverageDays: Number.isFinite(coverage) ? coverage : null,
        },
        expectedImpact: {
          stockAfterAction: signal.quantityAvailable + suggestedQuantity,
          targetCoverageDays,
        },
        expiresAt: expiresAt(),
      });
    }

    if (signal.velocityPerDay <= 0.05 && signal.quantityAvailable > Math.max(signal.reorderQuantity, signal.reorderLevel, 2)) {
      candidates.push({
        type: "DEADSTOCK_ALERT",
        productId: signal.productId,
        sourceStoreId: signal.storeId,
        quantity: signal.quantityAvailable,
        confidenceScore: confidence(0.7 + Math.min(signal.quantityAvailable / 100, 0.2)),
        reason: `${signal.productName} has negligible recent sales velocity at ${signal.storeName} with ${signal.quantityAvailable} units available.`,
        signals: {
          rule: "DEADSTOCK_ZERO_VELOCITY",
          quantityAvailable: signal.quantityAvailable,
          velocityPerDay: signal.velocityPerDay,
          reorderLevel: signal.reorderLevel,
        },
        expectedImpact: {
          action: "Review pricing, promotion, or transfer options",
          blockedInventoryUnits: signal.quantityAvailable,
        },
        expiresAt: expiresAt(),
      });
    }

    if (signal.velocityPerDay >= highDemandVelocityPerDay && coverage < 10) {
      candidates.push({
        type: "HIGH_DEMAND_ALERT",
        productId: signal.productId,
        destinationStoreId: signal.storeId,
        quantity: Math.max(signal.reorderQuantity, Math.ceil(signal.velocityPerDay * targetCoverageDays) - signal.quantityAvailable),
        confidenceScore: confidence(0.68 + Math.min(signal.velocityPerDay / 10, 0.25)),
        reason: `${signal.productName} is selling quickly at ${signal.storeName}; current cover is ${coverage} days.`,
        signals: {
          rule: "HIGH_DEMAND_LOW_COVER",
          quantityAvailable: signal.quantityAvailable,
          velocityPerDay: signal.velocityPerDay,
          coverageDays: coverage,
        },
        expectedImpact: {
          targetCoverageDays,
          demandGapUnits: Math.max(0, Math.ceil(signal.velocityPerDay * targetCoverageDays) - signal.quantityAvailable),
        },
        expiresAt: expiresAt(),
      });
    }
  }

  for (const productSignals of byProduct.values()) {
    const surplusStores = productSignals
      .filter((signal) => {
        const coverage = coverageDays(signal.quantityAvailable, signal.velocityPerDay);
        return (
          signal.quantityAvailable > Math.max(signal.reorderQuantity * 2, signal.reorderLevel * 2, 4) ||
          coverage > deadstockCoverageDays
        );
      })
      .sort((a, b) => b.quantityAvailable - a.quantityAvailable);

    const deficitStores = productSignals
      .filter((signal) => signal.quantityAvailable < Math.max(signal.reorderLevel, Math.ceil(signal.velocityPerDay * 14)))
      .sort((a, b) => b.velocityPerDay - a.velocityPerDay);

    for (const source of surplusStores) {
      let transferableQuantity = Math.max(
        0,
        source.quantityAvailable - Math.max(source.reorderLevel, Math.ceil(source.velocityPerDay * targetCoverageDays), 1)
      );

      for (const destination of deficitStores) {
        if (source.storeId === destination.storeId || transferableQuantity <= 0) {
          continue;
        }

        const demandGap = Math.max(
          destination.reorderLevel - destination.quantityAvailable,
          Math.ceil(destination.velocityPerDay * targetCoverageDays) - destination.quantityAvailable,
          0
        );
        const quantity = Math.min(transferableQuantity, demandGap);

        if (quantity <= 0) {
          continue;
        }

        transferableQuantity -= quantity;
        const destinationCoverageBefore = coverageDays(destination.quantityAvailable, destination.velocityPerDay);
        const destinationCoverageAfter = coverageDays(destination.quantityAvailable + quantity, destination.velocityPerDay);

        candidates.push({
          type: "TRANSFER",
          productId: source.productId,
          sourceStoreId: source.storeId,
          destinationStoreId: destination.storeId,
          quantity,
          confidenceScore: confidence(0.64 + Math.min(quantity / 50, 0.15) + Math.min(destination.velocityPerDay / 20, 0.15)),
          reason: `Transfer ${quantity} units of ${source.productName} from ${source.storeName} surplus to ${destination.storeName} demand gap.`,
          signals: {
            rule: "SURPLUS_TO_DEMAND_GAP",
            sourceQuantityAvailable: source.quantityAvailable,
            destinationQuantityAvailable: destination.quantityAvailable,
            sourceVelocityPerDay: source.velocityPerDay,
            destinationVelocityPerDay: destination.velocityPerDay,
            destinationCoverageBefore: Number.isFinite(destinationCoverageBefore) ? destinationCoverageBefore : null,
            destinationCoverageAfter: Number.isFinite(destinationCoverageAfter) ? destinationCoverageAfter : null,
          },
          expectedImpact: {
            transferQuantity: quantity,
            destinationCoverageGainDays:
              Number.isFinite(destinationCoverageAfter) && Number.isFinite(destinationCoverageBefore)
                ? money(destinationCoverageAfter - destinationCoverageBefore).toNumber()
                : null,
          },
          expiresAt: expiresAt(),
        });
      }
    }
  }

  return candidates.sort((a, b) => b.confidenceScore.comparedTo(a.confidenceScore));
};
