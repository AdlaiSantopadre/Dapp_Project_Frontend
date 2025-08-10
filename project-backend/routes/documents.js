import express from 'express'
import multer from 'multer'
import authMiddleware from '../middleware/authMiddleware.js'
import roleMiddleware from '../middleware/roleMiddleware.js'
import { registerDocumentOnChain } from '../services/documentRegistry.js'
import { sha256Hex } from '../utils/hash.js'

/**
 * Factory che crea un Router per /documents
 * @param {Object} deps
 * @param {Object} deps.storage - servizio di storage IPFS/Storacha, con metodo async put(fileBuffer, filename)
 * @returns {express.Router}
 */
export default function documentsRouter({ storage }) {
  if (!storage || typeof storage.put !== 'function') {
    throw new Error("documentsRouter: storage.put function required");
  }

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
        if (!req.file) {
          return res.status(400).json({ error: 'Nessun file caricato' })
        }
        if (!req.user) {
          return res.status(401).json({ error: 'Utente non autenticato' })
        }

        const buffer = req.file.buffer
        const originalName = req.file.originalname || 'document.pdf'

        // 1) Hash locale del PDF
        const hash = sha256Hex(buffer)

        // 2) Upload su IPFS (Storacha) tramite storage iniettato
        const { cid } = await storage.put({
          name: originalName,
          data: buffer,
          size: buffer.length,
          mimetype: req.file.mimetype || 'application/pdf'
        })

        // 3) Metadata (puoi costruirli da req.body, qui un esempio minimo)
        const metadata = JSON.stringify({
          filename: originalName,
          mime: req.file.mimetype || 'application/pdf',
          uploadedBy: req.user?.address || req.user?.email || 'unknown'
        })

        // 4) Registrazione su blockchain
        const txHash = await registerDocumentOnChain(cid, hash, metadata)

        return res.status(200).json({ cid, hash, txHash })
      } catch (err) {
        console.error('[upload] error:', err)
        return res.status(500).json({ error: 'Upload fallito' })
      }
    }
  )

  return router
}
