// Role-based access control middleware
// Usage: authorizeRoles("admin")  or  authorizeRoles("admin", "organizer")
// Must be used AFTER the protect middleware (req.user must exist)

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Access denied. Not authenticated." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized.`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
