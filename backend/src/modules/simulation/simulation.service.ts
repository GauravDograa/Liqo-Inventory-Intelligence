import { prisma } from "../../prisma/client";
import * as recommendationService from "../recommendation/recommendation.service";
import * as velocityService from "../velocity/velocity.service";

export const runSimulation = async (
  organizationId: string,
  days = 30
) => {

  const recommendations =
    await recommendationService.generateTransferRecommendations(
      organizationId
    );

  const velocityData =
    await velocityService.getVelocity(
      organizationId,
      500
    );

  const inventory = await prisma.inventory.findMany({
    where: { organizationId },
    include: {
      store: true,
      sku: true
    }
  });

  const velocityMap: Record<string, number> = {};

  velocityData.forEach(v => {
    velocityMap[`${v.storeId}_${v.skuId}`] =
      v.velocityPerDay;
  });

  const baseline = calculateProjection(
    inventory,
    velocityMap,
    days
  );

  const simulatedInventory =
    JSON.parse(JSON.stringify(inventory));

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

    if (from) from.unitsSaleable -= rec.quantity;
    if (to) to.unitsSaleable += rec.quantity;
  });

  const postTransfer = calculateProjection(
    simulatedInventory,
    velocityMap,
    days
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
        postTransfer.deadUnits
    }
  };
};

function calculateProjection(
  inventory: any[],
  velocityMap: Record<string, number>,
  days: number
) {

  let revenue = 0;
  let margin = 0;
  let deadUnits = 0;
  let lostSalesUnits = 0;

  for (const item of inventory) {

    const key = `${item.storeId}_${item.skuId}`;
    const velocity = velocityMap[key] || 0;

    const demandUnits =
      Math.max(velocity * days * 2, 5);

    const sellableUnits =
      Math.min(item.unitsSaleable, demandUnits);

    const unmetDemand =
      demandUnits - sellableUnits;

    if (unmetDemand > 0) {
      lostSalesUnits += unmetDemand;
    }

    const sellingPrice = item.sku.mrp || 0;
    const cost = item.sku.acquisitionCost || 0;

    const itemRevenue =
      sellableUnits * sellingPrice;

    const itemCost =
      sellableUnits * cost;

    revenue += itemRevenue;
    margin += (itemRevenue - itemCost);

    if (item.stockAgeDays > 90) {
      const remainingUnits =
        item.unitsSaleable - sellableUnits;

      if (remainingUnits > 0) {
        deadUnits += remainingUnits;
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
    lostSalesUnits: Math.floor(lostSalesUnits)
  };
}