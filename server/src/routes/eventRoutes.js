import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../validators/schemas.js';

const router = Router();

// Public routes
router.get('/', eventController.list);
router.get('/:id', eventController.getById);

// Admin-protected routes
router.post('/', authenticateAdmin, validate(createEventSchema), eventController.create);
router.put('/:id', authenticateAdmin, validate(updateEventSchema), eventController.update);
router.delete('/:id', authenticateAdmin, eventController.delete);
router.get('/:id/bookings', authenticateAdmin, eventController.getBookings);

export default router;
