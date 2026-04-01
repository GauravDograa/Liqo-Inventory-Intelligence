import { prisma } from "../../prisma/client";
import * as recommendationService from "../recommendation/recommendation.service";
import {
  getCategoryPolicy,
  RECOMMENDATION_RULES,
} from "../recommendation/recommendation.config";
import * as forecastService from "../forecast/forecast.service";

const SIMULATION_COST_RULES = {
  fixedCostPerTransfer: 300,
  variableCostPerUnit: 18,
} as const;

export const runSimulation = async (
  organizationId: string,
  days = 30,
  provider?: forecastService.DemandSignalSource,
  modelName?: string
) => {

  const recommendations =
    await recommendationService.generateTransferRecommendations(
      organizationId,
      provider,
      modelName
    );

  const demandContext =
    await forecastService.getDemandSignals(
      organizationId,
      {
        horizonDays: days,
        historyWindowDays: RECOMMENDATION_RULES.velocityWindowDays,
        provider,
        modelName,
      }
    );

  const inventory = await prisma.inventory.findMany({
    where: { organizationId },
    include: {
      store: true,
      sku: true
    }
  });

  const demandSignalMap: Record<
    string,
    (typeof demandContext.signals)[number]
  > = {};

  demandContext.signals.forEach((signal) => {
    demandSignalMap[`${signal.storeId}_${signal.skuId}`] =
      signal;
  });

  const baseline = calculateProjection(
    inventory,
    demandSignalMap,
    days
  );

  const simulatedInventory =
    JSON.parse(JSON.stringify(inventory));
  let transferCost = 0;
  let transferredUnits = 0;
  let transferredInventoryCost = 0;

  recommendations.forEach(rec => {

    const from = simulatedInventory.find(
      (i: any) =>
        i.store.name === rec.moveFrom &&
        i.skuId === rec.skuId
    );

    const to = simulatedInventory.find(
      (i: any) =>
        i.store.name === rec.moveTo &&
        i.skuId === rec.skuId
    );

    if (from) {
      from.unitsSaleable -= rec.quantity;
      transferCost +=
        SIMULATION_COST_RULES.fixedCostPerTransfer +
        rec.quantity * SIMULATION_COST_RULES.variableCostPerUnit;
      transferredUnits += rec.quantity;
      transferredInventoryCost +=
        rec.quantity * (from.sku?.acquisitionCost || 0);
    }
    if (to) to.unitsSaleable += rec.quantity;
  });

  const postTransfer = calculateProjection(
    simulatedInventory,
    demandSignalMap,
    days
  );
  const revenueLiftPct =
    baseline.revenue > 0
      ? Number(
          (
            ((postTransfer.revenue - baseline.revenue) /
              baseline.revenue) *
            100
          ).toFixed(2)
        )
      : 0;
  const marginLiftPct =
    baseline.margin > 0
      ? Number(
          (
            ((postTransfer.margin - baseline.margin) /
              baseline.margin) *
            100
          ).toFixed(2)
        )
      : 0;
  const capitalFreed = Math.max(
    0,
    baseline.deadStockValue - postTransfer.deadStockValue
  );
  const netBenefit = Number(
    (
      (postTransfer.margin - baseline.margin) +
      capitalFreed -
      transferCost
    ).toFixed(0)
  );

  return {
    totalRecommendations: recommendations.length,
    baseline,
    postTransfer,
    uplift: {
      revenueIncrease:
        postTransfer.revenue - baseline.revenue,
      marginIncrease:
        postTransfer.margin - baseline.margin,
      marginImprovementPct:
        Number(
          (
            postTransfer.grossMarginPct -
            baseline.grossMarginPct
          ).toFixed(2)
        ),
      lostSalesRecovered:
        baseline.lostSalesUnits -
        postTransfer.lostSalesUnits,
      deadStockReduction:
        baseline.deadUnits -
        postTransfer.deadUnits,
      deadStockValueRecovered: capitalFreed,
      transferCost: Number(transferCost.toFixed(0)),
      netBenefit,
      transferredUnits,
      transferredInventoryCost: Number(transferredInventoryCost.toFixed(0)),
    },
    planningAssumptions: {
      horizonDays: days,
      velocityWindowDays: demandContext.summary.historyWindowDays,
      coverageDrivenTransfers: true,
      fixedCostPerTransfer: SIMULATION_COST_RULES.fixedCostPerTransfer,
      variableCostPerUnit: SIMULATION_COST_RULES.variableCostPerUnit,
      demandSignalSource: demandContext.summary.source,
      averageDemandConfidence:
        demandContext.summary.averageConfidence,
      modelReadyCoveragePct:
        demandContext.summary.modelReadyCoveragePct,
      modelName,
    },
    summary: {
      recommendedActions: recommendations.length,
      projectedRevenueLiftPct: revenueLiftPct,
      projectedMarginLiftPct: marginLiftPct,
      projectedNetBenefit: netBenefit,
      capitalFreed,
      demandSignalSource: demandContext.summary.source,
      averageDemandConfidence:
        demandContext.summary.averageConfidence,
    }
  };
};

