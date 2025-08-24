import express from 'express';
import fs from 'fs';

const router = express.Router();

// GET /impianti
router.get('/', (req, res) => {
  try {
    const raw = fs.readFileSync('./config/impianti.json', 'utf-8');
    const impianti = JSON.parse(raw);
    res.json(impianti);
  } catch (err) {
    res.status(500).json({ error: 'Errore lettura impianti' });
  }
});

export default router;
