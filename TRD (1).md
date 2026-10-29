# TRD — Smart Event Booking System (Summitra)

## 1. Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Framer Motion, parallax (Framer Motion `useScroll`/`useTransform`), React Router |
| State/data | TanStack Query for server state, small Zustand store for checkout state |
| Realtime | Socket.IO (client + server) |
| Backend | Node.js, Express |
| DB | MySQL 8 via `mysql2` (promise pool) |
| Validation | Zod |
| Auth (admin) | JWT (httpOnly cookie) + bcrypt |
| QR | `qrcode` (client-side generation) |
| Confetti | `canvas-confetti` |
| Maps | Google Maps Embed API (iframe) |
| Deploy | Render/Heroku (API), Vercel/Netlify (client) |

## 2. Repository Layout
```
/client
  src/{pages,components,hooks,lib,styles,assets}
/server
  src/{routes,controllers,services,middleware,db,sockets,utils}
/event_booking.sql
/README.md
```

## 3. Database Schema (MySQL)
```sql
CREATE DATABASE IF NOT EXISTS event_booking;
USE event_booking;

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats >= 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  img VARCHAR(500),
  INDEX idx_date (date),
  INDEX idx_location (location),
  FULLTEXT idx_search (title, description)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_amount DECIMAL(10,2) NOT NULL,
  booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event (event_id)
);

-- Extensions (supporting the brief)
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

-- Optional: ticket categories / dynamic pricing
CREATE TABLE ticket_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(60) NOT NULL,           -- Early Bird, Standard, VIP
  price DECIMAL(10,2) NOT NULL,
  seat_limit INT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```
If `ticket_categories` is used, add nullable `category_id` to `bookings`. Dynamic pricing in v1 may be computed (e.g. price rises as `available_seats / total_seats` falls) and must be calculated **server-side**.

## 4. API Specification
Base: `/api`. JSON. Errors: `{ "error": { "code", "message" } }`.

### Events
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/events` | Admin | Create event |
| GET | `/events` | Public | List; query: `q`, `location`, `from`, `to`, `page`, `limit` |
| GET | `/events/:id` | Public | Details |
| PUT | `/events/:id` | Admin | Update |
| DELETE | `/events/:id` | Admin | Delete |

### Bookings
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | Public | Book tickets |
| GET | `/bookings/:id` | Public (id + email) | Fetch ticket data |
| GET | `/events/:id/bookings` | Admin | Bookings for an event |

### Auth
| POST | `/auth/login` | — | Admin login, sets cookie |
| POST | `/auth/logout` | Admin | Clears cookie |

### Booking request/response
```json
POST /api/bookings
{ "eventId": 12, "name": "Asha", "email": "a@x.com", "mobile": "9876543210", "quantity": 2, "lockId": "optional" }

201 { "id": 301, "status": "confirmed", "totalAmount": 1998.00, "availableSeats": 41 }
409 { "error": { "code": "INSUFFICIENT_SEATS", "message": "Only 1 seat left." } }
```

## 5. Booking Transaction (no overselling)
```sql
START TRANSACTION;
SELECT available_seats, price FROM events WHERE id = ? FOR UPDATE;
-- if available_seats < quantity => ROLLBACK, 409
UPDATE events SET available_seats = available_seats - ? WHERE id = ?;
INSERT INTO bookings (...) VALUES (...);
COMMIT;
```
Total amount must be computed on the server from the DB price, never trusted from the client. After commit, emit `seats:update`.

## 6. Real-Time (Socket.IO)
| Event | Direction | Payload |
|---|---|---|
| `event:join` | C→S | `{ eventId }` (joins room `event:{id}`) |
| `seats:update` | S→C | `{ eventId, availableSeats }` |
| `seats:lock` | C→S | `{ eventId, quantity }` |
| `seats:locked` | S→C | `{ lockId, expiresAt }` or `{ error }` |
| `seats:unlock` | C→S | `{ lockId }` |

**Seat locking (bonus):** locks are held server-side (in-memory Map for single instance; Redis with TTL for multi-instance). Effective availability = `available_seats − sum(active locks)`. Locks expire after 5 minutes and release on disconnect. Booking with a valid `lockId` consumes the lock.

## 7. Frontend Technical Notes
- Routes: `/`, `/events`, `/events/:id`, `/checkout/:id`, `/booking/:id/success`, `/admin`, `/admin/login`.
- Socket connection is created once per session; components subscribe to rooms on mount and unsubscribe on unmount.
- Animations: Framer Motion variants for cards (stagger), form transitions, success/failure states. Must honor `prefers-reduced-motion`.
- Forms: React Hook Form + Zod; inline errors announced via `aria-live`.
- QR payload: `{ bookingId, eventId, email }` signed or looked up server-side on scan.
- PWA: `vite-plugin-pwa`, manifest + service worker (cache shell and event list, network-first for API).

## 8. Security
- Parameterized queries only.
- Helmet, CORS allowlist, rate limiting (stricter on `POST /bookings`, `/auth/login`).
- bcrypt for admin passwords; JWT httpOnly + SameSite cookie.
- Validate and sanitize all input; limit image URL/upload size.
- Never log PII beyond booking IDs.

## 9. Environment Variables
```
# server
PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, CLIENT_ORIGIN
# client
VITE_API_URL, VITE_SOCKET_URL, VITE_GOOGLE_MAPS_KEY
```

## 10. Testing
| Level | Tooling | Focus |
|---|---|---|
| Unit | Vitest/Jest | pricing, validators |
| API | Supertest | CRUD, auth, filters |
| Concurrency | script firing parallel bookings | no oversell |
| E2E | Playwright | browse → book → QR |
| A11y | axe + manual keyboard | WCAG 2.2 AA |

## 11. Deployment
- DB: managed MySQL (PlanetScale alternative, Railway, or Aiven). Run `event_booking.sql`.
- API: Render/Heroku with WebSocket support enabled.
- Client: Vercel/Netlify, `VITE_*` env set.
- Health check: `GET /api/health`.
