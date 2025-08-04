// middleware/roleMiddleware.js

function roleMiddleware(allowedRoles = []) {
  return function (req, res, next) {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Accesso non autorizzato per il tuo ruolo' });
    }

    next();
  };
}

module.exports = roleMiddleware;
