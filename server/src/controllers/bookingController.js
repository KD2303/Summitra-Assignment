import { bookingService } from '../services/bookingService.js';

export const bookingController = {
  /**
   * POST /api/bookings
   * Public create booking
   */
  async create(req, res, next) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey;
      const io = req.app.get('io');

      // Helper to emit real-time seat update to all clients in the event room
      const socketEmitter = (eventId, availableSeats) => {
        if (io) {
          io.to(`event:${eventId}`).emit('seats:update', {
            eventId: Number(eventId),
            availableSeats
          });
          // Also broadcast globally for card badges in listings
          io.emit('seats:changed', {
            eventId: Number(eventId),
            availableSeats
          });
        }
      };

      const booking = await bookingService.createBooking(
        {
          ...req.body,
          idempotencyKey
        },
        socketEmitter
      );

      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/bookings/:id
   * Public view booking with ID (and optional email verification)
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { email } = req.query;
      const booking = await bookingService.getBookingById(id, email);
      res.status(200).json({ booking });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/bookings
   * Admin view all bookings with optional event filter and customer search
   */
  async listAll(req, res, next) {
    try {
      const { eventId, search } = req.query;
      const bookings = await bookingService.listAllBookings({ eventId, search });
      res.status(200).json({ bookings });
    } catch (err) {
      next(err);
    }
  }
};
