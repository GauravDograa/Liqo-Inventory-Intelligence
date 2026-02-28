const inventory = require("../data/inventory.json");
const skuMaster = require("../data/sku_master.json");
const storeMaster = require("../data/store_master.json");
const config = require("../config/config");

function getDeadStockAnalytics() {

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return {
      success: true,
      data: {
        totalInventoryValue: 0,
        totalDeadStockValue: 0,
        deadStockPercent: 0,
        deadStockByCategory: [],
        deadStockByStore: []
      },
      meta: {
        skippedRecords: 0
      }
    };
  }

  // 🔹 Build lookup maps (O(1))
  const skuMap = {};
  const storeMapRef = {};

  skuMaster.forEach(sku => {
    skuMap[String(sku.SKU_ID)] = sku;
  });

  storeMaster.forEach(store => {
    storeMapRef[String(store.Store_ID)] = store;
  });

  let totalInventoryValue = 0;
  let totalDeadStockValue = 0;
  let skippedRecords = 0;

  const categoryMap = {};
  const storeMap = {};

  inventory.forEach(item => {

    const sku = skuMap[String(item.SKU_ID)];
    const store = storeMapRef[String(item.Store_ID)];

    if (!sku || !store) {
      skippedRecords++;
      return;
    }

    const acquisitionCost = Number(sku.Acquisition_Cost) || 0;
    const units = Number(item.Units_Saleable) || 0;
    const ageDays = Number(item.Stock_Age_Days) || 0;

    const totalValue = units * acquisitionCost;
    const isDead = ageDays > config.DEAD_STOCK_DAYS;
    const deadValue = isDead ? totalValue : 0;

    totalInventoryValue += totalValue;
    totalDeadStockValue += deadValue;

    // CATEGORY aggregation
    const category = sku.Category || "UNMAPPED";

    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }
    categoryMap[category] += deadValue;

    // STORE aggregation
    const storeName = store.Store_Name || "UNKNOWN";

    if (!storeMap[storeName]) {
      storeMap[storeName] = 0;
    }
    storeMap[storeName] += deadValue;
  });

  const deadStockPercent =
    totalInventoryValue > 0
      ? (totalDeadStockValue / totalInventoryValue) * 100
      : 0;

  // Convert maps → sorted arrays
  const deadStockByCategory = Object.keys(categoryMap)
    .map(category => ({
      category,
      deadStockValue: Math.round(categoryMap[category])
    }))
    .sort((a, b) => b.deadStockValue - a.deadStockValue);

  const deadStockByStore = Object.keys(storeMap)
    .map(storeName => ({
      storeName,
      deadStockValue: Math.round(storeMap[storeName])
    }))
    .sort((a, b) => b.deadStockValue - a.deadStockValue);

  return {
    success: true,
    data: {
      totalInventoryValue: Math.round(totalInventoryValue),
      totalDeadStockValue: Math.round(totalDeadStockValue),
      deadStockPercent: Number(deadStockPercent.toFixed(2)),
      deadStockByCategory,
      deadStockByStore
    },
    meta: {
      skippedRecords
    }
  };
}

module.exports = { getDeadStockAnalytics };
