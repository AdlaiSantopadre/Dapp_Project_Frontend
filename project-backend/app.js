// app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); // 1. Carica variabili da .env

import authRoutes from './routes/auth.js';
import rolesRoutes from './routes/roles.js';
import documentRoutes from './routes/document.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express(); // 2. Crea istanza server


// 3. Middleware globali
app.use(cors());               // Abilita CORS
app.use(express.json());       // Parsing JSON nelle richieste

// 4. Rotte
app.use('/auth', authRoutes);
app.use('/roles', rolesRoutes);
app.use('/documents', documentRoutes)

// 5. Rotta di test
app.get('/', (req, res) => {
  res.send('Backend DocumentRegistry attivo 🚀');
});

// 6. Middleware di autenticazione
app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Accesso autorizzato ✅',
    user: req.user
  });
});

const PORT = process.env.PORT || 3000;
// 7. Avvio server
app.listen(PORT, () => {
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
  console.log('🌐 Provider:', process.env.RPC_URL);
});

export default app; // 8. Esporta l'app per test o altri usi
// (es. test con supertest)
