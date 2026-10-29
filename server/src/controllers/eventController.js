import { eventService } from '../services/eventService.js';

export const eventController = {
  /**
   * GET /api/events
   * Public list with search, filter, pagination
   */
  async list(req, res, next) {
    try {
      const { q, location, from, to, page, limit } = req.query;
      const result = await eventService.listEvents({ q, location, from, to, page, limit });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/events/:id
   * Public details
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);
      res.status(200).json({ event });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/events
   * Admin create event
   */
  async create(req, res, next) {
    try {
      const created = await eventService.createEvent(req.body);
      
      // Emit socket event for real-time list refresh
      if (req.app.get('io')) {
        req.app.get('io').emit('events:changed', { action: 'create', eventId: created.id });
      }

      res.status(201).json({ event: created });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/events/:id
   * Admin update event
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await eventService.updateEvent(id, req.body);

      // Emit socket event for real-time list and detail refresh
      if (req.app.get('io')) {
        req.app.get('io').emit('events:changed', { action: 'update', eventId: id });
        req.app.get('io').to(`event:${id}`).emit('seats:update', {
          eventId: Number(id),
          availableSeats: updated.available_seats
        });
      }

      res.status(200).json({ event: updated });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/events/:id
   * Admin delete event
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await eventService.deleteEvent(id);

      // Emit socket event
      if (req.app.get('io')) {
        req.app.get('io').emit('events:changed', { action: 'delete', eventId: Number(id) });
      }

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/events/:id/bookings
   * Admin view bookings for an event
   */
  async getBookings(req, res, next) {
    try {
      const { id } = req.params;
      const bookings = await eventService.getEventBookings(id);
      res.status(200).json({ bookings });
    } catch (err) {
      next(err);
    }
  }
};
