



import { verifyToken } from '../project-backend/utils/jwt.js';

export default function authMiddleware(req, res, next) {
  if (process.env.BYPASS_AUTH === "1") {
  req.user = { 
    email: "test@example.com",
    role: "CERTIFICATORE_ROLE",
    address: "0xAbc123455666..." // Simula un indirizzo
      };
  return next();
 }
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

