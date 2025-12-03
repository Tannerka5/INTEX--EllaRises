// Middleware to attach user to res.locals for all views
const attachUserToLocals = (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
};

// Middleware to require login
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    req.flash("error", "Please log in to access this page");
    return res.redirect("/login");
  }
  next();
};

// Middleware to require manager role
const requireManager = (req, res, next) => {
  if (!req.session.user) {
    req.flash("error", "Please log in to access this page");
    return res.redirect("/login");
  }
  if (req.session.user.role !== "Manager") {
    req.flash("error", "You do not have permission to access this page");
    return res.redirect("/dashboard/user");
  }
  next();
};

module.exports = {
  attachUserToLocals,
  requireLogin,
  requireManager
};
