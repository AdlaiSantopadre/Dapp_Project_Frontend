const { ethers } = require('ethers');
const contractJson = require('../contract/DocumentRegistry.json'); // ABI
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractJson.abi, signer);

/**
 * Assegna un ruolo a un address usando grantRole
 */
async function grantUserRole(roleName, targetAddress) {
  try {
    // Calcola il role hash come fa Solidity: keccak256(abi.encodePacked(roleName))
    const roleHash = ethers.id(roleName); // come keccak256(roleName)

    const tx = await contract.grantRole(roleHash, targetAddress);
    await tx.wait();

    return tx.hash;
  } catch (error) {
    console.error('Errore grantUserRole:', error);
    throw error;
  }
}

module.exports = {
  grantUserRole
};
