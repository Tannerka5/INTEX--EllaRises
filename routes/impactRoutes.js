const express = require("express");
const router = express.Router();
const { getImpactPage } = require("../controllers/impactController");

router.get("/", getImpactPage);

module.exports = router;
