const bcrypt = require("bcrypt");
const db = require("../db");

async function getLogin(req, res) {
  res.render("auth/login", { title: "Login" });
}

async function postLogin(req, res) {
  const { email, password } = req.body;

  // Fetch user + optional participant fields
  const result = await db.query(`
    SELECT 
      u.id,
      u.email,
      u.password AS password_hash,
      u.role,
      u.full_name,
      u.participantid,
      p.participantfirstname,
      p.participantlastname
    FROM users u
    LEFT JOIN participant p ON u.participantid = p.participantid
    WHERE u.email = $1
    LIMIT 1;
  `, [email]);

  const user = result.rows[0];

  if (!user) {
    req.flash("error", "Invalid credentials.");
    return res.redirect("/login");
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    req.flash("error", "Invalid credentials.");
    return res.redirect("/login");
  }

  // Save everything needed in the session
  req.session.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,               // ALWAYS exists
    participantid: user.participantid || null,
    participantfirstname: user.participantfirstname || null,
    participantlastname: user.participantlastname || null
  };

  req.flash("success", "Welcome back.");

  if (user.role === "Manager") {
    return res.redirect("/dashboard/admin");
  }

  return res.redirect("/dashboard/user");
}

async function getRegister(req, res) {
  res.render("auth/register", { title: "Register" });
}

async function postRegister(req, res) {
  const { email, password, full_name } = req.body;

  const existing = await db.query(
    "SELECT 1 FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    req.flash("error", "Email already registered.");
    return res.redirect("/register");
  }

  const hash = await bcrypt.hash(password, 10);

  await db.query(`
    INSERT INTO users (email, password, role, full_name)
    VALUES ($1, $2, 'User', $3)
  `, [email, hash, full_name]);

  req.flash("success", "Account created. Please log in.");
  return res.redirect("/login");
}

function logout(req, res) {
  req.session.destroy(() => res.redirect("/"));
}

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout
};
