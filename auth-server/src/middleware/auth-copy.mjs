// src/middleware/auth.mjs

// auth-server/src/middleware/auth.mjs (se ti serve proteggere qualche rotta dell'auth-server)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { importJWK, jwtVerify } from 'jose';

const publicJwkPath = process.env.JWK_PUBLIC_PATH
  || resolve(process.cwd(), 'src/keys/jwks.public.json'); // adegua al tuo layout
const publicJwk = JSON.parse(readFileSync(publicJwkPath, 'utf8'));
const publicKey = await importJWK(publicJwk, publicJwk.alg || 'RS256');

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Token mancante' });

      const { payload } = await jwtVerify(token, publicKey, {
        algorithms: ['RS256'],
        // opzionali se li metti in firma:
        issuer: 'urn:auth-server',
        audience: 'urn:project-backend',
      });

      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token non valido', details: String(err) });
    }
  };
}
