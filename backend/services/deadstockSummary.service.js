const inventory = require("../data/inventory.json");
const skuMaster = require("../data/sku_master.json");
const storeMaster = require("../data/store_master.json");
const config = require("../config/config");

function calculateDeadStockSummary() {

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return {
      success: true,
      data: [],
      meta: {
        totalStores: 0,
        totalInventoryValue: 0,
        totalDeadStockValue: 0,
        skippedRecords: 0
      }
    };
  }

  // 🔹 Build lookup maps (O(1) access)
  const skuMap = {};
  const storeMapRef = {};

  skuMaster.forEach(sku => {
    skuMap[String(sku.SKU_ID)] = sku;
  });

  storeMaster.forEach(store => {
    storeMapRef[String(store.Store_ID)] = store;
  });

  const storeAggregation = {};
  let totalInventoryValue = 0;
  let totalDeadStockValue = 0;
  let skippedRecords = 0;

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

    const storeName = store.Store_Name;

    if (!storeAggregation[storeName]) {
      storeAggregation[storeName] = {
        totalValue: 0,
        deadValue: 0
      };
    }

    storeAggregation[storeName].totalValue += totalValue;
    storeAggregation[storeName].deadValue += deadValue;

    totalInventoryValue += totalValue;
    totalDeadStockValue += deadValue;
  });

  const data = Object.keys(storeAggregation).map(storeName => {

    const total = storeAggregation[storeName].totalValue;
    const dead = storeAggregation[storeName].deadValue;

    const percent =
      total > 0
        ? (dead / total) * 100
        : 0;

    return {
      storeName,
      totalInventoryValue: Math.round(total),
      deadStockValue: Math.round(dead),
      deadStockPercent: Number(percent.toFixed(2))
    };
  });

  // Sort by dead stock value descending
  data.sort((a, b) => b.deadStockValue - a.deadStockValue);

  return {
    success: true,
    data,
    meta: {
      totalStores: data.length,
      totalInventoryValue: Math.round(totalInventoryValue),
      totalDeadStockValue: Math.round(totalDeadStockValue),
      overallDeadStockPercent:
        totalInventoryValue > 0
          ? Number(((totalDeadStockValue / totalInventoryValue) * 100).toFixed(2))
          : 0,
      skippedRecords
    }
  };
}

module.exports = { calculateDeadStockSummary };
