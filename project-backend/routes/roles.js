const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { grantUserRole } = require('../services/documentRegistry');

const router = express.Router();

/**
 * Rotta mock: assegna un ruolo (simulato)
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
          // Assegna il ruolo usando il servizio
        const txHash = await grantUserRole(role, target);
        res.json({
            message: `Ruolo "${role}" assegnato a ${target}`,
            transaction: txHash,
            
          });
        } catch (error) {
          console.error('Errore nell\'assegnazione del ruolo:', error);
          res.status(500).json({ error: 'Errore durante grantRole',details: error.message});
        }
      });
    // Simulazione dell’assegnazione del ruolo
    // console.log(`Ruolo "${role}" assegnato a ${target} (mock)`);

    // res.json({
    //   message: `Ruolo "${role}" assegnato a ${target} (mock)`,
    //   assegnatoDa: req.user.address
    //});
  


module.exports = router;
