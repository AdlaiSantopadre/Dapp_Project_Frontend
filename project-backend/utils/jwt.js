// utils/jwt.js
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const expiration = process.env.JWT_EXPIRATION || '1h';

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: expiration });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = {
  generateToken,
  verifyToken
};
