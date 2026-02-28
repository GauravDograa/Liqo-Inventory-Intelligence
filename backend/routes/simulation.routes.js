const express = require("express");
const router = express.Router();
const { getSimulation } = require("../controllers/simulation.controller");

router.get("/", getSimulation);

module.exports = router;
