//Verifica JWT con JWKS locale (niente rete)
import { jwtVerify, createLocalJWKSet } from 'jose';
import { readFileSync } from 'node:fs';

const publicJWKS = JSON.parse(readFileSync('keys/jwks.json', 'utf8'));
const JWKS = createLocalJWKSet(publicJWKS);

export function requireAuth(requiredRoles = []) {
  const iss = process.env.JWT_ISS ?? 'auth-server.local';
  const aud = process.env.JWT_AUD ?? 'flutter-app';

  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'missing_token' });

      const { payload } = await jwtVerify(token, JWKS, { issuer: iss, audience: aud });
      req.user = { sub: payload.sub, roles: payload.roles || [] };

      if (requiredRoles.length && !requiredRoles.some(r => req.user.roles.includes(r))) {
        return res.status(403).json({ error: 'forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'invalid_token', detail: e.message });
    }
  };
}
