const express = require("express");
const router = express.Router();
const { adminDashboard, userDashboard } = require("../controllers/dashboardController");
const { ensureAuthenticated, ensureManager } = require("../middleware/authMiddleware");

router.get("/admin", ensureAuthenticated, ensureManager, adminDashboard);
router.get("/user", ensureAuthenticated, userDashboard);

module.exports = router;
