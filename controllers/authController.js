const bcrypt = require("bcrypt");
const db = require("../db/knex");

async function getLogin(req, res) {
  res.render("auth/login", { title: "Login" });
}

async function postLogin(req, res) {
  const { username, password } = req.body;
  const user = await db("users").where({ username }).first();
  if (!user) {
    req.flash("error", "Invalid credentials.");
    return res.redirect("/login");
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    req.flash("error", "Invalid credentials.");
    return res.redirect("/login");
  }
  req.session.user = { id: user.id, username: user.username, role: user.role };
  req.flash("success", "Welcome back.");
  if (user.role === "manager") {
    return res.redirect("/dashboard/admin");
  }
  return res.redirect("/dashboard/user");
}

async function getRegister(req, res) {
  res.render("auth/register", { title: "Register" });
}

async function postRegister(req, res) {
  const { username, password } = req.body;
  const existing = await db("users").where({ username }).first();
  if (existing) {
    req.flash("error", "Username already taken.");
    return res.redirect("/register");
  }
  const hash = await bcrypt.hash(password, 10);
  await db("users").insert({
    username,
    password_hash: hash,
    role: "user"
  });
  req.flash("success", "Account created. Please log in.");
  return res.redirect("/login");
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout
};
