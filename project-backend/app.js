
console.log("Provider:", process.env.RPC_URL);
// app.js
require('dotenv').config(); // 1. Carica .env

const express = require('express');
const cors = require('cors');

const app = express(); // 2. Crea istanza server
const PORT = process.env.PORT || 3000;

// 3. Middleware globali
app.use(cors());               // Abilita CORS
app.use(express.json());       // Parsing JSON nelle richieste


const authRoutes = require('./routes/auth'); // Importa rotte di autenticazione
app.use('/auth', authRoutes); // Rotte di autenticazione

const rolesRoutes = require('./routes/roles');
app.use('/roles', rolesRoutes);

// 4. Rotte di test
app.get('/', (req, res) => {
  res.send('Backend DocumentRegistry attivo 🚀');
});

// 5. Avvio server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
const authMiddleware = require('./middleware/authMiddleware'); // Importa middleware di autenticazione
//6 . Middleware di autenticazione
app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Accesso autorizzato ✅',
    user: req.user
  });
});