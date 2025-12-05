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
   GET /users/:id (show) - View own profile OR manager viewing any
   --------------------------- */
router.get("/:id", requireLogin, async (req, res) => {
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

    const user = result.rows[0];

    // Users can only view their own profile, Managers can view any
    if (req.session.user.role !== "Manager" && req.session.user.id !== parseInt(req.params.id)) {
      req.flash("error", "You do not have permission to view this profile.");
      return res.redirect("/dashboard");
    }

    res.render("users/show", {
      title: "User Details",
      currentUser: req.session.user,
      user: user,
      isOwnProfile: req.session.user.id === user.id,
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
   PUT /users/:id (update) - Update own profile OR manager updating any
   --------------------------- */
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const { full_name, email, role, password } = req.body;
    const userId = parseInt(req.params.id);
    const isOwnProfile = req.session.user.id === userId;
    const isManager = req.session.user.role === "Manager";

    // Users can only edit their own profile, Managers can edit any
    if (!isManager && !isOwnProfile) {
      req.flash("error", "You do not have permission to edit this profile.");
      return res.redirect("/dashboard");
    }

    // Build update query based on what's being changed
    let updateQuery;
    let params;

    if (password && password.length > 0 && isOwnProfile) {
      // Update password (only for own profile)
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE users
        SET full_name = $1, email = $2, password = $3
        WHERE id = $4;
      `;
      params = [full_name, email, hashedPassword, userId];
    } else if (isManager && !isOwnProfile) {
      // Manager updating another user (can change role)
      updateQuery = `
        UPDATE users
        SET full_name = $1, email = $2, role = $3
        WHERE id = $4;
      `;
      params = [full_name, email, role, userId];
    } else if (isManager && isOwnProfile) {
      // Manager updating their own profile (can change password)
      if (password && password.length > 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery = `
          UPDATE users
          SET full_name = $1, email = $2, password = $3, role = $4
          WHERE id = $5;
        `;
        params = [full_name, email, hashedPassword, role, userId];
      } else {
        updateQuery = `
          UPDATE users
          SET full_name = $1, email = $2, role = $3
          WHERE id = $4;
        `;
        params = [full_name, email, role, userId];
      }
    } else {
      // Regular user updating their own profile (no role change)
      updateQuery = `
        UPDATE users
        SET full_name = $1, email = $2
        WHERE id = $3;
      `;
      params = [full_name, email, userId];
    }

    await db.query(updateQuery, params);

    // Update session if editing own profile
    if (isOwnProfile) {
      req.session.user.full_name = full_name;
      req.session.user.email = email;
      if (isManager) {
        req.session.user.role = role;
      }
    }

    req.flash("success", "Profile updated successfully.");
    res.redirect(`/users/${userId}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to update profile.");
    res.redirect(`/users/${req.params.id}`);
  }
});

/* ---------------------------
   DELETE /users/:id - Manager only (cannot delete own account)
   --------------------------- */
router.delete("/:id", requireLogin, requireManager, async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.session.user.id === parseInt(req.params.id)) {
      req.flash("error", "You cannot delete your own account.");
      return res.redirect(`/users/${req.params.id}`);
    }

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
