// project-backend/middleware/authMiddleware.js
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL(process.env.AUTH_JWKS_URL));

export default async function authMiddleware(req, res, next) {
  if (process.env.BYPASS_AUTH === '1') {
    req.user = { id: '0', username: 'test', role: 'CERTIFICATORE_ROLE', ethAddress: '0xAbc...' };
    return next();
  }
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token mancante o invalido' });

  try {
    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, JWKS, {
        algorithms: ['RS256'],
        issuer: 'urn:auth-server',
        audience: 'urn:project-backend',
         });
    // Mantieni compat: address ⇄ ethAddress
    req.user = { ...payload, address: payload.address || payload.ethAddress, ethAddress: payload.ethAddress || payload.address };
    next();
  } catch {
     console.error('[authMiddleware] JWT verify error:', err);
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}
