//src/utils/jwt.mjs – firma token

import { readFileSync } from 'node:fs';
import { importJWK, SignJWT } from 'jose';

// legge la chiave privata da path indicato in env
const privJwk = JSON.parse(readFileSync(process.env.JWK_PRIVATE_PATH, 'utf8'));
// importa la chiave privata JWK
const privateKey = await importJWK(privJwk, privJwk.alg || 'RS256'); // KeyLike
// salva il kid per l’header
const KID = privJwk.kid;

export async function signJwt(payload, { expiresIn = process.env.JWT_EXPIRES_IN || '1d' } = {}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: KID, typ: 'JWT' })
    .setIssuedAt()
    .setIssuer('urn:auth-server')
    .setAudience('urn:project-backend')
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}
