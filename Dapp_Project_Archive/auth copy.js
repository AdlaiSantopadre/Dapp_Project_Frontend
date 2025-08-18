// routes/auth.js
import express from 'express';
import { generateToken } from '../project-backend/utils/jwt.js'; // Importa la funzione per generare il token
import { normalizeAddress } from '../project-backend/utils/normalize.js'; // Importa la funzione per normalizzare l'indirizzo

const router = express.Router();

//const SECRET = process.env.JWT_SECRET || "supersegreta";

// Utenti mock: address → { password, ruolo } 
// users ATTENZIONE ALLE STRINGHE ADDRESS: (LOWERCASE)
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

  // Login endpoint
  const { address, password } = req.body;  
  if (!address || !password) {
    return res.status(400).json({ error: 'Address e password sono obbligatori' });
  }

  
  const user = users[normalizeAddress(address)];  // Normalizza l'indirizzo  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }
  
const token = generateToken({
   address,  // ad esempio "0xAbc123455666..."
   role: user.role //// ad esempio "CERTIFICATORE_ROLE" oppure "admin"
  });

  console.log("Login OK:", address, "role:", user.role);
  res.json({ token });
});

export default router;
