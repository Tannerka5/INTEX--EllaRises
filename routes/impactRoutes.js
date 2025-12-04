const express = require("express");
const router = express.Router();

// GET /impact  – main impact landing page
router.get("/", (req, res) => {
  res.render("impact/index", {
    title: "Our Impact",
    currentUser: req.session ? req.session.user : null
  });
});

// GET /impact/tableau – full Tableau impact dashboard
router.get("/tableau", (req, res) => {
  res.render("impact/tableau", {
    title: "Impact Dashboard",
    currentUser: req.session ? req.session.user : null
  });
});

module.exports = router;
