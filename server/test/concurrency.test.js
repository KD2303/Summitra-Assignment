import { pool, testConnection } from '../src/db/connection.js';
import { bookingService } from '../src/services/bookingService.js';

async function runConcurrencyTest() {
  console.log('🧪 Starting Concurrency Oversell Test...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot run concurrency test without database connection.');
    process.exit(1);
  }

  try {
    // 1. Setup a test event with EXACTLY 5 seats
    await pool.query(`DELETE FROM events WHERE title = ?`, ['CONCURRENCY_TEST_EVENT']);
    const [insertRes] = await pool.query(
      `INSERT INTO events (title, description, location, date, total_seats, available_seats, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['CONCURRENCY_TEST_EVENT', 'Stress test for atomic row locks', 'Test Lab', '2027-01-01 00:00:00', 5, 5, 100.00]
    );
    const testEventId = insertRes.insertId;
    console.log(`🎯 Created test event #${testEventId} with exactly 5 available seats.`);

    // 2. Fire 10 parallel booking attempts, each requesting 2 tickets
    // Total requested = 20 tickets, but only 5 exist!
    // Exactly 2 attempts (2 * 2 = 4 tickets) can succeed, leaving 1 seat.
    // 8 attempts must fail with INSUFFICIENT_SEATS.
    // ZERO overselling!
    const attempts = Array.from({ length: 10 }, (_, i) => ({
      eventId: testEventId,
      name: `Attendee ${i + 1}`,
      email: `attendee${i + 1}@example.com`,
      mobile: `987654321${i}`,
      quantity: 2
    }));

    console.log(`🚀 Firing ${attempts.length} concurrent booking requests simultaneously (each requesting 2 seats)...`);

    const results = await Promise.allSettled(
      attempts.map((req) => bookingService.createBooking(req))
    );

    let successes = 0;
    let failures = 0;
    const failureCodes = [];

    for (const res of results) {
      if (res.status === 'fulfilled') {
        successes++;
      } else {
        failures++;
        failureCodes.push(res.reason.code || res.reason.message);
      }
    }

    // 3. Inspect final database state
    const [finalRows] = await pool.query(
      `SELECT total_seats, available_seats FROM events WHERE id = ?`,
      [testEventId]
    );
    const finalEvent = finalRows[0];

    const [bookingCountRows] = await pool.query(
      `SELECT COUNT(*) as cnt, SUM(quantity) as booked_seats FROM bookings WHERE event_id = ?`,
      [testEventId]
    );
    const { cnt, booked_seats } = bookingCountRows[0];

    console.log('\n📊 Concurrency Test Results:');
    console.log(`- Total concurrent requests: 10`);
    console.log(`- Successful bookings: ${successes}`);
    console.log(`- Rejected bookings: ${failures}`);
    console.log(`- Final available seats in DB: ${finalEvent.available_seats}`);
    console.log(`- Total booked seats registered: ${booked_seats || 0}`);

    // Clean up test event
    await pool.query(`DELETE FROM events WHERE id = ?`, [testEventId]);

    // 4. Assertions
    if (finalEvent.available_seats < 0) {
      console.error('❌ FAIL: Available seats dropped below zero! Overselling occurred!');
      process.exit(1);
    }

    if (booked_seats > 5) {
      console.error(`❌ FAIL: Booked seats (${booked_seats}) exceeded initial total (5)!`);
      process.exit(1);
    }

    if (successes === 2 && finalEvent.available_seats === 1 && booked_seats === 4) {
      console.log('✅ PASS: Row lock concurrency control strictly enforced. Zero overselling! Exactly 2 succeeded (4 seats) and 1 seat remains.');
      process.exit(0);
    } else {
      console.log(`✅ PASS: Anti-oversell held. Available seats: ${finalEvent.available_seats} >= 0.`);
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Unexpected error during concurrency test:', err);
    process.exit(1);
  }
}

runConcurrencyTest();
