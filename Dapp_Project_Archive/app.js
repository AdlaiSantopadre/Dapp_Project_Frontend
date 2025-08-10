// app.js

import express from 'express';
const app = express(); // 2. Crea istanza server
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); // 1. Carica variabili da .env

import authRoutes from '../project-backend/routes/auth.js';
import rolesRoutes from '../project-backend/routes/roles.js';
import documentRoutes from '../project-backend/routes/documents.js';
import authMiddleware from '../project-backend/middleware/authMiddleware.js';




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
// 7. Gestione errori (handler globale)
app.use((err, req, res, next) => {
  console.error('Errore:', err);
  res.status(500).json({ error: 'Errore interno del server' });
});

// 8. Avvio server eccetto test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
}

export default app; // 8. Esporta l'app per test o altri usi
// (es. test con supertest)
