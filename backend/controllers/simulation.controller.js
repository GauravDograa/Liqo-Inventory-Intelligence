const { simulateImpact } = require("../services/impactSimulation.service");

function getSimulation(req, res) {
  try {
    const result = simulateImpact();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Impact simulation failed",
      error: error.message
    });
  }
}

module.exports = { getSimulation };
