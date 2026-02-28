const { getDashboardSummary } = require("../services/dashboard.service");

function dashboardSummary(req, res) {
  try {
    const result = getDashboardSummary();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message
    });
  }
}

module.exports = { dashboardSummary };
