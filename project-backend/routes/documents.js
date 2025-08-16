import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { registerDocumentOnChain } from '../services/documentRegistry.js';
import { sha256Hex } from '../utils/hash.js';

export default function documentsRouter({ storage }) {
  if (!storage || typeof storage.put !== 'function') {
    throw new Error('documentsRouter: storage.put function required');
  }

  const router = express.Router();

  // Limiti e filtro: solo PDF, max 20MB (regola tu)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok = (file.mimetype || '').toLowerCase() === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
      cb(ok ? null : new Error('Solo PDF ammessi'), ok);
    },
  });

  router.post(
    '/upload',
    authMiddleware,
    roleMiddleware(['CERTIFICATORE_ROLE']),
    upload.single('file'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'Nessun file caricato (atteso campo form-data "file")' });
        }
        if (!req.user) {
          return res.status(401).json({ error: 'Utente non autenticato' });
        }

        // indirizzo utente (dal token)
        const ethAddress = req.user.ethAddress || req.user.address || null;
        if (!ethAddress) {
          return res.status(400).json({ error: 'Wallet address mancante nel token (ethAddress)' });
        }

        const buffer = req.file.buffer;
        const originalName = req.file.originalname || 'document.pdf';
        const mime = req.file.mimetype || 'application/pdf';

        // 1) Hash locale del PDF (per immutabilità)
        const hash = sha256Hex(buffer);

        // 2) Upload su IPFS/Storacha
        const putResult = await storage.put({
          name: originalName,
          data: buffer,
          size: buffer.length,
          mimetype: mime,
        });
        const cid = putResult?.cid;
        if (!cid) {
          return res.status(502).json({ error: 'Upload su storage fallito (CID assente)' });
        }

        // 3) Metadata minimi (evita PII, mantieni tracciabilità tecnica)
        const metadata = JSON.stringify({
          filename: originalName,
          mime,
          uploadedBy: ethAddress,
          at: new Date().toISOString(),
        });

        // 4) Registrazione on-chain
        const txHash = await registerDocumentOnChain(hash, cid, metadata);
        if (!txHash) {
          return res.status(502).json({ error: 'Registrazione on-chain fallita (txHash assente)' });
        }

        return res.status(201).json({ cid, hash, txHash });
      } catch (err) {
        // errori da multer (limiti/filtro)
        if (err?.message === 'Solo PDF ammessi') {
          return res.status(415).json({ error: 'Formato non supportato: è richiesto un PDF' });
        }
        if (err?.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'File troppo grande' });
        }

        console.error('[documents/upload] error:', err);
        return res.status(500).json({ error: 'Upload fallito' });
      }
    }
  );

  return router;
}
