import { create } from "@storacha/client";
import fs from "fs";

let client;

// inizializza client una volta sola (singleton)
async function getClient() {
  if (!client) {
    client = await create();
    await client.authorize();
  }
  return client;
}

/**
 * Carica un file buffer su Storacha IPFS
 * @param {Buffer} buffer - Contenuto del file
 * @param {string} filename - Nome del file originale
 * @returns {string} CID IPFS
 */
export async function uploadToIPFS(buffer, filename) {
  const client = await getClient();

  const file = new File([buffer], filename);
  const { cid } = await client.uploadFile(file);

  return cid.toString(); // es: 'bafy...'
}
