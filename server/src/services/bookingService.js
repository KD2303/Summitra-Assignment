import { pool, withTransaction } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { seatLockService } from './seatLockService.js';

/**
 * BookingService
 * Handles atomic bookings with row-level locking (SELECT ... FOR UPDATE)
 * to strictly prevent overselling under high concurrency.
 */
export const bookingService = {
  /**
   * Create a booking atomically with row lock
   */
  async createBooking({ eventId, categoryId, name, email, mobile, quantity, lockId, idempotencyKey }, socketEmitter = null) {
    const evId = Number(eventId);
    const catId = categoryId ? Number(categoryId) : null;
    const qty = Number(quantity);

    if (qty <= 0) {
      throw new AppError('VALIDATION_ERROR', 'Quantity must be greater than 0', 400);
    }

    // 1. Idempotency Check
    if (idempotencyKey) {
      const [existing] = await pool.query(
        `SELECT b.*, e.title as event_title, e.available_seats 
         FROM bookings b
         JOIN events e ON b.event_id = e.id
         WHERE b.idempotency_key = ?`,
        [idempotencyKey]
      );

      if (existing && existing.length > 0) {
        const b = existing[0];
        return {
          id: b.id,
          eventId: b.event_id,
          eventTitle: b.event_title,
          status: b.status,
          totalAmount: parseFloat(b.total_amount),
          quantity: b.quantity,
          name: b.name,
          email: b.email,
          mobile: b.mobile,
          bookingDate: b.booking_date,
          availableSeats: b.available_seats,
          idempotentReplay: true
        };
      }
    }

    // 2. Atomic Row-Lock Transaction
    const result = await withTransaction(async (conn) => {
      // Lock event row
      const [events] = await conn.execute(
        `SELECT id, title, available_seats, total_seats, price, date, location 
         FROM events 
         WHERE id = ? 
         FOR UPDATE`,
        [evId]
      );

      if (!events || events.length === 0) {
        throw new AppError('NOT_FOUND', `Event with ID ${evId} not found`, 404);
      }

      const event = events[0];

      // Check seat availability
      if (event.available_seats < qty) {
        const remaining = Math.max(0, event.available_seats);
        const msg = remaining === 0
          ? 'Event is completely sold out.'
          : `Only ${remaining} seat${remaining > 1 ? 's' : ''} left. Cannot book ${qty} tickets.`;
        throw new AppError('INSUFFICIENT_SEATS', msg, 409, {
          availableSeats: remaining,
          requested: qty
        });
      }

      // Determine unit price and validated category ID server-side
      let validCatId = null;
      let unitPrice = parseFloat(event.price);
      let categoryName = 'Standard Pass';

      if (catId) {
        const [categories] = await conn.execute(
          `SELECT id, name, price, seat_limit FROM ticket_categories WHERE id = ? AND event_id = ?`,
          [catId, evId]
        );
        if (categories && categories.length > 0) {
          validCatId = categories[0].id;
          unitPrice = parseFloat(categories[0].price);
          categoryName = categories[0].name;
        }
      }

      const totalAmount = unitPrice * qty;
      const newAvailableSeats = event.available_seats - qty;

      // Decrement seats atomically
      await conn.execute(
        `UPDATE events SET available_seats = ? WHERE id = ?`,
        [newAvailableSeats, evId]
      );

      // Insert booking record with validated category ID
      const [bookingInsert] = await conn.execute(
        `INSERT INTO bookings (event_id, category_id, name, email, mobile, quantity, total_amount, idempotency_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [evId, validCatId, name, email, mobile, qty, totalAmount, idempotencyKey || null]
      );

      // Consume lock if provided
      if (lockId) {
        seatLockService.consumeLock(lockId, evId, qty);
      }

      return {
        id: bookingInsert.insertId,
        eventId: evId,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        categoryName,
        status: 'confirmed',
        totalAmount,
        quantity: qty,
        name,
        email,
        mobile,
        bookingDate: new Date().toISOString(),
        availableSeats: newAvailableSeats
      };
    });

    // 3. Emit real-time seat update to all clients in the event room
    if (socketEmitter) {
      try {
        socketEmitter(evId, result.availableSeats);
      } catch (err) {
        console.error('Failed to emit real-time seat update:', err.message);
      }
    }

    return result;
  },

  /**
   * Get booking by ID (Attendee access with ID & Email verification)
   */
  async getBookingById(id, email = null) {
    const bookingId = Number(id);
    const params = [bookingId];
    let sql = `
      SELECT b.id, b.event_id, b.category_id, b.name, b.email, b.mobile, b.quantity, 
             b.total_amount, b.booking_date, b.status, 
             e.title as event_title, e.date as event_date, e.location as event_location, e.img as event_img,
             tc.name as category_name
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN ticket_categories tc ON b.category_id = tc.id
      WHERE b.id = ?
    `;

    if (email) {
      sql += ' AND LOWER(b.email) = LOWER(?)';
      params.push(email);
    }

    const [rows] = await pool.query(sql, params);

    if (!rows || rows.length === 0) {
      throw new AppError('NOT_FOUND', `Booking #${id} not found`, 404);
    }

    return rows[0];
  },

  /**
   * List all bookings (Admin access with event filter and customer search)
   */
  async listAllBookings({ eventId = null, search = '' } = {}) {
    let sql = `
      SELECT b.id, b.event_id, b.category_id, b.name, b.email, b.mobile, b.quantity, 
             b.total_amount, b.booking_date, b.status, 
             e.title as event_title, e.location as event_location, e.date as event_date,
             tc.name as category_name
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN ticket_categories tc ON b.category_id = tc.id
      WHERE 1=1
    `;
    const params = [];

    if (eventId) {
      sql += ' AND b.event_id = ?';
      params.push(Number(eventId));
    }

    if (search && search.trim()) {
      sql += ' AND (b.name LIKE ? OR b.email LIKE ? OR b.mobile LIKE ? OR e.title LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY b.booking_date DESC LIMIT 200';

    const [rows] = await pool.query(sql, params);
    return rows;
  }
};
