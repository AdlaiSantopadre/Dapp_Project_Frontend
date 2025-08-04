const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * Rotta mock: assegna un ruolo (simulato)
 * Accesso: solo utenti con ruolo 'admin'
 */
router.post('/grant',
  authMiddleware,
  roleMiddleware(['admin']),
  (req, res) => {
    const { role, target } = req.body;

    if (!role || !target) {
      return res.status(400).json({ error: 'Dati mancanti: role e target sono obbligatori' });
    }

    // Simulazione dell’assegnazione del ruolo
    console.log(`Ruolo "${role}" assegnato a ${target} ✅`);

    res.json({
      message: `Ruolo "${role}" assegnato a ${target} (mock)`,
      assegnatoDa: req.user.address
    });
  }
);

module.exports = router;
