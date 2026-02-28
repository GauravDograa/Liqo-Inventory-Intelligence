const express = require("express");
const router = express.Router();
const { getStores } = require("../controllers/store.controller");

router.get("/", getStores);

module.exports = router;
