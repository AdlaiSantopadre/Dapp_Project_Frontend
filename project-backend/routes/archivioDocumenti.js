import { Router } from 'express';
import { createDocumento, setQrCid, getDocumentoById, listDocumentiByImpianto } from '../services/documentiService.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['CERTIFICATORE_ROLE']),
  async (req, res) => {
    const doc = await createDocumento(req.body);
    res.status(201).json(doc);
  }
);

router.patch(
  '/:id/qr',
  authMiddleware,
  roleMiddleware(['CERTIFICATORE_ROLE']),
  async (req, res) => {
    const updated = await setQrCid( req.params.id, req.body.qrCid );
    console.log("📌 PATCH result:", updated);
    if (!updated) return res.status(404).json({ error: 'Documento non trovato' });
    res.json({ message: 'Documento completato', documento: updated });
  }
);

router.get('/:id',
  //authMiddleware,
  //roleMiddleware(['CERTIFICATORE_ROLE','MANUTENTORE_ROLE','ISPETTORE_ROLE']),
  async (req, res) => {
    const doc = await getDocumentoById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento non trovato' });
    res.json(doc);
  }
);

router.get('/impianto/:impiantoId',
  authMiddleware,
  roleMiddleware(['CERTIFICATORE_ROLE','MANUTENTORE_ROLE','ISPETTORE_ROLE']),
  async (req, res) => {
    const items = await listDocumentiByImpianto(req.params.impiantoId);
    res.json(items);
  }
);

export default router;
