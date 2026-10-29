# PRD — Smart Event Booking System (Summitra)

## 1. Context and Goals
Summitra is a full-stack event booking application. Users browse upcoming events, book tickets, and receive a QR ticket. Admins create and manage events and track bookings.

**Stack note:** the brief says "MERN + MySQL". MongoDB is not used. The stack is **React + Node/Express + MySQL + Socket.IO** (MySQL replaces the "M").

### Goals
- G1: Users can discover events fast (search, filter by location/date).
- G2: Booking completes in under 60 seconds with no overselling.
- G3: Seat availability updates in real time for all viewers.
- G4: Admins manage the full event lifecycle (CRUD) and see bookings.
- G5: Landing page and UI follow the Summitra design system (see `DESIGN.md`).

### Non-goals (v1)
- Payment gateway integration (booking is simulated/confirmed directly).
- Per-seat map selection (quantity-based booking only).
- Multi-tenant organizers, refunds workflow, email marketing.

## 2. Personas
| Persona | Description | Needs |
|---|---|---|
| Attendee | Public visitor, no account required to book | Find events, book quickly, get a ticket |
| Admin | Authenticated organizer | Create/update/delete events, view bookings |

## 3. User Stories
### Attendee
- As an attendee, I can browse upcoming events in a list.
- As an attendee, I can search by keyword and filter by location and date.
- As an attendee, I can open an event to see description, map location, price, and live seats left.
- As an attendee, I can pick ticket quantity/category and see the total price update.
- As an attendee, I can enter name, email, mobile and confirm a booking.
- As an attendee, I see a success animation (confetti) and can download a QR ticket.
- As an attendee, I see a clear failure animation and message if booking fails (sold out, seats taken, network).

### Admin
- As an admin, I can log in securely.
- As an admin, I can create, update, and delete events (with image).
- As an admin, I can see bookings per event and remaining seats.

## 4. Functional Requirements
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | List upcoming events with pagination | Must |
| FR-2 | Search by title/description; filter by location and date range | Must |
| FR-3 | Event details page with Google Maps embed | Must |
| FR-4 | Ticket categories with dynamic pricing (e.g. Early Bird, Standard, VIP) | Should |
| FR-5 | Create booking; decrement `available_seats` atomically | Must |
| FR-6 | Reject booking when `quantity > available_seats` | Must |
| FR-7 | Real-time seat count broadcast via Socket.IO | Must |
| FR-8 | Animated success/failure states | Must |
| FR-9 | Downloadable QR ticket (PNG/PDF) | Must |
| FR-10 | Admin auth + event CRUD | Must |
| FR-11 | Admin bookings table per event | Should |
| FR-12 | Real-time seat locking (hold seats during checkout, TTL) | Bonus |
| FR-13 | PWA (installable, offline shell) | Bonus |
| FR-14 | Deployment: backend Render/Heroku, frontend Vercel/Netlify | Bonus |

## 5. Non-Functional Requirements
- **Performance:** event list API p95 < 300 ms; LCP < 2.5 s on 4G.
- **Consistency:** zero overselling under concurrent booking.
- **Accessibility:** WCAG 2.2 AA, keyboard-first.
- **Security:** input validation, parameterized SQL, admin-only routes protected, rate limiting on booking.
- **Responsive:** 360px to 1440px+.
- **Reduced motion:** all animations must respect `prefers-reduced-motion`.

## 6. Acceptance Criteria (key flows)
1. Given 5 seats left, when two users each book 3 simultaneously, exactly one succeeds and one receives a "not enough seats" error.
2. Given a booking succeeds, `available_seats` decreases by `quantity` and all open event pages update within 1 s.
3. Given a successful booking, the success screen shows confetti and a QR that encodes the booking ID.
4. Given a non-admin request to `POST /events`, the API returns 401/403.
5. Given filters location=X and date range, only matching events are returned.

## 7. Success Metrics
- Booking completion rate, failed-booking rate, oversell incidents (target 0), time-to-book, Lighthouse a11y score ≥ 95.

## 8. Risks
| Risk | Mitigation |
|---|---|
| Race conditions on seat count | DB transaction with row lock |
| Abandoned checkout holding seats | Lock TTL (e.g. 5 min) |
| Low-contrast brand colors | Token usage rules in `DESIGN.md` |

## 9. Deliverables
- GitHub repo with `client/` (React) and `server/` (Node)
- `README.md` with setup & DB instructions
- `event_booking.sql` schema script
- Screenshots / demo video (optional)
