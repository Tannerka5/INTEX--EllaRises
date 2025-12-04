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
    const result = await db.query(`
      SELECT id, email, password, role, full_name, participantid
      FROM users
      WHERE email = $1
    `, [email]);
    
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
      role: user.role,
      participantid: user.participantid
    };

    return res.render("auth/login-success");

  } catch (err) {
    console.log(err);
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
    if (password !== confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }

    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      req.flash("error", "Email already exists");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Create participant record for this user
const participantInsert = await db.query(
  `INSERT INTO participant (
     participantid,
     participantemail,
     participantfirstname,
     participantlastname
   ) VALUES (
     (SELECT COALESCE(MAX(participantid), 0) + 1 FROM participant),
     $1, $2, $3
   ) RETURNING participantid`,
  [
    email,
    full_name.split(" ")[0],            // first name guess
    full_name.split(" ").slice(1).join(" ") || "" // last name guess
  ]
);

const participantid = participantInsert.rows[0].participantid;

// 2️⃣ Create user linked to participant
const userInsert = await db.query(
  `INSERT INTO users (
     email, password, role, full_name, participantid, created_date
   ) VALUES ($1, $2, $3, $4, $5, NOW())
   RETURNING *`,
  [email, hashedPassword, role || "User", full_name, participantid]
);

const user = userInsert.rows[0];

// 3️⃣ Store participantid in session
req.session.user = {
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
  participantid: user.participantid
};

    return res.render("auth/login-success");

  } catch (err) {
    console.log(err);
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