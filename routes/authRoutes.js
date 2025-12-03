const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// GET /login
router.get("/login", (req, res) => {
  res.render("auth/login", { 
    title: "Login", 
    error: req.flash("error"),
    success: req.flash("success"),
    currentUser: req.session.user || null 
  });
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    
    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }
    
    req.session.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    };
    
    // Redirect based on role
    if (user.role === "Manager") {
      return res.redirect("/dashboard/admin");
    } else {
      return res.redirect("/dashboard/user");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "An error occurred");
    res.redirect("/login");
  }
});

// GET /register
router.get("/register", (req, res) => {
  res.render("auth/register", { 
    title: "Register", 
    error: req.flash("error"),
    success: req.flash("success"),
    currentUser: req.session.user || null 
  });
});

// POST /register
router.post("/register", async (req, res) => {
  const { email, password, confirm_password, role, full_name } = req.body;
  
  try {
    // Check passwords match
    if (password !== confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }
    
    // Check password length
    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }
    
    // Check if user exists
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      req.flash("error", "Email already exists");
      return res.redirect("/register");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (email, password, role, full_name, created_date) VALUES ($1, $2, $3, $4, NOW())",
      [email, hashedPassword, role || "User", full_name]
    );
    
    req.flash("success", "Registration successful. Please login.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "An error occurred");
    res.redirect("/register");
  }
});

// POST /logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
