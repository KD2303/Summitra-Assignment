import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { loginSchema } from '../validators/schemas.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticateAdmin, authController.logout);
router.get('/me', authenticateAdmin, authController.me);

export default router;
