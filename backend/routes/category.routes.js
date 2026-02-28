const express = require("express");
const router = express.Router();
const { getCategoryPerformance } = require("../services/category.service");

router.get("/performance", (req, res) => {
  res.json(getCategoryPerformance());
});

module.exports = router;
