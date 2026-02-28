const { getTransferRecommendations } = require("../services/recommendation.service");

function transferRecommendations(req, res) {
  try {
    const result = getTransferRecommendations();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfer recommendations",
      error: error.message
    });
  }
}

module.exports = { transferRecommendations };
