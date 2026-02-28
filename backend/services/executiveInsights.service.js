function generateExecutiveInsights(analyticsResponse) {

  if (!analyticsResponse || !analyticsResponse.data) {
    return {
      success: true,
      data: [],
      meta: {
        reason: "No analytics data provided"
      }
    };
  }

  const analytics = analyticsResponse.data;
  const insights = [];

  const deadStockPercent = Number(analytics.deadStockPercent) || 0;
  const deadStockByStore = analytics.deadStockByStore || [];
  const deadStockByCategory = analytics.deadStockByCategory || [];

  // 1️⃣ High Dead Stock Warning
  if (deadStockPercent > 35) {
    insights.push(
      `Dead stock is critically high at ${deadStockPercent.toFixed(
        1
      )}%. Immediate redistribution or liquidation strategy recommended.`
    );
  }

  // 2️⃣ Highest Risk Store
  if (deadStockByStore.length > 0) {
    const highestStore = deadStockByStore
      .sort((a, b) => b.deadStockValue - a.deadStockValue)[0];

    insights.push(
      `Store ${highestStore.storeName} holds the highest dead inventory value (₹ ${highestStore.deadStockValue.toLocaleString()}). Focus action here first.`
    );
  }

  // 3️⃣ Highest Risk Category
  if (deadStockByCategory.length > 0) {
    const highestCategory = deadStockByCategory
      .sort((a, b) => b.deadStockValue - a.deadStockValue)[0];

    insights.push(
      `${highestCategory.category} category contributes the most to dead stock (₹ ${highestCategory.deadStockValue.toLocaleString()}).`
    );
  }

  return {
    success: true,
    data: insights,
    meta: {
      insightCount: insights.length
    }
  };
}

module.exports = { generateExecutiveInsights };
