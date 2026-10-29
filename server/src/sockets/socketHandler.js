import { pool } from '../db/connection.js';
import { seatLockService } from '../services/seatLockService.js';

/**
 * Configure Socket.IO real-time subscriptions, rooms, and seat locking
 */
export function setupSocketIO(io) {
  io.on('connection', (socket) => {
    // 1. Join event room for targeted broadcasts
    socket.on('event:join', ({ eventId }) => {
      if (eventId) {
        const room = `event:${eventId}`;
        socket.join(room);
      }
    });

    // 2. Leave event room
    socket.on('event:leave', ({ eventId }) => {
      if (eventId) {
        socket.leave(`event:${eventId}`);
      }
    });

    // 3. Request temporary seat lock during checkout
    socket.on('seats:lock', async ({ eventId, quantity }, callback) => {
      try {
        const evId = Number(eventId);
        const qty = Number(quantity);

        if (!evId || qty <= 0) {
          if (callback) callback({ error: 'Invalid event or quantity' });
          return;
        }

        // Check current database seats
        const [rows] = await pool.query(`SELECT available_seats FROM events WHERE id = ?`, [evId]);
        if (!rows || rows.length === 0) {
          if (callback) callback({ error: 'Event not found' });
          return;
        }

        const dbAvailable = rows[0].available_seats;
        const currentLocked = seatLockService.getLockedSeatCount(evId);
        const effectiveAvailable = dbAvailable - currentLocked;

        if (effectiveAvailable < qty) {
          if (callback) callback({ error: 'Insufficient seats available to lock' });
          return;
        }

        // Acquire lock
        const lock = seatLockService.acquireLock(evId, qty, socket.id);

        if (callback) {
          callback({
            lockId: lock.id,
            expiresAt: lock.expiresAt,
            quantity: lock.quantity,
            eventId: lock.eventId
          });
        }

        // Notify room of new availability
        const newEffective = Math.max(0, dbAvailable - seatLockService.getLockedSeatCount(evId));
        io.to(`event:${evId}`).emit('seats:update', {
          eventId: evId,
          availableSeats: dbAvailable,
          effectiveAvailableSeats: newEffective
        });
      } catch (err) {
        console.error('Error locking seats:', err);
        if (callback) callback({ error: 'Failed to hold seats' });
      }
    });

    // 4. Release seat lock
    socket.on('seats:unlock', async ({ lockId }, callback) => {
      try {
        const released = seatLockService.releaseLock(lockId);
        if (released) {
          const [rows] = await pool.query(`SELECT available_seats FROM events WHERE id = ?`, [released.eventId]);
          if (rows && rows.length > 0) {
            const dbAvailable = rows[0].available_seats;
            const effective = Math.max(0, dbAvailable - seatLockService.getLockedSeatCount(released.eventId));
            io.to(`event:${released.eventId}`).emit('seats:update', {
              eventId: released.eventId,
              availableSeats: dbAvailable,
              effectiveAvailableSeats: effective
            });
          }
        }
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ error: 'Failed to release lock' });
      }
    });

    // 5. Clean up when user closes tab or disconnects
    socket.on('disconnect', async () => {
      const affectedEvents = seatLockService.releaseSocketLocks(socket.id);
      for (const eventId of affectedEvents) {
        try {
          const [rows] = await pool.query(`SELECT available_seats FROM events WHERE id = ?`, [eventId]);
          if (rows && rows.length > 0) {
            const dbAvailable = rows[0].available_seats;
            const effective = Math.max(0, dbAvailable - seatLockService.getLockedSeatCount(eventId));
            io.to(`event:${eventId}`).emit('seats:update', {
              eventId,
              availableSeats: dbAvailable,
              effectiveAvailableSeats: effective
            });
          }
        } catch (err) {
          console.error('Error updating seats after disconnect:', err);
        }
      }
    });
  });
}
