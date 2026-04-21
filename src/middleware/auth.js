const requireAuth = (req, res, next) => {
  next();
};

module.exports = { requireAuth };
