import * as repo from "./recommendation.repository";
import * as velocityService from "../velocity/velocity.service";

export const generateTransferRecommendations = async (
  organizationId: string,
  days = 30
) => {

  console.log("=== GENERATE RECOMMENDATIONS START ===");
  console.log("Days used:", days);

  const velocityData = await velocityService.getVelocity(
    organizationId,
    days
  );

  console.log("Velocity count:", velocityData.length);
  console.log("Velocity sample:", velocityData.slice(0, 5));

  const inventory = await repo.getInventoryWithStoreAndSku(
    organizationId
  );

  console.log("Inventory count:", inventory.length);

  const skuVelocityMap: Record<string, any[]> = {};

  // Build SKU → store velocity map
  velocityData.forEach(v => {
    if (!skuVelocityMap[v.skuId]) {
      skuVelocityMap[v.skuId] = [];
    }
    skuVelocityMap[v.skuId].push(v);
  });

  // 🔍 Debug: Check how many stores per SKU
  for (const skuId in skuVelocityMap) {
    console.log(
      "SKU:",
      skuId,
      "Store count:",
      skuVelocityMap[skuId].length,
      "Velocities:",
      skuVelocityMap[skuId].map(v => v.velocityPerDay)
    );
  }

  const recommendations: any[] = [];

  for (const skuId in skuVelocityMap) {

    const skuStores = skuVelocityMap[skuId];

    // 🚨 If only one store has velocity, skip
    if (skuStores.length < 2) {
      console.log("Skipping SKU (only 1 store):", skuId);
      continue;
    }

    // Sort by velocity descending
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
        console.log("Missing inventory for SKU:", skuId);
        left++;
        right--;
        continue;
      }

      const desiredStock = Math.max(
        Math.ceil(demand.velocityPerDay * 60),
        8
      );

      const deficit =
        desiredStock - demandInventory.unitsSaleable;

      console.log({
        skuId,
        demandStore: demandInventory.store.name,
        surplusStore: surplusInventory.store.name,
        velocity: demand.velocityPerDay,
        units: demandInventory.unitsSaleable,
        desiredStock,
        deficit
      });

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

        console.log("Recommendation created:", {
          skuId,
          from: surplusInventory.store.name,
          to: demandInventory.store.name,
          qty: transferQty
        });
      }

      left++;
      right--;
    }
  }

  console.log("Total recommendations:", recommendations.length);
  console.log("=== GENERATE RECOMMENDATIONS END ===");

  return recommendations;
};