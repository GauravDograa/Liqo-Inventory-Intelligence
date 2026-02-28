const { calculateDeadStockSummary } = require("../services/deadstockSummary.service");
const { getDeadStockAnalytics } = require("../services/deadstockAnalytics.service");

function deadStockSummary(req, res) {
  try {
    const result = calculateDeadStockSummary();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dead stock summary",
      error: error.message
    });
  }
}

function deadStockAnalytics(req, res) {
  try {
    const result = getDeadStockAnalytics();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dead stock analytics",
      error: error.message
    });
  }
}

module.exports = {
  deadStockSummary,
  deadStockAnalytics
};
