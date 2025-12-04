const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");

/* ---------------------------
   GET /users (index) - Manager only
   --------------------------- */
router.get("/", requireLogin, requireManager, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, full_name, email, role, participantid
      FROM users
      ORDER BY full_name;
    `);

    res.render("users/index", {
      title: "Users",
      currentUser: req.session.user,
      users: result.rows,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load users.");
    res.redirect("/dashboard");
  }
});

/* ---------------------------
   GET /users/new - Manager only
   --------------------------- */
router.get("/new", requireLogin, requireManager, async (req, res) => {
  try {
    const participants = await db.query(`
      SELECT participantid, participantfirstname, participantlastname, participantdob
      FROM participant
      ORDER BY participantlastname, participantfirstname;
    `);

    res.render("users/new", {
      title: "Add User",
      currentUser: req.session.user,
      participants: participants.rows,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load form.");
    res.redirect("/users");
  }
});

/* ---------------------------
   POST /users - Manager only
   --------------------------- */
router.post("/", requireLogin, requireManager, async (req, res) => {
  try {
    const { full_name, email, password, role, participantid } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO users (full_name, email, password, role, participantid)
      VALUES ($1, $2, $3, $4, $5);
      `,
      [full_name, email, hashedPassword, role, participantid || null]
    );

    req.flash("success", "User created successfully.");
    res.redirect("/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to create user.");
    res.redirect("/users/new");
  }
});

/* ---------------------------
   GET /users/:id (show) - Manager only
   --------------------------- */
router.get("/:id", requireLogin, requireManager, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, full_name, email, role, participantid
      FROM users
      WHERE id = $1;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      req.flash("error", "User not found.");
      return res.redirect("/users");
    }

    res.render("users/show", {
      title: "User Details",
      currentUser: req.session.user,
      user: result.rows[0],
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load user.");
    res.redirect("/users");
  }
});

/* ---------------------------
   PUT /users/:id (update) - Manager only
   --------------------------- */
router.put("/:id", requireLogin, requireManager, async (req, res) => {
  try {
    const { full_name, email, role } = req.body;

    await db.query(
      `
      UPDATE users
      SET full_name = $1, email = $2, role = $3
      WHERE id = $4;
      `,
      [full_name, email, role, req.params.id]
    );

    req.flash("success", "User updated successfully.");
    res.redirect(`/users/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to update user.");
    res.redirect(`/users/${req.params.id}`);
  }
});

/* ---------------------------
   DELETE /users/:id - Manager only
   --------------------------- */
router.delete("/:id", requireLogin, requireManager, async (req, res) => {
  try {
    await db.query(
      `
      DELETE FROM users
      WHERE id = $1;
      `,
      [req.params.id]
    );

    req.flash("success", "User deleted.");
    res.redirect("/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to delete user.");
    res.redirect("/users");
  }
});

module.exports = router;
