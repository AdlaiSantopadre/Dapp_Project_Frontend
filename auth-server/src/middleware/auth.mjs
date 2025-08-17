// src/middleware/auth.mjs
import { createPublicKey } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { jwtVerify } from 'jose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica il file JWK pubblico
const publicJwkPath = process.env.JWK_PUBLIC_PATH || resolve(__dirname, '..\keys\jwk.public.json');
const publicKey = JSON.parse(readFileSync(publicJwkPath, 'utf8'));

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
