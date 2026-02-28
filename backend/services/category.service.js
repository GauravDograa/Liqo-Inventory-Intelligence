const transactions = require("../data/transactions.json");

function getCategoryPerformance() {

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      success: true,
      data: [],
      meta: {
        totalTransactions: 0,
        categoryCount: 0
      }
    };
  }

  const categoryMap = {};
  let totalTransactions = 0;
  let skippedRecords = 0;

  transactions.forEach(tx => {

    if (!tx || !tx.Category) {
      skippedRecords++;
      return;
    }

    const category = String(tx.Category).trim();
    const revenue = Number(tx.Net_Revenue) || 0;
    const cogs = Number(tx.COGS) || 0;

    if (!categoryMap[category]) {
      categoryMap[category] = {
        totalRevenue: 0,
        totalCOGS: 0,
        transactionCount: 0
      };
    }

    categoryMap[category].totalRevenue += revenue;
    categoryMap[category].totalCOGS += cogs;
    categoryMap[category].transactionCount += 1;

    totalTransactions++;
  });

  const data = Object.keys(categoryMap).map(category => {

    const totalRevenue = categoryMap[category].totalRevenue;
    const totalCOGS = categoryMap[category].totalCOGS;
    const grossProfit = totalRevenue - totalCOGS;

    const grossMargin =
      totalRevenue > 0
        ? (grossProfit / totalRevenue) * 100
        : 0;

    return {
      category,
      totalRevenue: Math.round(totalRevenue),
      totalGrossProfit: Math.round(grossProfit),
      grossMargin: Number(grossMargin.toFixed(2)),
      transactionCount: categoryMap[category].transactionCount
    };
  });

  data.sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    success: true,
    data,
    meta: {
      totalTransactions,
      categoryCount: data.length,
      skippedRecords
    }
  };
}

module.exports = { getCategoryPerformance };
