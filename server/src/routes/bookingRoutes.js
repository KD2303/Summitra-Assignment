import { Router } from 'express';
import { bookingController } from '../controllers/bookingController.js';
import { validate } from '../middleware/validate.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { bookingSchema } from '../validators/schemas.js';

const router = Router();

// Public booking creation with rate limiting and Zod schema validation
router.post('/', bookingLimiter, validate(bookingSchema), bookingController.create);

// Public booking / ticket lookup
router.get('/:id', bookingController.getById);

export default router;
