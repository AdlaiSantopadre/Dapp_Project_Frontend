// services/documentRegistry.js
import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Carica ABI
const contractJson = JSON.parse(
  fs.readFileSync(new URL('../abi/DocumentRegistry.json', import.meta.url))
);
//import contractJson from '../contract/DocumentRegistry.json' assert { type: 'json' };
const abi = contractJson.abi;

// Provider (v6) ->Stato modulo
let provider;
let signer;
let contract;
let initialized = false;

async function ensureContract() {
  if (initialized && contract) return;

  const RPC_URL = process.env.RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY?.trim();
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  if (!RPC_URL) throw new Error('RPC_URL mancante');
  if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
    throw new Error('PRIVATE_KEY mancante o malformattata (0x + 64 hex)');
  }
  if (!CONTRACT_ADDRESS) throw new Error('CONTRACT_ADDRESS mancante');

  // crea provider/signer/contract
  provider = new ethers.JsonRpcProvider(RPC_URL);
  signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const c = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  // verifica minima e finalizza
  await c.getAddress(); // throws se address/abi non validi
  contract = c;
  initialized = true;
  console.log('[DocumentRegistry] Contratto inizializzato:', CONTRACT_ADDRESS);
}

function toBytes32(hexish) {
  let s = String(hexish).trim();
  if (s.startsWith('0x')) s = s.slice(2);
  if (s.length !== 64) throw new Error(`sha256HexString non valido: attesi 64 caratteri, ricevuti ${s.length}`);
  if (!/^[0-9a-fA-F]{64}$/.test(s)) throw new Error('sha256HexString non valido: caratteri non esadecimali');
  return '0x' + s.toLowerCase();
}

 async function registerDocumentOnChain(sha256HexString, cid, metadata='{}') {
  // se non devi registrare on-chain, esci pulito
  if (process.env.REGISTER_ONCHAIN !== '1') {
    return { cid, hash: sha256HexString, txHash: null };
  }

  await ensureContract();

  if (!contract) {
    throw new Error('Contract non inizializzato (controlla RPC_URL/PRIVATE_KEY/CONTRACT_ADDRESS)');
  }

  const hashBytes32 = toBytes32(sha256HexString);
  const tx = await contract.registerDocument(hashBytes32, cid, metadata);
  const receipt = await tx.wait();
  const txHash = receipt?.hash || tx.hash || null;

  return { cid, hash: sha256HexString, txHash };
}


/**
 * Verifica se un address ha già un ruolo
 * @param {string} roleName
 * @param {string} addressToCheck
 * @returns {Promise<boolean>}
 */
async function hasUserRole(roleName, addressToCheck) {
  const roleHash = ethers.id(roleName);
  return await contract.hasRole(roleHash, addressToCheck);
}

/**
 * Assegna un ruolo via smart contract
 * @param {string} roleName
 * @param {string} targetAddress
 * @returns {Promise<string>} - tx hash o messaggio
 */
async function grantUserRole(roleName, targetAddress) {
  const roleHash = ethers.id(roleName);

  const already = await contract.hasRole(roleHash, targetAddress);
  if (already) {
    return `Address ${targetAddress} already has role ${roleName}`;
  }

  const tx = await contract.grantRole(roleHash, targetAddress);
  await tx.wait();
  return tx.hash;
}  


export { hasUserRole, grantUserRole, registerDocumentOnChain };