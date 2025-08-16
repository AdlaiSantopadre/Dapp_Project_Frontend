// src/middleware/auth.mjs
import { createPublicKey } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { jwtVerify } from 'jose';

const publicPem = readFileSync(process.env.JWT_PUBLIC_KEY_PATH, 'utf8');
const publicKey = createPublicKey(publicPem);

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Token mancante' });

      const { payload } = await jwtVerify(token, publicKey, { algorithms: ['RS256'] });
      // payload: { id, username, role, ethAddress, iat, exp, ... }
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token non valido' });
    }
  };
}