const SIMULATION_MODEL_CHOICES = [
  {
    modelName: "trained_baseline",
    label: "Baseline",
  },
  {
    modelName: "trained_challenger",
    label: "Challenger",
  },
  {
    modelName: "trained_lag_trend",
    label: "Lag Trend",
  },
] as const;

export async function runSimulationComparison(
  organizationId: string,
  days = 30
) {
  const items = await Promise.all(
    SIMULATION_MODEL_CHOICES.map(async (choice) => ({
      modelName: choice.modelName,
      label: choice.label,
      result: await runSimulation(
        organizationId,
        days,
        "external_ml_service",
        choice.modelName
      ),
    }))
  );

  return {
    provider: "external_ml_service" as const,
    comparedModels: items.length,
    items,
  };
}

function calculateProjection(
  inventory: any[],
  demandSignalMap: Record<string, { observedVelocityPerDay: number; planningVelocityPerDay: number; confidence: number }>,
  days: number
) {

  let revenue = 0;
  let margin = 0;
  let deadUnits = 0;
  let lostSalesUnits = 0;
  let deadStockValue = 0;
  let revenueAtRisk = 0;

  for (const item of inventory) {

    const key = `${item.storeId}_${item.skuId}`;
    const demandSignal = demandSignalMap[key];
    const velocity =
      demandSignal?.observedVelocityPerDay || 0;
    const planningVelocity =
      demandSignal?.planningVelocityPerDay || velocity;
    const policy = getCategoryPolicy(item.sku.category);

    const demandUnits =
      planningVelocity > 0
        ? Math.max(planningVelocity * days, 1)
        : 0;

    const sellableUnits =
      Math.min(item.unitsSaleable, demandUnits);

    const unmetDemand =
      demandUnits - sellableUnits;

    if (unmetDemand > 0) {
      lostSalesUnits += unmetDemand;
      revenueAtRisk += unmetDemand * (item.sku.mrp || 0);
    }

    const sellingPrice = item.sku.mrp || 0;
    const cost = item.sku.acquisitionCost || 0;

    const itemRevenue =
      sellableUnits * sellingPrice;

    const itemCost =
      sellableUnits * cost;

    revenue += itemRevenue;
    margin += (itemRevenue - itemCost);

    if (item.stockAgeDays > policy.deadstockThresholdDays) {
      const remainingUnits =
        item.unitsSaleable - sellableUnits;

      if (remainingUnits > 0) {
        deadUnits += remainingUnits;
        deadStockValue +=
          remainingUnits * (item.sku.acquisitionCost || 0);
      }
    }
  }

  const grossMarginPct =
    revenue > 0
      ? Number(
          ((margin / revenue) * 100).toFixed(2)
        )
      : 0;

  return {
    revenue: Number(revenue.toFixed(0)),
    margin: Number(margin.toFixed(0)),
    grossMarginPct,
    deadUnits: Math.floor(deadUnits),
    lostSalesUnits: Math.floor(lostSalesUnits),
    deadStockValue: Number(deadStockValue.toFixed(0)),
    revenueAtRisk: Number(revenueAtRisk.toFixed(0)),
  };
}
