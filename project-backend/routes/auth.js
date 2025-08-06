// routes/auth.js
const express = require('express');
//const jwt = require('jsonwebtoken'); //chiamata diretta alla libreria jwt
const { generateToken } = require('../utils/jwt');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "supersegreta";

const { normalizeAddress } = require('../utils/normalize');
// Utenti mock: address → { password, ruolo } 
// users ATTENZIONE ALLE STRINGHE (LOWERCASE)
const users = {
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': {
     password: 'adminpass',
      role: 'admin' 
      },
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': {
    password: 'certificatorepass',  
    role: 'CERTIFICATORE_ROLE'
  },
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': {
    password: 'manutentorepass',
    role: 'MANUTENTORE_ROLE' }
  
  // Aggiungi altri utenti se necessario


};

router.post('/login', (req, res) => {
  const { address, password } = req.body;
  
  if (!address || !password) {
    return res.status(400).json({ error: 'Address e password sono obbligatori' });
  }
  // Normalizza l'indirizzo
  const user = users[normalizeAddress(address)];  
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }
  // Genera il token JWT (quando viene effettuato u)
const token = generateToken({ address,  // ad esempio "0xAbc123..."
                               role: user.role //// ad esempio "CERTIFICATORE_ROLE" oppure "admin"
                              });
  // Crea JWT
//   const token = jwt.sign(
//     { address, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRATION }
//   );

  res.json({ token });
});

module.exports = router;
