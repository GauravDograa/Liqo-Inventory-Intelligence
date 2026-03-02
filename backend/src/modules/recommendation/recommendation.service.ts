import * as repo from "./recommendation.repository";

export const generateTransferRecommendations = async (
  organizationId: string
) => {

  console.log("=== GENERATE RECOMMENDATIONS START ===");

  const inventory = await repo.getInventoryWithStoreAndSku(
    organizationId
  );

  console.log("Inventory count:", inventory.length);

  const recommendations: any[] = [];

  // Group inventory by SKU
  const skuMap: Record<string, any[]> = {};

  inventory.forEach(item => {
    if (!skuMap[item.skuId]) {
      skuMap[item.skuId] = [];
    }
    skuMap[item.skuId].push(item);
  });

  for (const skuId in skuMap) {

    const skuInventory = skuMap[skuId];

    // Skip if SKU exists in only one store
    if (skuInventory.length < 2) continue;

    // Calculate average stock across stores
    const totalUnits = skuInventory.reduce(
      (sum, i) => sum + i.unitsSaleable,
      0
    );

    const avgUnits = totalUnits / skuInventory.length;

    console.log("SKU:", skuId, "Avg units:", avgUnits);

    // Sort stores by stock descending
    skuInventory.sort(
      (a, b) => b.unitsSaleable - a.unitsSaleable
    );

    let left = 0; // surplus pointer
    let right = skuInventory.length - 1; // deficit pointer

    while (left < right) {

      const surplusStore = skuInventory[left];
      const deficitStore = skuInventory[right];

      const surplusQty =
        surplusStore.unitsSaleable - avgUnits;

      const deficitQty =
        avgUnits - deficitStore.unitsSaleable;

      if (surplusQty <= 0) {
        left++;
        continue;
      }

      if (deficitQty <= 0) {
        right--;
        continue;
      }

      const transferQty = Math.min(
        Math.floor(surplusQty),
        Math.floor(deficitQty)
      );

      if (transferQty <= 0) {
        left++;
        right--;
        continue;
      }

      recommendations.push({
        skuCategory: surplusStore.sku.category,
        skuId,
        moveFrom: surplusStore.store.name,
        moveTo: deficitStore.store.name,
        quantity: transferQty,
        reason: "Stock imbalance across stores",
        impact: {
          imbalanceBefore: Math.abs(
            surplusStore.unitsSaleable -
            deficitStore.unitsSaleable
          )
        }
      });

      console.log("Transfer created:", {
        skuId,
        from: surplusStore.store.name,
        to: deficitStore.store.name,
        qty: transferQty
      });

      // Simulate transfer
      surplusStore.unitsSaleable -= transferQty;
      deficitStore.unitsSaleable += transferQty;

      left++;
      right--;
    }
  }

  console.log("Total recommendations:", recommendations.length);
  console.log("=== GENERATE RECOMMENDATIONS END ===");

  return recommendations;
};