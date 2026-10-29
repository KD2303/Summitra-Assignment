import bcrypt from 'bcryptjs';

/**
 * In-memory fallback SQL store for Summitra.
 * Used when MySQL 8 service is unreachable or during zero-dependency local runs.
 * Supports events, ticket_categories, bookings, admins, and atomic row locking.
 */
class MemoryDatabase {
  constructor() {
    this.admins = [];
    this.events = [];
    this.ticket_categories = [];
    this.bookings = [];
    this.nextEventId = 7;
    this.nextBookingId = 101;
    this.nextCategoryId = 13;
    this.lockMutex = false;

    this.initializeData();
  }

  initializeData() {
    // Default admin: admin@summitra.com / adminpassword
    const adminHash = bcrypt.hashSync('adminpassword', 10);
    this.admins.push({
      id: 1,
      email: 'admin@summitra.com',
      password_hash: adminHash,
      created_at: new Date().toISOString()
    });

    this.events = [
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
        created_at: '2026-10-01 10:00:00'
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
        created_at: '2026-10-02 10:00:00'
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
        created_at: '2026-10-03 10:00:00'
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
        created_at: '2026-10-04 10:00:00'
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
        created_at: '2026-10-05 10:00:00'
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
        created_at: '2026-10-06 10:00:00'
      }
    ];

    this.ticket_categories = [
      { id: 1, event_id: 1, name: 'Early Bird Access', price: 249.00, seat_limit: 100 },
      { id: 2, event_id: 1, name: 'Standard Admission', price: 299.00, seat_limit: 200 },
      { id: 3, event_id: 1, name: 'VIP Executive Pass', price: 599.00, seat_limit: 50 },
      { id: 4, event_id: 2, name: 'Early Bird Access', price: 149.00, seat_limit: 50 },
      { id: 5, event_id: 2, name: 'Standard Admission', price: 189.00, seat_limit: 120 },
      { id: 6, event_id: 2, name: 'VIP & Workshop Pass', price: 349.00, seat_limit: 30 },
      { id: 7, event_id: 3, name: 'Standard Pass', price: 249.00, seat_limit: 400 },
      { id: 8, event_id: 3, name: 'VIP Backstage Pass', price: 499.00, seat_limit: 100 },
      { id: 9, event_id: 4, name: 'Executive Table Seat', price: 499.00, seat_limit: 120 },
      { id: 10, event_id: 5, name: 'Developer Pass', price: 149.00, seat_limit: 200 },
      { id: 11, event_id: 5, name: 'VIP All-Access', price: 299.00, seat_limit: 50 },
      { id: 12, event_id: 6, name: 'Full Congress Pass', price: 279.00, seat_limit: 300 }
    ];

    this.bookings = [
      {
        id: 101,
        event_id: 1,
        category_id: 3,
        name: 'Aarav Patel',
        email: 'aarav.patel@techindia.org',
        mobile: '+91 98765 43210',
        quantity: 2,
        total_amount: 1198.00,
        booking_date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'confirmed',
        idempotency_key: 'seed_idem_101'
      },
      {
        id: 102,
        event_id: 2,
        category_id: 6,
        name: 'Priya Sundaram',
        email: 'priya.sundaram@designcraft.co',
        mobile: '+91 98451 23456',
        quantity: 1,
        total_amount: 349.00,
        booking_date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'confirmed',
        idempotency_key: 'seed_idem_102'
      },
      {
        id: 103,
        event_id: 3,
        category_id: 7,
        name: 'Rohan Mehta',
        email: 'rohan.mehta@cloudnative.in',
        mobile: '+91 91234 56789',
        quantity: 3,
        total_amount: 747.00,
        booking_date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        status: 'confirmed',
        idempotency_key: 'seed_idem_103'
      },
      {
        id: 104,
        event_id: 4,
        category_id: 9,
        name: 'Ananya Iyer',
        email: 'ananya.iyer@venturepulse.vc',
        mobile: '+91 99887 76655',
        quantity: 2,
        total_amount: 998.00,
        booking_date: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        status: 'confirmed',
        idempotency_key: 'seed_idem_104'
      },
      {
        id: 105,
        event_id: 5,
        category_id: 11,
        name: 'Vikram Malhotra',
        email: 'vikram.m@fullstacklabs.dev',
        mobile: '+91 98111 22334',
        quantity: 1,
        total_amount: 299.00,
        booking_date: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
        status: 'confirmed',
        idempotency_key: 'seed_idem_105'
      }
    ];
  }

  // Mutex lock for atomic transactions
  async acquireLock() {
    while (this.lockMutex) {
      await new Promise(r => setImmediate(r));
    }
    this.lockMutex = true;
  }

  releaseLock() {
    this.lockMutex = false;
  }
}

export const memoryDb = new MemoryDatabase();
