const express = require("express");
const router = express.Router();
const { dashboardSummary } = require("../controllers/dashboard.controller");

router.get("/summary", dashboardSummary);

module.exports = router;
