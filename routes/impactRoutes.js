const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");

// GET /impact - simple impact page
router.get("/", requireLogin, (req, res) => {
  res.render("impact/index", { 
    title: "Impact", 
    currentUser: req.session.user
  });
});

module.exports = router;
