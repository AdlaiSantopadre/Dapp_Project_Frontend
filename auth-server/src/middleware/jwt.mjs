//Firma JWT con il JWK privato (JOSE)
import { SignJWT, importJWK } from 'jose';
import { readFileSync } from 'node:fs';

const privJwk = JSON.parse(readFileSync('keys/jwks.private.json', 'utf8'));
// Se vuoi forzare l'alg da .env, ok; altrimenti usa quello nel file.
const ALG = process.env.JWT_ALG || 'RS256';

let privateKeyPromise;
async function getPrivateKey() {
  if (!privateKeyPromise) privateKeyPromise = importJWK(privJwk, ALG);
  return privateKeyPromise;
}

export async function signUserToken({ sub, roles }) {
  const iss = process.env.JWT_ISS ?? 'auth-server.local';
  const aud = process.env.JWT_AUD ?? 'flutter-app';
  const exp = parseInt(process.env.JWT_EXP ?? '3600', 10);

  const key = await getPrivateKey();
  return await new SignJWT({ roles })
    .setProtectedHeader({ alg: ALG, kid: privJwk.kid }) // usa lo stesso kid del tuo script
    .setSubject(sub)
    .setIssuer(iss)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime(exp) // in secondi
    .sign(key);
}
