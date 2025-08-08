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

// Provider + Signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

let signer;
let contract;

/**
 * Inizializza il contratto con signer
 */
async function initContract() {
// signer con chiave privata (prefisso 0x, 64 hex)
const privateKey = process.env.PRIVATE_KEY?.trim()
if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error('PRIVATE_KEY mancante o formattata male (deve iniziare con 0x ed essere 64 hex).')
}
const signer = new ethers.Wallet(privateKey, provider)
const contractAddress = process.env.CONTRACT_ADDRESS
if (!contractAddress) throw new Error('CONTRACT_ADDRESS non impostato in .env')

const contract = new ethers.Contract(contractAddress, abi, signer)

console.log(`[DocumentRegistry] Contratto inizializzato: ${contractAddress}`);
}

// Chiamo subito l'inizializzazione
await initContract();

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

// Esportiamo le funzioni
export { hasUserRole, grantUserRole };
// 🚀 nuovo: registra il documento on-chain

export async function registerDocumentOnChain(sha256HexString, cid, metadata = '{}') {
  if (!/^[0-9a-fA-F]{64}$/.test(sha256HexString)) {
    throw new Error('sha256HexString non valido: attesi 64 caratteri esadecimali')
  }  
  // converti hex string (64 char) in bytes32
  // "0x" + 64 hex
  const hashBytes32 = '0x' + sha256HexString
  const tx = await contract.registerDocument(hashBytes32, cid, metadata)
  const receipt = await tx.wait()
  return { txHash: receipt?.hash || tx.hash }
}