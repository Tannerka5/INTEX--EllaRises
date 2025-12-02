const express = require("express");
const router = express.Router();
const {
  listParticipants,
  getNewParticipant,
  createParticipant,
  getEditParticipant,
  updateParticipant,
  deleteParticipant
} = require("../controllers/participantController");
const { ensureAuthenticated, ensureManager } = require("../middleware/authMiddleware");

router.get("/", ensureAuthenticated, listParticipants);
router.get("/new", ensureAuthenticated, ensureManager, getNewParticipant);
router.post("/", ensureAuthenticated, ensureManager, createParticipant);
router.get("/:id/edit", ensureAuthenticated, ensureManager, getEditParticipant);
router.put("/:id", ensureAuthenticated, ensureManager, updateParticipant);
router.delete("/:id", ensureAuthenticated, ensureManager, deleteParticipant);

module.exports = router;
