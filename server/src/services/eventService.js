import { pool, query, withTransaction } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { seatLockService } from './seatLockService.js';

/**
 * EventService
 * Handles business logic for events, filtering, searching, categories, and seat calculations.
 */
export const eventService = {
  /**
   * Search, filter, and paginate events
   */
  async listEvents({ q, location, from, to, page = 1, limit = 12 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const params = [];

    if (q && q.trim()) {
      whereConditions.push('(e.title LIKE ? OR e.description LIKE ?)');
      const searchParam = `%${q.trim()}%`;
      params.push(searchParam, searchParam);
    }

    if (location && location.trim()) {
      whereConditions.push('e.location LIKE ?');
      params.push(`%${location.trim()}%`);
    }

    if (from) {
      whereConditions.push('e.date >= ?');
      params.push(new Date(from).toISOString().slice(0, 19).replace('T', ' '));
    }

    if (to) {
      whereConditions.push('e.date <= ?');
      params.push(new Date(to).toISOString().slice(0, 19).replace('T', ' '));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM events e ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0]?.total || 0;

    // Data query with ordering
    const dataSql = `
      SELECT 
        e.id, e.title, e.description, e.location, e.date, 
        e.total_seats, e.available_seats, e.price, e.img, e.created_at
      FROM events e
      ${whereClause}
      ORDER BY e.date ASC
      LIMIT ? OFFSET ?
    `;

    const [events] = await pool.query(dataSql, [...params, limitNum, offset]);

    // Attach active locked seats and compute effective availability
    const enrichedEvents = events.map(evt => {
      const lockedSeats = seatLockService.getLockedSeatCount(evt.id);
      const effectiveAvailable = Math.max(0, evt.available_seats - lockedSeats);
      return {
        ...evt,
        locked_seats: lockedSeats,
        effective_available_seats: effectiveAvailable
      };
    });

    return {
      events: enrichedEvents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  },

  /**
   * Get single event with ticket categories
   */
  async getEventById(id) {
    const eventId = Number(id);
    const [events] = await pool.query(
      `SELECT id, title, description, location, date, total_seats, available_seats, price, img, created_at 
       FROM events WHERE id = ?`,
      [eventId]
    );

    if (!events || events.length === 0) {
      throw new AppError('NOT_FOUND', `Event with ID ${id} not found`, 404);
    }

    const event = events[0];

    // Fetch ticket categories
    const [categories] = await pool.query(
      `SELECT id, event_id, name, price, seat_limit FROM ticket_categories WHERE event_id = ? ORDER BY price ASC`,
      [eventId]
    );

    const lockedSeats = seatLockService.getLockedSeatCount(eventId);
    const effectiveAvailable = Math.max(0, event.available_seats - lockedSeats);

    return {
      ...event,
      categories: categories || [],
      locked_seats: lockedSeats,
      effective_available_seats: effectiveAvailable
    };
  },

  /**
   * Create new event (Admin only)
   */
  async createEvent(data) {
    const { title, description, location, date, total_seats, price, img, categories } = data;
    const available_seats = total_seats;

    return await withTransaction(async (conn) => {
      const [result] = await conn.execute(
        `INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || '', location, date, total_seats, available_seats, price || 0, img || '']
      );

      const eventId = result.insertId;

      if (Array.isArray(categories) && categories.length > 0) {
        for (const cat of categories) {
          await conn.execute(
            `INSERT INTO ticket_categories (event_id, name, price, seat_limit) VALUES (?, ?, ?, ?)`,
            [eventId, cat.name, cat.price, cat.seat_limit || null]
          );
        }
      }

      return {
        id: eventId,
        title,
        description,
        location,
        date,
        total_seats,
        available_seats,
        price,
        img
      };
    });
  },

  /**
   * Update existing event (Admin only)
   */
  async updateEvent(id, data) {
    const eventId = Number(id);
    const { title, description, location, date, total_seats, price, img } = data;

    return await withTransaction(async (conn) => {
      // Check current event state
      const [existing] = await conn.execute(
        `SELECT id, total_seats, available_seats FROM events WHERE id = ? FOR UPDATE`,
        [eventId]
      );

      if (!existing || existing.length === 0) {
        throw new AppError('NOT_FOUND', `Event with ID ${id} not found`, 404);
      }

      const curr = existing[0];
      const bookedCount = curr.total_seats - curr.available_seats;

      if (total_seats !== undefined && total_seats < bookedCount) {
        throw new AppError(
          'VALIDATION_ERROR',
          `Cannot reduce total seats to ${total_seats}. ${bookedCount} seats have already been booked.`,
          400
        );
      }

      // Calculate new available seats if total_seats changed
      let newAvailableSeats = curr.available_seats;
      if (total_seats !== undefined) {
        newAvailableSeats = total_seats - bookedCount;
      }

      await conn.execute(
        `UPDATE events SET 
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          location = COALESCE(?, location),
          date = COALESCE(?, date),
          total_seats = COALESCE(?, total_seats),
          available_seats = ?,
          price = COALESCE(?, price),
          img = COALESCE(?, img)
        WHERE id = ?`,
        [
          title ?? null,
          description ?? null,
          location ?? null,
          date ?? null,
          total_seats ?? null,
          newAvailableSeats,
          price ?? null,
          img ?? null,
          eventId
        ]
      );

      const [updated] = await conn.execute(`SELECT * FROM events WHERE id = ?`, [eventId]);
      return updated[0];
    });
  },

  /**
   * Delete an event (Admin only)
   */
  async deleteEvent(id) {
    const eventId = Number(id);
    const [res] = await pool.query(`DELETE FROM events WHERE id = ?`, [eventId]);
    if (res.affectedRows === 0) {
      throw new AppError('NOT_FOUND', `Event with ID ${id} not found`, 404);
    }
    return { success: true, message: `Event ${id} successfully deleted` };
  },

  /**
   * Get all bookings for an event (Admin only)
   */
  async getEventBookings(eventId) {
    const id = Number(eventId);
    const [bookings] = await pool.query(
      `SELECT b.id, b.event_id, b.category_id, b.name, b.email, b.mobile, b.quantity, 
              b.total_amount, b.booking_date, b.status, tc.name as category_name
       FROM bookings b
       LEFT JOIN ticket_categories tc ON b.category_id = tc.id
       WHERE b.event_id = ?
       ORDER BY b.booking_date DESC`,
      [id]
    );

    return bookings;
  }
};
