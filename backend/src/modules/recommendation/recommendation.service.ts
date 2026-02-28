import * as repo from "./recommendation.repository";
import * as velocityService from "../velocity/velocity.service";

export const generateTransferRecommendations = async (
  organizationId: string,
  days = 500
) => {

  const velocityData = await velocityService.getVelocity(
    organizationId,
    days
  );

  const inventory = await repo.getInventoryWithStoreAndSku(
    organizationId
  );

  const skuVelocityMap: Record<string, any[]> = {};

  velocityData.forEach(v => {
    if (!skuVelocityMap[v.skuId]) {
      skuVelocityMap[v.skuId] = [];
    }
    skuVelocityMap[v.skuId].push(v);
  });

  const recommendations: any[] = [];

  for (const skuId in skuVelocityMap) {

    const skuStores = skuVelocityMap[skuId];

    if (skuStores.length < 2) continue;

    skuStores.sort((a, b) => b.velocityPerDay - a.velocityPerDay);

    let left = 0;
    let right = skuStores.length - 1;

    while (left < right) {

      const demand = skuStores[left];
      const surplus = skuStores[right];

      if (demand.storeId === surplus.storeId) {
        right--;
        continue;
      }

      const demandInventory = inventory.find(
        i => i.storeId === demand.storeId && i.skuId === skuId
      );

      const surplusInventory = inventory.find(
        i => i.storeId === surplus.storeId && i.skuId === skuId
      );

      if (!demandInventory || !surplusInventory) {
        left++;
        right--;
        continue;
      }

      const desiredStock = Math.max(
        Math.ceil(demand.velocityPerDay * 30),
        8
      );

      const deficit =
        desiredStock - demandInventory.unitsSaleable;

      if (deficit <= 0) {
        left++;
        continue;
      }

      if (surplusInventory.unitsSaleable <= 5) {
        right--;
        continue;
      }

      const transferQty = Math.min(
        surplusInventory.unitsSaleable,
        deficit
      );

      if (transferQty > 0) {

        recommendations.push({
          skuCategory: demandInventory.sku.category,
          skuId,
          moveFrom: surplusInventory.store.name,
          moveTo: demandInventory.store.name,
          quantity: transferQty,
          reason: "Velocity imbalance",
          impact: {
            demandCoverageDays: Number(
              (
                transferQty /
                (demand.velocityPerDay || 0.01)
              ).toFixed(1)
            )
          }
        });

        demandInventory.unitsSaleable += transferQty;
        surplusInventory.unitsSaleable -= transferQty;
      }

      left++;
      right--;
    }
  }

  return recommendations;
};