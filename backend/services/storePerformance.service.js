const stores = require("../data/store_master.json");
const transactions = require("../data/transactions.json");

function getStorePerformance() {

  if (!Array.isArray(stores) || stores.length === 0) {
    return {
      success: true,
      data: [],
      meta: { reason: "No store master data found" }
    };
  }

  const storePerformance = {};
  let skippedTransactions = 0;

  // 🔹 Initialize store objects
  stores.forEach(store => {

    const storeId = String(store.Store_ID);

    storePerformance[storeId] = {
      storeId: store.Store_ID,
      storeName: store.Store_Name,
      storeSize: Number(store.Store_Size_sqft) || 0,
      employees: Number(store.Employees) || 0,
      totalRevenue: 0,
      totalCOGS: 0,
      totalGrossProfit: 0,
      grossMargin: 0,
      revenuePerSqft: 0,
      revenuePerEmployee: 0,
      transactionCount: 0
    };
  });

  // 🔹 Aggregate transactions
  transactions.forEach(tx => {

    const storeId = String(tx.Store_ID);
    const revenue = Number(tx.Net_Revenue) || 0;
    const cogs = Number(tx.COGS) || 0;

    if (!storePerformance[storeId]) {
      skippedTransactions++;
      return;
    }

    storePerformance[storeId].totalRevenue += revenue;
    storePerformance[storeId].totalCOGS += cogs;
    storePerformance[storeId].transactionCount += 1;
  });

  // 🔹 Final Calculations
  Object.values(storePerformance).forEach(store => {

    store.totalGrossProfit =
      store.totalRevenue - store.totalCOGS;

    store.grossMargin =
      store.totalRevenue > 0
        ? (store.totalGrossProfit / store.totalRevenue) * 100
        : 0;

    store.revenuePerSqft =
      store.storeSize > 0
        ? store.totalRevenue / store.storeSize
        : 0;

    store.revenuePerEmployee =
      store.employees > 0
        ? store.totalRevenue / store.employees
        : 0;

    // 🔹 Round values
    store.totalRevenue = Math.round(store.totalRevenue);
    store.totalGrossProfit = Math.round(store.totalGrossProfit);
    store.grossMargin = Number(store.grossMargin.toFixed(2));
    store.revenuePerSqft = Math.round(store.revenuePerSqft);
    store.revenuePerEmployee = Math.round(store.revenuePerEmployee);
  });

  // 🔹 Rank by revenue
  const data = Object.values(storePerformance)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // 🔹 Global validation totals
  const totalRevenueAllStores = data.reduce(
    (sum, s) => sum + s.totalRevenue,
    0
  );

  const totalTransactionsAllStores = data.reduce(
    (sum, s) => sum + s.transactionCount,
    0
  );

  return {
    success: true,
    data,
    meta: {
      totalStores: data.length,
      totalRevenueAllStores,
      totalTransactionsAllStores,
      skippedTransactions
    }
  };
}

module.exports = { getStorePerformance };
