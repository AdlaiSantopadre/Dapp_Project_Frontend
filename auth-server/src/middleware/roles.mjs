// src/middleware/roles.mjs
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Non autenticato' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permesso negato' });
    }
    return next();
  };
}
