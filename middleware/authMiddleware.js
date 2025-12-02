function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash("error", "You must be logged in to view that page.");
  return res.redirect("/login");
}

function ensureManager(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "manager") {
    return next();
  }
  req.flash("error", "You do not have permission to view that page.");
  return res.redirect("/");
}

function attachUserToLocals(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
}

module.exports = {
  ensureAuthenticated,
  ensureManager,
  attachUserToLocals
};
