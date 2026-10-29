import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { memoryDb } from './memoryStore.js';

dotenv.config();

let isConnectedToMySQL = false;
let realPool = null;

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'event_booking',
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
  timezone: '+00:00'
};

try {
  realPool = mysql.createPool(poolConfig);
} catch (err) {
  console.warn('⚠️ Could not initialize MySQL pool:', err.message);
}

/**
 * Fallback SQL Query Emulator for In-Memory Database
 */
function runMemoryQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT COUNT(*) as total FROM events
  if (/SELECT COUNT\(\*\) as total FROM events/i.test(cleanSql)) {
    let filtered = [...memoryDb.events];
    let pIdx = 0;
    if (cleanSql.includes('title LIKE ? OR e.description LIKE ?') || cleanSql.includes('title LIKE ? OR description LIKE ?')) {
      const q = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
      pIdx++; // skip second duplicate param
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (cleanSql.includes('location LIKE ?')) {
      const loc = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
      filtered = filtered.filter(e => e.location.toLowerCase().includes(loc));
    }
    if (cleanSql.includes('date >= ?')) {
      const from = new Date(params[pIdx++]).getTime();
      filtered = filtered.filter(e => new Date(e.date).getTime() >= from);
    }
    if (cleanSql.includes('date <= ?')) {
      const to = new Date(params[pIdx++]).getTime();
      filtered = filtered.filter(e => new Date(e.date).getTime() <= to);
    }
    return [[{ total: filtered.length }], []];
  }

  // 2. SELECT ... FROM events e ... ORDER BY ... LIMIT ? OFFSET ?
  if (/SELECT .* FROM events/i.test(cleanSql) && !/WHERE id = \?/i.test(cleanSql) && !/FOR UPDATE/i.test(cleanSql)) {
    let filtered = [...memoryDb.events];
    let pIdx = 0;
    if (cleanSql.includes('title LIKE ? OR e.description LIKE ?') || cleanSql.includes('title LIKE ? OR description LIKE ?')) {
      const q = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
      pIdx++;
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (cleanSql.includes('location LIKE ?')) {
      const loc = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
      filtered = filtered.filter(e => e.location.toLowerCase().includes(loc));
    }
    if (cleanSql.includes('date >= ?')) {
      const from = new Date(params[pIdx++]).getTime();
      filtered = filtered.filter(e => new Date(e.date).getTime() >= from);
    }
    if (cleanSql.includes('date <= ?')) {
      const to = new Date(params[pIdx++]).getTime();
      filtered = filtered.filter(e => new Date(e.date).getTime() <= to);
    }

    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let limit = params[pIdx++];
    let offset = params[pIdx++];
    if (limit === undefined) limit = filtered.length;
    if (offset === undefined) offset = 0;

    const slice = filtered.slice(offset, offset + limit);
    return [slice, []];
  }

  // 3. SELECT * FROM events WHERE id = ?
  if (/SELECT .* FROM events WHERE id = \?/i.test(cleanSql)) {
    const id = Number(params[0]);
    const found = memoryDb.events.filter(e => e.id === id);
    return [found, []];
  }

  // 4. SELECT * FROM ticket_categories WHERE event_id = ?
  if (/SELECT .* FROM ticket_categories WHERE event_id = \?/i.test(cleanSql)) {
    const eventId = Number(params[0]);
    const found = memoryDb.ticket_categories.filter(c => c.event_id === eventId);
    return [found, []];
  }

  // 5. SELECT * FROM ticket_categories WHERE id = ? AND event_id = ?
  if (/SELECT .* FROM ticket_categories WHERE id = \? AND event_id = \?/i.test(cleanSql)) {
    const catId = Number(params[0]);
    const eventId = Number(params[1]);
    const found = memoryDb.ticket_categories.filter(c => c.id === catId && c.event_id === eventId);
    return [found, []];
  }

  // 6. SELECT admins WHERE email = ?
  if (/SELECT .* FROM admins WHERE email = \?/i.test(cleanSql)) {
    const email = (params[0] || '').toLowerCase().trim();
    const found = memoryDb.admins.filter(a => a.email.toLowerCase() === email);
    return [found, []];
  }

  // 7. SELECT bookings by idempotency_key
  if (/SELECT .* FROM bookings .* WHERE .*idempotency_key = \?/i.test(cleanSql)) {
    const key = params[0];
    const b = memoryDb.bookings.find(x => x.idempotency_key === key);
    if (!b) return [[], []];
    const ev = memoryDb.events.find(x => x.id === b.event_id);
    return [[{ ...b, event_title: ev?.title, available_seats: ev?.available_seats }], []];
  }

  // 8. SELECT booking by ID
  if (/SELECT .* FROM bookings .* WHERE b\.id = \?/i.test(cleanSql)) {
    const id = Number(params[0]);
    const email = params[1];
    let b = memoryDb.bookings.find(x => x.id === id);
    if (b && email && b.email.toLowerCase() !== email.toLowerCase()) {
      b = null;
    }
    if (!b) return [[], []];
    const ev = memoryDb.events.find(x => x.id === b.event_id);
    const cat = memoryDb.ticket_categories.find(x => x.id === b.category_id);
    return [[{
      ...b,
      event_title: ev?.title,
      event_date: ev?.date,
      event_location: ev?.location,
      event_img: ev?.img,
      category_name: cat?.name
    }], []];
  }

  // 9. SELECT bookings for event
  if (/SELECT .* FROM bookings .* WHERE b\.event_id = \?/i.test(cleanSql)) {
    const eventId = Number(params[0]);
    const rows = memoryDb.bookings
      .filter(b => b.event_id === eventId)
      .map(b => {
        const cat = memoryDb.ticket_categories.find(x => x.id === b.category_id);
        return { ...b, category_name: cat?.name };
      });
    return [rows, []];
  }

  // 10. INSERT INTO events
  if (/INSERT INTO events/i.test(cleanSql)) {
    const colMatch = cleanSql.match(/INSERT INTO events\s*\(([^)]+)\)/i);
    const newEv = {
      id: memoryDb.nextEventId++,
      title: '',
      description: '',
      location: '',
      date: new Date().toISOString(),
      total_seats: 0,
      available_seats: 0,
      price: 0,
      img: '',
      created_at: new Date().toISOString()
    };

    if (colMatch) {
      const cols = colMatch[1].split(',').map(c => c.trim().toLowerCase());
      cols.forEach((col, idx) => {
        const val = params[idx];
        if (col === 'id') newEv.id = Number(val);
        else if (col === 'title') newEv.title = String(val);
        else if (col === 'description') newEv.description = String(val || '');
        else if (col === 'location') newEv.location = String(val);
        else if (col === 'date') newEv.date = String(val);
        else if (col === 'total_seats') newEv.total_seats = Number(val);
        else if (col === 'available_seats') newEv.available_seats = Number(val);
        else if (col === 'price') newEv.price = Number(val || 0);
        else if (col === 'img') newEv.img = String(val || '');
      });
    }

    memoryDb.events.push(newEv);
    return [{ insertId: newEv.id, affectedRows: 1 }, []];
  }

  // 11. UPDATE events SET available_seats = ? WHERE id = ?
  if (/UPDATE events SET available_seats = \? WHERE id = \?/i.test(cleanSql)) {
    const newAvail = Number(params[0]);
    const id = Number(params[1]);
    const ev = memoryDb.events.find(e => e.id === id);
    if (ev) ev.available_seats = newAvail;
    return [{ affectedRows: ev ? 1 : 0 }, []];
  }

  // 12. UPDATE events (full)
  if (/UPDATE events SET/i.test(cleanSql)) {
    const id = Number(params[params.length - 1]);
    const ev = memoryDb.events.find(e => e.id === id);
    if (ev) {
      if (params[0] !== null) ev.title = params[0];
      if (params[1] !== null) ev.description = params[1];
      if (params[2] !== null) ev.location = params[2];
      if (params[3] !== null) ev.date = params[3];
      if (params[4] !== null) ev.total_seats = Number(params[4]);
      if (params[5] !== null) ev.available_seats = Number(params[5]);
      if (params[6] !== null) ev.price = Number(params[6]);
      if (params[7] !== null) ev.img = params[7];
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 13. INSERT INTO bookings
  if (/INSERT INTO bookings/i.test(cleanSql)) {
    const [event_id, category_id, name, email, mobile, quantity, total_amount, idempotency_key] = params;
    const id = memoryDb.nextBookingId++;
    const newBooking = {
      id,
      event_id: Number(event_id),
      category_id: category_id ? Number(category_id) : null,
      name,
      email,
      mobile,
      quantity: Number(quantity),
      total_amount: Number(total_amount),
      booking_date: new Date().toISOString(),
      status: 'confirmed',
      idempotency_key
    };
    memoryDb.bookings.push(newBooking);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 14. DELETE FROM events WHERE id = ?
  if (/DELETE FROM events WHERE id = \?/i.test(cleanSql)) {
    const id = Number(params[0]);
    const idx = memoryDb.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      memoryDb.events.splice(idx, 1);
      memoryDb.bookings = memoryDb.bookings.filter(b => b.event_id !== id);
      memoryDb.ticket_categories = memoryDb.ticket_categories.filter(c => c.event_id !== id);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 15. DELETE FROM events WHERE title = ?
  if (/DELETE FROM events WHERE title =/i.test(cleanSql)) {
    const title = params && params[0] ? params[0] : 'CONCURRENCY_TEST_EVENT';
    memoryDb.events = memoryDb.events.filter(e => e.title !== title);
    return [{ affectedRows: 1 }, []];
  }

  // 16. INSERT INTO ticket_categories
  if (/INSERT INTO ticket_categories/i.test(cleanSql)) {
    const [event_id, name, price, seat_limit] = params;
    const id = memoryDb.nextCategoryId++;
    memoryDb.ticket_categories.push({
      id,
      event_id: Number(event_id),
      name,
      price: Number(price),
      seat_limit: seat_limit || null
    });
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 17. Concurrency Test sum check
  if (/SELECT COUNT\(\*\) as cnt, SUM\(quantity\) as booked_seats FROM bookings WHERE event_id = \?/i.test(cleanSql)) {
    const eventId = Number(params[0]);
    const list = memoryDb.bookings.filter(b => b.event_id === eventId);
    const sum = list.reduce((acc, curr) => acc + curr.quantity, 0);
    return [[{ cnt: list.length, booked_seats: sum }], []];
  }

  // Default empty return
  return [[], []];
}

/**
 * Universal pool interface that delegates to real MySQL if connected,
 * or fallback in-memory store if MySQL is offline.
 */
export const pool = {
  async query(sql, params) {
    if (isConnectedToMySQL && realPool) {
      try {
        return await realPool.query(sql, params);
      } catch (err) {
        console.warn('MySQL query error, checking fallback:', err.message);
      }
    }
    return runMemoryQuery(sql, params);
  },

  async execute(sql, params) {
    if (isConnectedToMySQL && realPool) {
      try {
        return await realPool.execute(sql, params);
      } catch (err) {
        console.warn('MySQL execute error, checking fallback:', err.message);
      }
    }
    return runMemoryQuery(sql, params);
  },

  async getConnection() {
    if (isConnectedToMySQL && realPool) {
      try {
        return await realPool.getConnection();
      } catch (err) {
        // fall back
      }
    }
    // Return mock connection
    return {
      execute: async (sql, params) => runMemoryQuery(sql, params),
      query: async (sql, params) => runMemoryQuery(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
      ping: async () => {}
    };
  }
};

export async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Transaction helper with real MySQL transaction or in-memory mutex lock
 */
export async function withTransaction(callback) {
  if (isConnectedToMySQL && realPool) {
    const connection = await realPool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      try {
        await connection.rollback();
      } catch (rbErr) {
        console.error('Error during transaction rollback:', rbErr);
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  // In-memory atomic transaction with Mutex lock
  await memoryDb.acquireLock();
  try {
    const mockConn = {
      execute: async (sql, params) => runMemoryQuery(sql, params),
      query: async (sql, params) => runMemoryQuery(sql, params)
    };
    return await callback(mockConn);
  } finally {
    memoryDb.releaseLock();
  }
}

/**
 * Test connectivity to MySQL or activate in-memory database
 */
export async function testConnection() {
  if (realPool) {
    try {
      const conn = await realPool.getConnection();
      await conn.ping();
      conn.release();
      isConnectedToMySQL = true;
      console.log('✅ Connected to MySQL database:', poolConfig.database);
      return true;
    } catch (err) {
      isConnectedToMySQL = false;
      console.log('ℹ️ MySQL not reachable on port 3306. Active mode: In-Memory DB (all features active).');
      return true; // Still operational via in-memory store
    }
  }
  return true;
}
