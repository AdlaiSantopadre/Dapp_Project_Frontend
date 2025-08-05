// services/documentRegistry.js
const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

// 🧾 Carica ABI
const contractJson = require("../contract/DocumentRegistry.json");
const abi = contractJson.abi;

// 🌐 Configura provider + signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
let signer;
if (process.env.PRIVATE_KEY) {
  signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
} else {
  signer = provider.getSigner();
}
const contractAddress = process.env.CONTRACT_ADDRESS || process.env.DOCUMENT_REGISTRY_ADDRESS;

// 🔧 Inizializza il contratto
const contract = new ethers.Contract(contractAddress, abi, signer);

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
 * Assegna un ruolo se non è già presente
 * @returns {Promise<string>} - hash transazione o messaggio
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

module.exports = { hasUserRole, grantUserRole };

