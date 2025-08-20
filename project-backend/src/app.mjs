import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import rolesRouter from '../routes/roles.js';
import documentsRouter from '../routes/documents.js';
import authMiddleware from '../middleware/authMiddleware.js';

export function createApp({ storage }) {
  if (!storage) throw new Error("Missing storage instance");

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use('/roles', rolesRouter);
  app.use('/documents', authMiddleware, documentsRouter({ storage }));

  return app;
}
