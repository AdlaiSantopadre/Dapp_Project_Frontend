// auth-server/scripts/gen-keys.mjs
import { generateKeyPair, exportJWK, calculateJwkThumbprintUri } from 'jose';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = `${__dirname}/../keys`;
mkdirSync(outDir, { recursive: true });

// Genera coppia RSA per RS256
const { publicKey, privateKey } = await generateKeyPair('RS256', { modulusLength: 2048 });

const jwkPub  = await exportJWK(publicKey);
const jwkPriv = await exportJWK(privateKey);

// Calcola un kid deterministico (thumbprint RFC7638)
const kid = await calculateJwkThumbprintUri(jwkPub); // es: "urn:ietf:params:oauth:jwk-thumbprint:sha-256:..."

jwkPub.use = 'sig';
jwkPub.alg = 'RS256';
jwkPub.kid = kid;

jwkPriv.use = 'sig';
jwkPriv.alg = 'RS256';
jwkPriv.kid = kid;

writeFileSync(`${outDir}/jwks.public.json`, JSON.stringify(jwkPub, null, 2));
writeFileSync(`${outDir}/jwks.private.json`, JSON.stringify(jwkPriv, null, 2));
writeFileSync(`${outDir}/jwks.json`, JSON.stringify({ keys: [jwkPub] }, null, 2));

console.log('✅ JWK generati in auth-server/keys (jwks.public.json, jwks.private.json, jwks.json)');
console.log('   kid:', kid);
