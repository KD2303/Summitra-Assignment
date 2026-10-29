# ARCHITECTURE — Smart Event Booking System (Summitra)

## 1. System Overview
```
┌────────────────────┐        HTTPS (REST)        ┌──────────────────────────┐
│  React Client      │ ─────────────────────────▶ │  Express API             │
│  (Vercel/Netlify)  │                            │  routes → controllers →  │
│  Tailwind + Motion │ ◀───────────────────────── │  services → db           │
│  PWA shell         │                            │                          │
│                    │      WebSocket (Socket.IO) │  Socket.IO server        │
│                    │ ◀════════════════════════▶ │  rooms: event:{id}       │
└────────────────────┘                            └───────────┬──────────────┘
                                                              │ mysql2 pool
                                                  ┌───────────▼──────────────┐
                                                  │ MySQL                    │
                                                  │ events, bookings,        │
                                                  │ admins, ticket_categories│
                                                  └──────────────────────────┘
                 Optional: Redis (seat locks, multi-instance Socket.IO adapter)
```

## 2. Components
### Client
| Module | Responsibility |
|---|---|
| `pages/` | Landing, Events, EventDetails, Checkout, Success, Admin |
| `components/` | EventCard, SeatIndicator, TicketSelector, Navbar, Confetti, QRTicket |
| `hooks/useSeats` | Subscribes to `seats:update` for an event room |
| `lib/api` | Typed fetch wrapper + TanStack Query hooks |
| `lib/socket` | Singleton Socket.IO client |
| `styles/tokens` | Design tokens as CSS variables / Tailwind theme |

### Server
| Layer | Responsibility |
|---|---|
| `routes/` | HTTP routing, auth middleware attachment |
| `controllers/` | Request parsing, response shaping |
| `services/` | Business logic (booking, pricing, locking) |
| `db/` | Pool, queries, transaction helper |
| `sockets/` | Room management, broadcast, lock events |
| `middleware/` | auth, validate (Zod), rateLimit, errorHandler |

## 3. Key Flows
### 3.1 Browse
1. Client calls `GET /events?q&location&from&to&page`.
2. Server builds a parameterized query using indexes on `date`, `location`, and the FULLTEXT index.
3. Cards render with the current seat count; each card joins its room (or one list-level room) for live updates.

### 3.2 Book (happy path)
```
Client            API                    MySQL            Sockets
  │ POST /bookings │                       │                 │
  │───────────────▶│ BEGIN                 │                 │
  │                │ SELECT … FOR UPDATE ─▶│                 │
  │                │ UPDATE seats ────────▶│                 │
  │                │ INSERT booking ──────▶│                 │
  │                │ COMMIT                │                 │
  │                │ emit seats:update ────────────────────▶ │ → all clients in room
  │◀───201 + id────│                       │                 │
  │ confetti + QR  │                       │                 │
```

### 3.3 Book (failure)
Insufficient seats → transaction rolls back → `409` → client shows failure animation and refreshes seat count.

### 3.4 Seat locking (bonus)
1. User opens checkout → `seats:lock`.
2. Server checks `available − activeLocks ≥ qty`, stores lock with TTL, returns `lockId` and `expiresAt`.
3. Client shows countdown. On submit, booking consumes the lock inside the transaction.
4. Timeout, disconnect, or `seats:unlock` releases the lock and rebroadcasts availability.

### 3.5 Admin CRUD
Login → JWT cookie → protected routes. Create/update/delete emit `events:changed` so lists refresh. Reducing `total_seats` below booked count must be rejected.

## 4. Data Consistency
- **Source of truth:** MySQL. Sockets are notifications only; clients treat them as hints and refetch on reconnect.
- **Atomicity:** all booking writes in one transaction with a row lock.
- **Idempotency:** client sends an `Idempotency-Key` header; server stores it with the booking to prevent double-submits.

## 5. Scaling Notes
- Single Node instance is sufficient for the assignment.
- For horizontal scale: Socket.IO Redis adapter, Redis-backed locks, sticky sessions or WebSocket-capable LB.
- Cache `GET /events` briefly (e.g. 10 s) but never cache seat counts used in booking validation.

## 6. Error Handling
- Central error handler maps domain errors to HTTP codes: `VALIDATION_ERROR` 400, `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `INSUFFICIENT_SEATS` 409, `RATE_LIMITED` 429.
- Client maps codes to user-facing messages and failure animation variants.

## 7. Observability
- Structured logs (pino) with request ID.
- `/api/health` for uptime checks.
- Log booking outcomes (success/fail reason) as metrics.

## 8. Architecture Decisions
| ADR | Decision | Reason |
|---|---|---|
| 1 | MySQL, not MongoDB | Specified; relational integrity for bookings |
| 2 | Row lock transaction | Simple, correct anti-oversell |
| 3 | Socket.IO rooms per event | Targeted broadcasts, low traffic |
| 4 | QR generated client-side | No storage; booking ID is source of truth |
| 5 | Server-side pricing | Prevent client tampering |
