const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const { requireManager } = require("../middleware/authMiddleware");

function isSuperManager(user) {
  return user && user.id === 1;
}

/* ----------------------------------------------
   GET /users — User Maintenance homepage
---------------------------------------------- */
router.get("/", requireManager, async (req, res) => {
  const users = await db.query(`
    SELECT id, email, full_name, role, created_date
    FROM users
    ORDER BY id ASC
  `);

  res.render("users/index", {
    title: "User Maintenance",
    users: users.rows,
    currentUser: req.session.user,
    superManager: isSuperManager(req.session.user),
    success: req.flash("success"),
    error: req.flash("error")
  });
});

/* ----------------------------------------------
   GET /users/new — New user form
---------------------------------------------- */
router.get("/new", requireManager, async (req, res) => {
  try {
    const participants = await db.query(`
      SELECT participantid, participantfirstname, participantlastname, participantdob
      FROM participant
      ORDER BY participantlastname ASC
    `);

    res.render("users/new", {
      title: "Add User",
      currentUser: req.session.user,
      superManager: isSuperManager(req.session.user),
      error: req.flash("error"),
      success: req.flash("success"),
      participants: participants.rows
    });
  } catch (err) {
    console.error("Error loading participants:", err);
    req.flash("error", "Could not load participant list");
    res.redirect("/users");
  }
});


/* ----------------------------------------------
   POST /users/new — Create a new user
---------------------------------------------- */
router.post("/new", requireManager, async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Validate email uniqueness
    const existing = await db.query(`SELECT id FROM users WHERE email=$1`, [email]);
    if (existing.rowCount > 0) {
      req.flash("error", "Email already exists");
      return res.redirect("/users/new");
    }

    // Managers cannot assign Manager role unless super manager
    let userRole = "User";
    if (isSuperManager(req.session.user) && role === "Manager") {
      userRole = "Manager";
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (full_name, email, password, role, created_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [full_name, email, hash, userRole]
    );

    req.flash("success", "User created successfully");
    res.redirect("/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create user");
    res.redirect("/users/new");
  }
});

/* ----------------------------------------------
   POST /users/:id/edit-inline — Inline editing
---------------------------------------------- */
router.post("/:id/edit-inline", requireManager, async (req, res) => {
  try {
    const { full_name, email, role, password } = req.body;
    const id = parseInt(req.params.id);
    const current = req.session.user;
    const isSuper = current.id === 1;

    console.log("=== /users/:id/edit-inline HIT ===");
    console.log("Params id:", id);
    console.log("Raw body:", req.body);

    const updates = [];
    const values = [];
    let n = 1;

    if (full_name) {
      updates.push(`full_name = $${n++}`);
      values.push(full_name);
    }

    if (email) {
      const dup = await db.query(
        `SELECT id FROM users WHERE email=$1 AND id != $2`,
        [email, id]
      );
      console.log("Duplicate email check rows:", dup.rowCount);
      if (dup.rowCount > 0) {
        console.log("Email already exists, aborting update.");
        return res.status(400).send("Email already exists");
      }

      updates.push(`email = $${n++}`);
      values.push(email);
    }

    if (role && isSuper) {
      updates.push(`role = $${n++}`);
      values.push(role);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password = $${n++}`);
      values.push(hash);
    }

    console.log("Updates array:", updates);
    console.log("Values array:", values);

    if (updates.length === 0) {
      console.log("No updates to apply, returning.");
      return res.status(200).send("No changes");
    }

    values.push(id);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = $${n}`;
    console.log("Final SQL:", sql);
    console.log("Final values:", values);

    await db.query(sql, values);

    console.log("Update successful for user id", id);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Error in /users/:id/edit-inline:", err);
    res.status(500).send("Server error");
  }
});




/* ----------------------------------------------
   GET /users/:id/delete — Delete user
---------------------------------------------- */
router.get("/:id/delete", requireManager, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    const current = req.session.user;

    // Can't delete super manager
    if (targetId === 1) {
      req.flash("error", "Cannot delete the super manager");
      return res.redirect("/users");
    }

    // Only super manager can delete other managers
    const targetUser = await db.query(`SELECT role FROM users WHERE id=$1`, [targetId]);
    const targetRole = targetUser.rows[0]?.role;

    if (targetRole === "Manager" && !isSuperManager(current)) {
      req.flash("error", "Only the super manager can delete other managers.");
      return res.redirect("/users");
    }

    await db.query(`DELETE FROM users WHERE id=$1`, [targetId]);

    req.flash("success", "User deleted successfully");
    res.redirect("/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete user");
    res.redirect("/users");
  }
});

/* ----------------------------------------------
   PROMOTE / DEMOTE (super manager only)
---------------------------------------------- */
router.get("/:id/promote", requireManager, async (req, res) => {
  if (!isSuperManager(req.session.user)) {
    req.flash("error", "Only the super manager can promote users.");
    return res.redirect("/users");
  }

  const id = parseInt(req.params.id);
  if (id === 1) return res.redirect("/users"); // super manager can't be changed

  await db.query(`UPDATE users SET role='Manager' WHERE id=$1`, [id]);
  req.flash("success", "User promoted to manager.");
  res.redirect("/users");
});

router.get("/:id/demote", requireManager, async (req, res) => {
  if (!isSuperManager(req.session.user)) {
    req.flash("error", "Only the super manager can demote managers.");
    return res.redirect("/users");
  }

  const id = parseInt(req.params.id);
  if (id === 1) return res.redirect("/users");

  await db.query(`UPDATE users SET role='User' WHERE id=$1`, [id]);
  req.flash("success", "User demoted to standard user.");
  res.redirect("/users");
});

// only be able to view passwords you are allowed to
router.get("/:id/password", requireManager, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const current = req.session.user;

  const target = await db.query(`SELECT role, password FROM users WHERE id=$1`, [targetId]);

  if (target.rowCount === 0) return res.status(404).send("Not found");
  const targetRole = target.rows[0].role;

  const canSee =
    (current.role === "Manager" && targetRole === "User") ||
    (current.id === 1 && targetId !== 1);

  if (!canSee) return res.status(403).send("Forbidden");

  res.send(target.rows[0].password);
});


module.exports = router;
