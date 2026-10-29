import { nanoid } from 'nanoid';

/**
 * SeatLockService
 * Manages active hold on seats during attendee checkout flow.
 * Default TTL is 5 minutes (300,000 ms).
 * Automatically releases expired locks or locks owned by disconnected sockets.
 */
class SeatLockService {
  constructor() {
    // Map of lockId -> { id, eventId, quantity, expiresAt, socketId, timerId }
    this.locks = new Map();
    // Map of socketId -> Set of lockIds
    this.socketLocks = new Map();
  }

  /**
   * Acquire a temporary hold on seats for an event
   */
  acquireLock(eventId, quantity, socketId = null, ttlMs = 5 * 60 * 1000) {
    const id = nanoid(12);
    const expiresAt = Date.now() + ttlMs;

    const timerId = setTimeout(() => {
      this.releaseLock(id);
    }, ttlMs);

    const lock = {
      id,
      eventId: Number(eventId),
      quantity: Number(quantity),
      expiresAt,
      socketId,
      timerId
    };

    this.locks.set(id, lock);

    if (socketId) {
      if (!this.socketLocks.has(socketId)) {
        this.socketLocks.set(socketId, new Set());
      }
      this.socketLocks.get(socketId).add(id);
    }

    return lock;
  }

  /**
   * Get total quantity of actively locked seats for an event
   */
  getLockedSeatCount(eventId) {
    const now = Date.now();
    let total = 0;
    for (const lock of this.locks.values()) {
      if (lock.eventId === Number(eventId) && lock.expiresAt > now) {
        total += lock.quantity;
      }
    }
    return total;
  }

  /**
   * Validate and consume a lock when completing a booking
   */
  consumeLock(lockId, eventId, quantity) {
    if (!lockId) return false;
    const lock = this.locks.get(lockId);
    if (!lock) return false;

    if (lock.expiresAt <= Date.now()) {
      this.releaseLock(lockId);
      return false;
    }

    if (lock.eventId !== Number(eventId) || lock.quantity !== Number(quantity)) {
      return false;
    }

    this.releaseLock(lockId);
    return true;
  }

  /**
   * Release a specific lock
   */
  releaseLock(lockId) {
    const lock = this.locks.get(lockId);
    if (!lock) return null;

    clearTimeout(lock.timerId);
    this.locks.delete(lockId);

    if (lock.socketId && this.socketLocks.has(lock.socketId)) {
      const set = this.socketLocks.get(lock.socketId);
      set.delete(lockId);
      if (set.size === 0) {
        this.socketLocks.delete(lock.socketId);
      }
    }

    return lock;
  }

  /**
   * Release all locks held by a disconnected socket
   * Returns list of affected eventIds so room broadcasts can trigger
   */
  releaseSocketLocks(socketId) {
    const lockIds = this.socketLocks.get(socketId);
    if (!lockIds) return [];

    const affectedEventIds = new Set();
    for (const lockId of lockIds) {
      const lock = this.locks.get(lockId);
      if (lock) {
        affectedEventIds.add(lock.eventId);
        clearTimeout(lock.timerId);
        this.locks.delete(lockId);
      }
    }
    this.socketLocks.delete(socketId);
    return Array.from(affectedEventIds);
  }

  /**
   * Get remaining lock details
   */
  getLock(lockId) {
    const lock = this.locks.get(lockId);
    if (!lock) return null;
    if (lock.expiresAt <= Date.now()) {
      this.releaseLock(lockId);
      return null;
    }
    return lock;
  }
}

export const seatLockService = new SeatLockService();
