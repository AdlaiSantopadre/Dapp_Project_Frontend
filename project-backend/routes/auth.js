// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken'); //chiamata diretta alla libreria jwt
const { generateToken } = require('../utils/jwt');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "supersegreta";

// Utenti mock: address → { password, ruolo }
const users = {
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': { password: 'cert123', role: 'CERTIFICATORE_ROLE' },
  '0xAdmin...': { password: 'adminpass', role: 'admin' }
};

router.post('/login', (req, res) => {
  const { address, password } = req.body;
  const user = users[address];

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
