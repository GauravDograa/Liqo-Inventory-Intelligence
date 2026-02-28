const inventory = require("../data/inventory.json");
const transactions = require("../data/transactions.json");
const skuMaster = require("../data/sku_master.json");
const config = require("../config/config");

function getTransferRecommendations() {

  if (!Array.isArray(inventory) || !Array.isArray(transactions)) {
    return {
      success: true,
      data: {
        summary: {},
        recommendations: []
      },
      meta: { reason: "Invalid data sources" }
    };
  }

  const recommendations = [];

  // 🔹 STEP 1 — Build SKU lookup map
  const skuMap = {};
  skuMaster.forEach(sku => {
    skuMap[String(sku.SKU_ID)] = sku;
  });

  // 🔹 STEP 2 — Build Sales Map (Store + SKU)
  const salesMap = {};

  transactions.forEach(tx => {

    const store = String(tx.Store_ID);
    const sku = String(tx.SKU_ID);
    const quantity = Number(tx.Quantity) || 1; // safer if Quantity exists

    if (!salesMap[store]) salesMap[store] = {};
    if (!salesMap[store][sku]) salesMap[store][sku] = 0;

    salesMap[store][sku] += quantity;
  });

  // 🔹 STEP 3 — Identify Dead Stock
  const deadItems = inventory.filter(item =>
    Number(item.Stock_Age_Days) > config.DEAD_STOCK_DAYS &&
    Number(item.Units_Saleable) > 0
  );

  let skippedItems = 0;

  deadItems.forEach(item => {

    const deadStore = String(item.Store_ID);
    const sku = String(item.SKU_ID);
    const unsoldUnits = Number(item.Units_Saleable) || 0;
    const stockAge = Number(item.Stock_Age_Days) || 0;

    const skuInfo = skuMap[sku];

    if (!skuInfo) {
      skippedItems++;
      return;
    }

    const acquisitionCost = Number(skuInfo.Acquisition_Cost) || 0;

    Object.keys(salesMap).forEach(targetStore => {

      if (targetStore === deadStore) return;

      const totalSales =
        salesMap[targetStore] &&
        salesMap[targetStore][sku]
          ? salesMap[targetStore][sku]
          : 0;

      if (totalSales <= 0) return;

      const avgMonthlySales =
        totalSales / (config.DATA_MONTHS || 1);

      if (avgMonthlySales <= config.DEMAND_THRESHOLD) return;

      const suggestedUnits = Math.min(
        unsoldUnits,
        Math.ceil(avgMonthlySales * 1.5)
      );

      const estimatedRecoveryValue =
        suggestedUnits * acquisitionCost;

      const impactScore =
        avgMonthlySales * unsoldUnits;

      const severity =
        stockAge > config.CRITICAL_DAYS ? "Critical" :
        stockAge > config.HIGH_RISK_DAYS ? "High" :
        "Moderate";

      recommendations.push({
        fromStore: deadStore,
        toStore: targetStore,
        sku,
        category: skuInfo.Category || "UNMAPPED",
        stockAgeDays: stockAge,
        unsoldUnits,
        avgMonthlyDemand: Number(avgMonthlySales.toFixed(1)),
        suggestedTransferUnits: suggestedUnits,
        estimatedRecoveryValue: Math.round(estimatedRecoveryValue),
        impactScore,
        severity
      });
    });
  });

  // 🔹 STEP 4 — Rank & Limit
  recommendations.sort((a, b) => b.impactScore - a.impactScore);

  const topRecommendations = recommendations.slice(0, 20);

  const totalRecovery = topRecommendations.reduce(
    (sum, r) => sum + r.estimatedRecoveryValue,
    0
  );

  const criticalCount = topRecommendations.filter(
    r => r.severity === "Critical"
  ).length;

  return {
    success: true,
    data: {
      summary: {
        totalRecommendations: recommendations.length,
        top20Count: topRecommendations.length,
        estimatedRecoveryValue: Math.round(totalRecovery),
        criticalCases: criticalCount
      },
      recommendations: topRecommendations
    },
    meta: {
      deadItemsAnalyzed: deadItems.length,
      skippedItems
    }
  };
}

module.exports = { getTransferRecommendations };
