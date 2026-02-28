const express = require("express");
const router = express.Router();

const {
  deadStockSummary,
  deadStockAnalytics
} = require("../controllers/deadstock.controller");

// Dead stock summary
router.get("/summary", deadStockSummary);

// Dead stock analytics
router.get("/analytics", deadStockAnalytics);

module.exports = router;
