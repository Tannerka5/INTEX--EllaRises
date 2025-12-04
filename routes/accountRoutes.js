const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const { requireLogin } = require("../middleware/authMiddleware");

/* ----------------------------------------------
   GET /account — Show logged-in user's account
---------------------------------------------- */
router.get("/", requireLogin, async (req, res) => {
  const user = await db.query(
    `SELECT id, full_name, email, role, created_date
     FROM users WHERE id=$1`,
    [req.session.user.id]
  );

  res.render("account/index", {
    title: "Account Settings",
    currentUser: req.session.user,
    user: user.rows[0],
    error: req.flash("error"),
    success: req.flash("success")
  });
});

/* ----------------------------------------------
   POST /account/update — Update name/email/password
---------------------------------------------- */
router.post("/update", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { full_name, email, password } = req.body;

    const updates = [];
    const values = [];
    let n = 1;

    if (full_name && full_name.trim()) {
      updates.push(`full_name = $${n++}`);
      values.push(full_name.trim());
    }

    if (email && email.trim()) {
      const dup = await db.query(
        `SELECT id FROM users WHERE email=$1 AND id != $2`,
        [email.trim(), userId]
      );
      if (dup.rowCount > 0) {
        req.flash("error", "Email already exists");
        return res.redirect("/account");
      }

      updates.push(`email = $${n++}`);
      values.push(email.trim());
    }

    if (password && password.trim()) {
      const hash = await bcrypt.hash(password.trim(), 10);
      updates.push(`password = $${n++}`);
      values.push(hash);
    }

    if (updates.length === 0) {
      req.flash("error", "No changes detected");
      return res.redirect("/account");
    }

    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = $${n}`;
    await db.query(sql, values);

    req.flash("success", "Account updated successfully.");
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update account");
    res.redirect("/account");
  }
});

module.exports = router;
