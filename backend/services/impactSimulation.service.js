const { getTransferRecommendations } = require("./recommendation.service");
const { getDeadStockAnalytics } = require("./deadstockAnalytics.service");

function simulateImpact() {

  const analyticsResponse = getDeadStockAnalytics();
  const recResponse = getTransferRecommendations();

  if (!analyticsResponse?.data) {
    return {
      success: true,
      data: {
        currentDeadPercent: 0,
        projectedDeadPercent: 0,
        improvement: 0,
        estimatedRecoveryValue: 0
      },
      meta: { reason: "No analytics data available" }
    };
  }

  const analytics = analyticsResponse.data;
  const recommendations =
    recResponse?.data?.recommendations || [];

  const totalInventoryValue =
    Number(analytics.totalInventoryValue) || 0;

  const totalDeadStockValue =
    Number(analytics.totalDeadStockValue) || 0;

  const currentPercent =
    Number(analytics.deadStockPercent) || 0;

  if (totalInventoryValue === 0) {
    return {
      success: true,
      data: {
        currentDeadPercent: 0,
        projectedDeadPercent: 0,
        improvement: 0,
        estimatedRecoveryValue: 0
      },
      meta: { reason: "Zero inventory value" }
    };
  }

  // 🔹 Calculate Recovery Value
  const reducedDeadValue = recommendations.reduce(
    (sum, rec) =>
      sum + (Number(rec.estimatedRecoveryValue) || 0),
    0
  );

  // 🔹 Prevent negative dead stock
  const newDeadValue = Math.max(
    0,
    totalDeadStockValue - reducedDeadValue
  );

  const newPercent =
    (newDeadValue / totalInventoryValue) * 100;

  const improvement = currentPercent - newPercent;

  return {
    success: true,
    data: {
      currentDeadPercent: Number(currentPercent.toFixed(2)),
      projectedDeadPercent: Number(newPercent.toFixed(2)),
      improvement: Number(improvement.toFixed(2)),
      estimatedRecoveryValue: Math.round(reducedDeadValue)
    },
    meta: {
      recommendationsConsidered: recommendations.length
    }
  };
}

module.exports = { simulateImpact };
