const { getDeadStockAnalytics } = require("./deadstockAnalytics.service");
const { getTransferRecommendations } = require("./recommendation.service");

function getDashboardSummary() {

  let deadstock = {};
  let transferData = {};

  try {
    deadstock = getDeadStockAnalytics() || {};
  } catch (error) {
    deadstock = { error: "Deadstock service failed" };
  }

  try {
    transferData = getTransferRecommendations() || {};
  } catch (error) {
    transferData = { error: "Recommendation service failed" };
  }

  return {
    success: true,
    data: {
      deadstockSummary: deadstock,
      transferSummary: transferData.summary || {},
      topTransfers: transferData.recommendations || []
    },
    meta: {
      generatedAt: new Date().toISOString(),
      modules: {
        deadstockLoaded: !!deadstock,
        recommendationsLoaded: !!transferData
      }
    }
  };
}

module.exports = { getDashboardSummary };
