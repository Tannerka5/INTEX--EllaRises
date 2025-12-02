const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");

// LIST
router.get("/", eventController.list);

// NEW
router.get("/new", eventController.newForm);
router.post("/new", eventController.create);

// EDIT
router.get("/:id/edit", eventController.editForm);
router.post("/:id/edit", eventController.update);

// DELETE
router.post("/:id/delete", eventController.delete);

module.exports = router;