import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { requireAuth } from '../middleware/auth.mjs';
import { requireRole } from '../middleware/roles.mjs';
import { loginLimiter } from '../middleware/rateLimit.mjs';
import { validate } from '../middleware/validate.mjs';
import { db } from '../db/userRepository.js'; // ✅ usa MongoDB
import { signJwt } from '../utils/jwt.mjs';


const router = Router();

const LoginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6)
});

router.post(
  '/login',
  loginLimiter,
  validate(LoginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await db.verifyCredentials(username, password);
    if (!user) return res.status(401).json({ error: 'Credenziali non valide' });
    // Firma JWT leggendo privJwk + kid già gestiti in jwt.mjs
    const token = await signJwt({ sub: user.id, role: user.role });
    res.json({ token, user });
  })
);

router.get('/me', requireAuth(), (req, res) => res.json({ user: req.user }));

router.post(
  '/register',
  requireAuth(),
  requireRole('ADMIN_ROLE'),
  asyncHandler(async (req, res) => {

    const { username } = req.body;
    //check if user already exists
    

    const existing = await db.findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Utente già esistente' });
    } 


    const user = await db.createUser(req.body); // puoi validare con Zod
    res.status(201).json({ user });
  })
);

export default router;







