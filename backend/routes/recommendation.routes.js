const express = require("express");
const router = express.Router();
const { transferRecommendations } = require("../controllers/recommendation.controller");

router.get("/", transferRecommendations);

module.exports = router;
