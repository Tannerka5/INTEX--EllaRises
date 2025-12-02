const express = require("express");
const router = express.Router();
const {
  listSurveys,
  getNewSurvey,
  createSurvey
} = require("../controllers/surveyController");
const { ensureAuthenticated, ensureManager } = require("../middleware/authMiddleware");

router.get("/", ensureAuthenticated, listSurveys);
router.get("/new", ensureAuthenticated, ensureManager, getNewSurvey);
router.post("/", ensureAuthenticated, ensureManager, createSurvey);

module.exports = router;
