// src/middleware/errorHandler.mjs
export function errorHandler(err, req, res, _next) {
  // Zod
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: 'Input non valido', details: err.issues });
  }
  // jose / JWT
  if (err?.code === 'ERR_JWT_EXPIRED') {
    return res.status(401).json({ error: 'Token scaduto' });
  }
  if (err?.code?.startsWith?.('ERR_JWT_')) {
    return res.status(401).json({ error: 'Token non valido' });
  }
  // generico
  console.error('[ERROR]', err);
  return res.status(500).json({ error: 'Errore interno' });
}
