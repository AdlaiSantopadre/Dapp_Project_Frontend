const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { grantUserRole, hasUserRole } = require('../services/documentRegistry');  // ⬅️ aggiunta

/**
 * Assegna un ruolo reale via smart contract
 * Accesso: solo utenti con ruolo 'admin'
 */
router.post('/grant',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { role, target } = req.body;

    if (!role || !target) {
      return res.status(400).json({ error: 'Dati mancanti: role e target sono obbligatori' });
    }

    try {
      // ✅ Nuovo: controlla se ha già il ruolo
      const alreadyHasRole = await hasUserRole(role, target);
      if (alreadyHasRole) {
        return res.json({
          message: `L'indirizzo ${target} ha già il ruolo "${role}"`
        });
      }

      // Se non ha il ruolo, lo assegna
      const txHash = await grantUserRole(role, target);
      res.json({
        message: `Ruolo "${role}" assegnato a ${target}`,
        transaction: txHash
      });

    } catch (error) {
      console.error('Errore nell\'assegnazione del ruolo:', error);
      res.status(500).json({
        error: 'Errore durante grantRole',
        details: error.message
      });
    }
  });

module.exports = router;
