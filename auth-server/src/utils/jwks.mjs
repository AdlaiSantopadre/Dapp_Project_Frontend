
import { readFileSync } from 'node:fs';     
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica il file JWK pubblico
const publicJwkPath = process.env.JWK_PUBLIC_PATH || resolve(__dirname, '../keys/jwks.public.json');
const publicKey = JSON.parse(readFileSync(publicJwkPath, 'utf8'));



// Puoi anche caricare direttamente keys/jwks.json se preferisci
export function getJWKS() {
  // se servirà rotazione, qui potrai restituire { keys: [pubJwk, oldPubJwk] }
  return { keys: [publicKey] };
}
// Serve lato verifica/interop: espone un endpoint / .well-known/jwks.json che restituisce il/i JWK pubblici.

// Lo usano:

// i client esterni (ad es. la Flutter app, o un altro servizio),

// o lo stesso server se vuoi usare createRemoteJWKSet invece di leggere da file.