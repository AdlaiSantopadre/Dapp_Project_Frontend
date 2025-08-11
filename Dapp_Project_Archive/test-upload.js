// test-upload.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeStoracha, uploadToIPFS } from './services/ipfs.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const filePath = path.join(__dirname, 'example.pdf') // usa un file esistente
  const fileBuffer = await fs.readFile(filePath)

  console.log('[Main] Inizializzazione Storacha...')
  await initializeStoracha('adiegiuli@gmail.com')

  console.log('[Main] Caricamento file...')
  const cid = await uploadToIPFS(fileBuffer, 'example.pdf')

  console.log('[Main] CID ottenuto:', cid)
}

main().catch((err) => {
  console.error('[Main] Errore:', err)
})
