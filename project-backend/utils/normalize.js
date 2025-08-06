// utils/normalize.js

/**
 * Normalizza un Ethereum address a lowercase (senza validazione).
 */
function normalizeAddress(address) {
  return (address || '').toLowerCase();
}

module.exports = { normalizeAddress };
