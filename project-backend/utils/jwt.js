// utils/jwt.js
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
const expiration = process.env.JWT_EXPIRATION || '1h';
// Firma il token
function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: expiration });
}
// Verifica il token
function verifyToken(token) {
  return jwt.verify(token, secret);
}

export {generateToken,verifyToken};
