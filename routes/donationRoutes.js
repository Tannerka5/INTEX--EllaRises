const express = require("express");
const router = express.Router();
const {
  listDonations,
  getNewDonation,
  createDonation
} = require("../controllers/donationController");
const { ensureAuthenticated, ensureManager } = require("../middleware/authMiddleware");

router.get("/", ensureAuthenticated, ensureManager, listDonations);
router.get("/new", ensureAuthenticated, ensureManager, getNewDonation);
router.post("/", ensureAuthenticated, ensureManager, createDonation);

module.exports = router;
