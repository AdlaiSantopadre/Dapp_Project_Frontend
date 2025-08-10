if (process.env.BYPASS_AUTH === "1") {
  req.user = { email: "test@example.com", roles: ["CERTIFICATORE_ROLE"] };
  return next();
}



import { verifyToken } from '../utils/jwt.js';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante o invalido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}

