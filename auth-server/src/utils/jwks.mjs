import { readFileSync } from 'node:fs';

const pubJwk = JSON.parse(readFileSync(process.env.JWK_PUBLIC_PATH, 'utf8'));

// Puoi anche caricare direttamente keys/jwks.json se preferisci
export function getJWKS() {
  // se servirà rotazione, qui potrai restituire { keys: [pubJwk, oldPubJwk] }
  return { keys: [pubJwk] };
}
