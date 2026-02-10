module.exports = {
  ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.returnTo = req.originalUrl; // optional: preserve requested URL
    return res.redirect("/login");
  }
};