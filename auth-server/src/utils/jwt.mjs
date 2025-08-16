//src/utils/jwt.mjs – firma token

import { readFileSync } from 'node:fs';
import { importJWK, SignJWT } from 'jose';

const privJwk = JSON.parse(readFileSync(process.env.JWK_PRIVATE_PATH, 'utf8'));
const privateKey = await importJWK(privJwk, privJwk.alg || 'RS256'); // KeyLike
const KID = privJwk.kid;

export async function signJwt(payload, { expiresIn = process.env.JWT_EXPIRES_IN || '1d' } = {}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: KID, typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}
