import bcrypt from 'bcryptjs';
import { pool, testConnection } from './db/connection.js';

async function seed() {
  console.log('🌱 Starting database seed...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Aborting seed.');
    process.exit(1);
  }

  try {
    // 1. Seed Admin
    const adminEmail = 'admin@summitra.com';
    const adminPassword = 'adminpassword';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `INSERT INTO admins (email, password_hash) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [adminEmail, passwordHash]
    );
    console.log(`👤 Seeded admin: ${adminEmail} (password: ${adminPassword})`);

    // 2. Clear old events and seed fresh
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM ticket_categories');
    await pool.query('DELETE FROM events');

    const sampleEvents = [
      {
        id: 1,
        title: 'India AI & Deep Tech Summit 2026',
        description: 'Join pioneering AI researchers, founders, and engineers exploring next-generation foundation models, autonomous agents, and production neural architectures. Keynotes from industry luminaries.',
        location: 'Bengaluru, Karnataka (BIEC Bengaluru)',
        date: '2026-11-15 09:00:00',
        total_seats: 350,
        available_seats: 48,
        price: 299.00,
        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        categories: [
          { name: 'Early Bird Access', price: 249.00, seat_limit: 100 },
          { name: 'Standard Admission', price: 299.00, seat_limit: 200 },
          { name: 'VIP Executive Pass', price: 599.00, seat_limit: 50 }
        ]
      },
      {
        id: 2,
        title: 'NextGen Design Systems & Spatial UI',
        description: 'A masterclass symposium on scalable tokens, WCAG 2.2 accessibility, fluid motion, micro-interactions, and spatial design patterns for modern web ecosystems.',
        location: 'Mumbai, Maharashtra (Jio World Convention Centre, BKC)',
        date: '2026-11-20 10:00:00',
        total_seats: 200,
        available_seats: 12,
        price: 189.00,
        img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        categories: [
          { name: 'Early Bird Access', price: 149.00, seat_limit: 50 },
          { name: 'Standard Admission', price: 189.00, seat_limit: 120 },
          { name: 'VIP & Workshop Pass', price: 349.00, seat_limit: 30 }
        ]
      },
      {
        id: 3,
        title: 'Cloud Native & Distributed Systems India',
        description: 'Architecting resilient multi-cloud architectures, Kubernetes orchestration at scale, low-latency edge computing, and zero-trust security postures.',
        location: 'New Delhi (Bharat Mandapam, Pragati Maidan)',
        date: '2026-12-05 08:30:00',
        total_seats: 500,
        available_seats: 185,
        price: 249.00,
        img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        categories: [
          { name: 'Standard Pass', price: 249.00, seat_limit: 400 },
          { name: 'VIP Backstage Pass', price: 499.00, seat_limit: 100 }
        ]
      },
      {
        id: 4,
        title: 'Summitra Founders & Tech Leadership Conclave',
        description: 'An exclusive evening connecting elite technology founders, venture partners, and visionary operators shaping the future of global enterprise and intelligence.',
        location: 'Hyderabad, Telangana (HICC Novotel, HITEC City)',
        date: '2026-12-12 18:00:00',
        total_seats: 120,
        available_seats: 4,
        price: 499.00,
        img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
        categories: [
          { name: 'Executive Table Seat', price: 499.00, seat_limit: 120 }
        ]
      },
      {
        id: 5,
        title: 'Full-Stack Web Performance & Edge Architecture',
        description: 'Deep-dive into Vite, React Server Components, WebAssembly, edge caching, real-time WebSockets, and sub-second p95 latency optimization.',
        location: 'Pune, Maharashtra (Balewadi High Street Center)',
        date: '2026-12-18 09:30:00',
        total_seats: 250,
        available_seats: 92,
        price: 149.00,
        img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        categories: [
          { name: 'Developer Pass', price: 149.00, seat_limit: 200 },
          { name: 'VIP All-Access', price: 299.00, seat_limit: 50 }
        ]
      },
      {
        id: 6,
        title: 'Cybersecurity & Zero Trust Architecture Congress',
        description: 'Live threat mitigation war rooms, cryptosystems, enterprise hardening, and compliance governance for mission-critical digital infrastructure.',
        location: 'Chennai, Tamil Nadu (Chennai Trade Centre, Nandambakkam)',
        date: '2027-01-14 09:00:00',
        total_seats: 300,
        available_seats: 0,
        price: 279.00,
        img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        categories: [
          { name: 'Full Congress Pass', price: 279.00, seat_limit: 300 }
        ]
      }
    ];

    for (const evt of sampleEvents) {
      const [res] = await pool.query(
        `INSERT INTO events (id, title, description, location, date, total_seats, available_seats, price, img)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [evt.id, evt.title, evt.description, evt.location, evt.date, evt.total_seats, evt.available_seats, evt.price, evt.img]
      );

      for (const cat of evt.categories) {
        await pool.query(
          `INSERT INTO ticket_categories (event_id, name, price, seat_limit) VALUES (?, ?, ?, ?)`,
          [evt.id, cat.name, cat.price, cat.seat_limit]
        );
      }
    }

    console.log(`✨ Successfully seeded ${sampleEvents.length} events with categories!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seed();
