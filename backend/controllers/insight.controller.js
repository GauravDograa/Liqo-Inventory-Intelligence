const { getDeadStockAnalytics } = require("../services/deadstockAnalytics.service");
const { generateExecutiveInsights } = require("../services/executiveInsights.service");

function getInsights(req, res) {
  try {
    const analytics = getDeadStockAnalytics();
    const insights = generateExecutiveInsights(analytics);

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate executive insights",
      error: error.message
    });
  }
}

module.exports = { getInsights };
