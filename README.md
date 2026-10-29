# Summitra — Smart Event Booking System

Summitra is a high-performance, accessible, enterprise event booking platform engineered with **atomic row-locking transactions (zero overselling guarantee)**, **sub-second Socket.IO seat synchronization**, and **cryptographically verifiable QR passes**.

Modeled on the Summitra design system reference ([Summitra Webflow](https://summitra-flowz.webflow.io/)), featuring a dark, high-contrast aesthetic with purple accents (`#8617d0` / `#933be1`), typography in **Manrope**, and strict adherence to **WCAG 2.2 AA**.

---

## 🚀 Key Features

1. **Anti-Oversell Concurrency Control:**
   - Atomic database transactions with `SELECT ... FOR UPDATE` row locks.
   - Idempotency key tracking prevents double-submits.
   - Automated concurrency stress test proves zero overselling under simultaneous bookings.

2. **Real-Time Seat Synchronization (Socket.IO):**
   - Targeted event rooms (`event:{id}`) emit immediate `seats:update` events on transaction commit.
   - Dual-state live badges: `N seats left`, `Only N left` (<= 20%), or `Sold out`.
   - Real-time seat hold (TTL countdown) during attendee checkout.

3. **Verifiable Digital QR Tickets & PNG Pass:**
   - Cryptographic QR code generation on the client with ticket ID, attendee info, and event ID.
   - Downloadable high-resolution digital ticket pass (PNG) via `html2canvas`.
   - Complete accessible text equivalent for assistive technologies.

4. **Full Admin Operations Portal:**
   - Admin authentication with bcrypt + JWT (httpOnly cookie & Bearer token).
   - Event CRUD with protection against lowering total seats below booked count.
   - Per-event attendee bookings inspector.

5. **WCAG 2.2 AA Accessibility & Responsive Design:**
   - Keyboard-first navigation with skip link, focus traps, and visible focus rings.
   - All 7 component states implemented: default, hover, focus-visible, active, disabled, loading, error.
   - `prefers-reduced-motion` compliance (disables parallax and confetti).
   - Multi-modal cues (never relies on color alone).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, TanStack Query, React Router |
| **Backend** | Node.js, Express, Socket.IO, mysql2/promise, Zod, bcryptjs, jsonwebtoken |
| **Database** | MySQL 8 (InnoDB) + seamless dual-mode in-memory fallback |
| **Testing** | Node.js Concurrency Stress Script (`server/test/concurrency.test.js`) |
| **DevOps** | Docker Compose (`summitra-mysql`), Concurrently |

---

## 📋 Database Schema

The database schema is defined in [`event_booking.sql`](file:///d:/Dev%20Stuff/Summitra-Assignment/event_booking.sql):

- **`events`**: `id`, `title`, `description`, `location`, `date`, `total_seats`, `available_seats`, `price`, `img`, `created_at` (Indexes on `date`, `location`, and FULLTEXT `idx_search`).
- **`ticket_categories`**: `id`, `event_id`, `name`, `price`, `seat_limit` (Tiered pricing: Early Bird, Standard, VIP).
- **`bookings`**: `id`, `event_id`, `category_id`, `name`, `email`, `mobile`, `quantity`, `total_amount`, `booking_date`, `status`, `idempotency_key`.
- **`admins`**: `id`, `email`, `password_hash`, `created_at`.

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 18
- Docker Desktop (optional, for MySQL container)

### 1. Installation
Clone the repository and install all monorepo dependencies:
```bash
npm install
npm install --workspace=server
npm install --workspace=client
```

### 2. Database Setup (Optional Docker)
To spin up MySQL 8 via Docker Compose:
```bash
docker compose up -d
```
*(Note: If MySQL is not running locally, Summitra automatically activates an in-memory dual-mode database with identical queries, row locking, and seed data!)*

### 3. Run Development Servers
Start both the backend API (port 5000) and the Vite frontend (port 5173) with a single command:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Admin Credentials

Pre-seeded administrator account:
- **URL:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Email:** `admin@summitra.com`
- **Password:** `adminpassword`

---

## 🧪 Concurrency Anti-Oversell Test

Run the automated concurrency verification script:
```bash
npm run test:concurrency
```
This test fires 10 simultaneous booking attempts for an event with only 5 available seats, proving that the atomic row locks prevent race conditions and seats never drop below zero.

---

## 📐 Design Tokens

Design tokens from `DESIGN.md` are defined in `client/src/styles/tokens.css` and mirrored in `client/tailwind.config.js`:

```css
:root {
  --font-family-primary: 'Manrope', sans-serif;
  --color-surface-base: #000000;
  --color-surface-raised: #8617d0;
  --color-surface-strong: #933be1;
  --color-text-primary: #ffffff;
  --color-text-tertiary: #aeaeae;
  --color-link-ondark: #c084fc;
  --color-feedback-success: #10b981;
  --color-feedback-error: #ef4444;
  --color-focus-ring: #c084fc;
}
```

---

## 📄 License
MIT © Summitra Event Systems
