import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { requireAuth } from '../middleware/auth.mjs';
import { requireRole } from '../middleware/roles.mjs';
import { loginLimiter } from '../middleware/rateLimit.mjs';
import { validate } from '../middleware/validate.mjs';
import { db } from '../db/memory.mjs';
import { signJwt } from '../utils/jwt.mjs';
import { KID } from '../utils/jwks.mjs';


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
    const token = await signJwt(user, { kid: KID, expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, user });
    
})
) ;
router.get('/me', requireAuth(), (req, res) => res.json({ user: req.user }));

router.post(
  '/register',
  requireAuth(),
  requireRole('ADMIN_ROLE'),
  asyncHandler(async (req, res) => {
    const user = await db.createUser(req.body); // valida con Zod a tua scelta
    res.status(201).json({ user });
  })
);

export default router;
