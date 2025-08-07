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
 if (process.env.PRIVATE_KEY) {
  signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
} else {
  signer = provider.getSigner();
}
  const contractAddress = process.env.CONTRACT_ADDRESS || process.env.DOCUMENT_REGISTRY_ADDRESS;
  contract = new ethers.Contract(contractAddress, abi, signer);
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
