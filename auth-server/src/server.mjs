import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from './routes/auth.mjs';
import { getJWKS } from './utils/jwks.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/.well-known/jwks.json', async (req, res) => {
  res.json(await getJWKS());
});

app.use('/auth', authRoutes);
app.get('/health', (req, res) => res.json({ ok: true }));
app.use(errorHandler);

app.listen(process.env.PORT || 8081, () =>
  console.log(`[auth-server] listening on :${process.env.PORT || 8081}`)
);
