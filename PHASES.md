# PHASES — Smart Event Booking System (Summitra)

Each phase ends with a demo-able increment. Durations assume one developer; adjust as needed.

## Phase 0 — Setup (0.5 day)
- [ ] Monorepo: `client/` (Vite + React + Tailwind + Framer Motion), `server/` (Express)
- [ ] ESLint/Prettier, `.env.example`, README skeleton
- [ ] MySQL running locally; `event_booking.sql` with `events`, `bookings`, `admins`
- [ ] Design tokens in `styles/tokens.css` + Tailwind theme (from `DESIGN.md`)
- **Exit:** both apps start; DB connects; `/api/health` returns OK.

## Phase 1 — Backend Core (1.5 days)
- [ ] DB pool + transaction helper
- [ ] Event APIs: `POST/GET/GET:id/PUT/DELETE /events` with Zod validation
- [ ] Search + filter (`q`, `location`, `from`, `to`) + pagination
- [ ] Admin auth (bcrypt + JWT cookie) and protected routes
- [ ] Seed script with sample events
- **Exit:** all event endpoints pass Supertest; admin-only routes return 401/403 for others.

## Phase 2 — Booking Engine (1 day)
- [ ] `POST /bookings` with row-lock transaction, server-side total
- [ ] Error codes (`INSUFFICIENT_SEATS`, `VALIDATION_ERROR`), idempotency key
- [ ] `GET /bookings/:id`, `GET /events/:id/bookings` (admin)
- [ ] Concurrency test: parallel bookings never oversell
- **Exit:** concurrency script passes; seats stay ≥ 0.

## Phase 3 — Frontend Foundation + Landing (2 days)
- [ ] Layout, navigation (skip link, mobile menu, focus trap), footer
- [ ] Base components with all seven states: Button, Link, Card, Input
- [ ] Landing page modeled on the Summitra reference: hero, value cards, featured events, CTA, parallax
- [ ] Reduced-motion handling
- **Exit:** landing page responsive 320–1440px; keyboard-navigable; axe clean.

## Phase 4 — Listing and Details (2 days)
- [ ] Events page: search, location/date filters, animated cards, skeletons, empty/error states
- [ ] Event details: description, Google Maps embed, price, seats left
- [ ] Ticket selector with categories and dynamic pricing (server-calculated)
- **Exit:** a user can browse, filter, and reach checkout with correct pricing.

## Phase 5 — Booking Flow (1.5 days)
- [ ] Animated checkout form with validation and error summary
- [ ] Success screen: confetti + QR ticket + download (PNG/PDF)
- [ ] Failure screen/animation with actionable messages
- [ ] Focus management and `aria-live` announcements
- **Exit:** end-to-end booking works; ticket downloads; failure paths tested.

## Phase 6 — Real-Time Seats (1 day)
- [ ] Socket.IO server with `event:{id}` rooms; emit `seats:update` after commit
- [ ] `useSeats` hook; live indicator on cards and details page
- [ ] Reconnect handling (refetch on reconnect)
- **Exit:** two browsers show seat changes within 1 s of a booking.

## Phase 7 — Admin Dashboard (1.5 days)
- [ ] Login page, protected admin routes
- [ ] Event table + create/edit modal/page, delete with confirmation
- [ ] Per-event bookings view
- **Exit:** full CRUD from UI; validation and error states handled.

## Phase 8 — Polish and QA (1.5 days)
- [ ] Full QA checklist from `DESIGN.md`
- [ ] Accessibility audit (axe, keyboard, screen reader)
- [ ] Performance pass (image sizes, lazy load, code splitting)
- [ ] E2E (Playwright): browse → book → QR; admin CRUD
- **Exit:** Lighthouse a11y ≥ 95; no critical bugs.

## Phase 9 — Bonus (2–3 days, optional)
- [ ] **Seat locking:** `seats:lock/unlock`, TTL, countdown UI, release on disconnect
- [ ] **PWA:** manifest, service worker, installable, offline shell
- [ ] **Deploy:** API on Render/Heroku (WebSockets on), client on Vercel/Netlify, managed MySQL
- **Exit:** live URLs; lock prevents concurrent holders from exceeding availability.

## Phase 10 — Delivery (0.5 day)
- [ ] README: setup, env vars, DB import, run, deploy
- [ ] `event_booking.sql` final
- [ ] Screenshots / demo video
- [ ] Tag release

## Timeline Summary
| Phase | Focus | Est. days |
|---|---|---|
| 0 | Setup | 0.5 |
| 1 | Backend core | 1.5 |
| 2 | Booking engine | 1 |
| 3 | Frontend + landing | 2 |
| 4 | Listing + details | 2 |
| 5 | Booking flow | 1.5 |
| 6 | Real-time | 1 |
| 7 | Admin | 1.5 |
| 8 | Polish + QA | 1.5 |
| 9 | Bonus | 2–3 |
| 10 | Delivery | 0.5 |
| **Total** | | **~15–16 (core ~12.5)** |

## Dependency Order
`0 → 1 → 2 → (3 ∥ 6 backend part) → 4 → 5 → 6 UI → 7 → 8 → 9 → 10`

## Risks per Phase
| Phase | Risk | Mitigation |
|---|---|---|
| 2 | Oversell under load | Row lock + concurrency test before UI work |
| 3 | Contrast failures with brand colors | Token rules in `DESIGN.md` |
| 6 | WebSocket hosting limits | Verify host supports WS early |
| 9 | Lock leaks | TTL + disconnect cleanup + tests |
