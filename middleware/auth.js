module.exports = {
  ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.returnTo = req.originalUrl; // optional: preserve requested URL
    return res.redirect("/login");
  },
  ensureAuthOrGuest(req, res, next) {
    if (req.isAuthenticated() || req.session?.guestMode) return next();
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
};