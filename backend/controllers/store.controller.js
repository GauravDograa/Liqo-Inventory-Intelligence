const { getStorePerformance } = require("../services/storePerformance.service");

function getStores(req, res) {
  try {
    const result = getStorePerformance();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch store performance",
      error: error.message
    });
  }
}

module.exports = { getStores };
