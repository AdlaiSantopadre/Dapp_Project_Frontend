import express from 'express'
import multer from 'multer'
import authMiddleware from '../middleware/authMiddleware.js'
import roleMiddleware from '../middleware/roleMiddleware.js'
import { uploadToIPFS } from '../services/ipfs.js'
import { registerDocumentOnChain } from '../services/documentRegistry.js'
import { sha256Hex } from '../utils/hash.js'

const router = express.Router()

// multer in memoria: req.file.buffer
const upload = multer({ storage: multer.memoryStorage() })

/**
 * POST /documents/upload
 * Form-data: file (PDF)
 * Header: Authorization: Bearer <JWT>
 */
router.post(
  '/upload',
  authMiddleware,
  roleMiddleware(['CERTIFICATORE_ROLE']),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Nessun file caricato' })
      if (!req.user) return res.status(401).json({ error: 'Utente non autenticato' })

      const buffer = req.file.buffer
      const originalName = req.file.originalname || 'document.pdf'

      // 1) hash locale del PDF
      const hash = sha256Hex(buffer) // stringa esadecimale

      // 2) upload su IPFS (Storacha)
      const cid = await uploadToIPFS(buffer, originalName)
     // 3) metadata (puoi costruirli da req.body, qui un esempio minimo)
      const metadata = JSON.stringify({
        filename: originalName,
        mime: req.file.mimetype || 'application/pdf',
        uploadedBy: req.user?.address || req.user?.email || 'unknown' 
    })
    /**
    * Funzione per registrare un documento su blockchain
    * @param {string} cid - CID del file su IPFS
    * @param {string} hash - hash SHA256 del file
    * @returns {Promise<string>} - tx hash della transazione
    */
      // 4) registrazione on-chain del CID (e hash)
      const txHash = await registerDocumentOnChain(cid, hash, metadata)

      // 4) risposta
      res.json({
        cid,
        txHash,
        uploadedBy: req.user.address || req.user.email || 'unknown',
        hash,                  // utile per prove di integrità
        ipfsGateway: `https://storacha.link/ipfs/${cid}/${encodeURIComponent(originalName)}`
      })
    } catch (err) {
      console.error('[documents/upload] errore:', err)
      return res.status(500).json({ error: 'Upload o registrazione fallita', details: err.message })
    }
  }
)

export default router
