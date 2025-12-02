const express = require("express");
const router = express.Router();
const {
  listMilestones,
  getNewMilestone,
  createMilestone,
  getEditMilestone,
  updateMilestone,
  deleteMilestone
} = require("../controllers/milestoneController");
const { ensureAuthenticated, ensureManager } = require("../middleware/authMiddleware");

router.get("/", ensureAuthenticated, listMilestones);
router.get("/new", ensureAuthenticated, ensureManager, getNewMilestone);
router.post("/", ensureAuthenticated, ensureManager, createMilestone);
router.get("/:id/edit", ensureAuthenticated, ensureManager, getEditMilestone);
router.put("/:id", ensureAuthenticated, ensureManager, updateMilestone);
router.delete("/:id", ensureAuthenticated, ensureManager, deleteMilestone);

module.exports = router;
