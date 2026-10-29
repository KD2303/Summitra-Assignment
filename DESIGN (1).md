# Summitra — Design System

## 1. Context and Goals
**Design intent:** a dark, high-contrast, purple-accented interface that makes browsing and booking events fast, consistent, and accessible.

- Product/brand: Summitra — Smart Event Booking System
- Landing reference: https://summitra-flowz.webflow.io/
- Audience: attendees, teams, decision-makers
- Surfaces: marketing landing page, event listing, event details, booking flow, admin dashboard
- Visual style: clean, functional, implementation-oriented
- Target: WCAG 2.2 AA

## 2. Design Tokens and Foundations
Components must use semantic tokens, never raw hex values.

### 2.1 Typography
| Token | Value |
|---|---|
| `font.family.primary` | Manrope |
| `font.family.stack` | Manrope, sans-serif |
| `font.size.base` | 18px |
| `font.weight.base` | 600 |
| `font.lineHeight.base` | 20px |
| `font.size.xs` | 16px |
| `font.size.sm` | 18px |
| `font.size.md` | 22px |
| `font.size.lg` | 32px |
| `font.size.xl` | 48px |
| `font.size.2xl` | 82px |
| `font.size.3xl` | 96px |

Rules:
- Body copy that wraps to multiple lines should use a line-height of at least 1.5 (override of the 20px base is allowed only for single-line UI labels). Multi-line text must meet WCAG 1.4.12 text-spacing.
- `2xl` and `3xl` must be used for hero headings only, and should scale down fluidly (`clamp`) on mobile: `3xl` → `xl` below 640px.
- Weight must be taken from the token scale; no one-off weights.

### 2.2 Color
| Token | Value | Use |
|---|---|---|
| `color.text.primary` | #ffffff | Default text on dark surfaces |
| `color.text.secondary` | #0000ee | Link color, **light surfaces only** (see warning) |
| `color.text.tertiary` | #aeaeae | Supporting text, metadata |
| `color.text.inverse` | #040404 | Text on light/accent-light fills |
| `color.surface.base` | #000000 | Page background |
| `color.surface.raised` | #8617d0 | Cards, panels, primary buttons |
| `color.surface.strong` | #933be1 | Hover/active emphasis, highlights |

**Contrast (computed, must be verified in implementation):**
| Pair | Approx. ratio | Verdict |
|---|---|---|
| `text.primary` on `surface.base` | 21:1 | Pass |
| `text.tertiary` on `surface.base` | ~9.5:1 | Pass |
| `text.primary` on `surface.raised` | ~6.9:1 | Pass |
| `text.primary` on `surface.strong` | ~5.3:1 | Pass |
| `text.secondary` (#0000ee) on `surface.base` | ~2.2:1 | **Fail** |

**Therefore:** `color.text.secondary` must not be used on `surface.base` or `surface.raised`. On dark surfaces, links must use `color.text.primary` with an underline. The design should define a `color.link.onDark` token (a light tint of the purple, ≥ 4.5:1 on black) before shipping dark-surface inline links. This is a documented extension to the reference tokens.

Semantic extensions (should be added; values must pass 4.5:1 on the surface they sit on):
`color.feedback.success`, `color.feedback.error`, `color.feedback.warning`, `color.focus.ring`.

### 2.3 Spacing
`space.1=5px`, `space.2=6px`, `space.3=10px`, `space.4=14px`, `space.5=16px`, `space.6=20px`, `space.7=24px`, `space.8=28px`.
Layouts must use only these tokens. Larger section rhythm should be composed from multiples (e.g. 2 × `space.8`), not new values.

### 2.4 Radius
`radius.xs=16px`, `radius.sm=24px`, `radius.md=80px`, `radius.lg=90px`, `radius.xl=100px`.
- Cards: `radius.sm`. Image tiles: `radius.xs`.
- Buttons and pills: `radius.xl` (fully rounded).
- Inputs: `radius.xs`.

### 2.5 Motion (extension — reference defines none)
| Token | Value |
|---|---|
| `motion.duration.fast` | 150ms |
| `motion.duration.base` | 250ms |
| `motion.duration.slow` | 500ms |
| `motion.easing.standard` | cubic-bezier(0.2, 0, 0, 1) |

Motion must be disabled or reduced to opacity-only under `prefers-reduced-motion: reduce`. Parallax and confetti must not run in that mode. Nothing may flash more than 3 times per second.

### 2.6 Shadow
Reference defines no shadow tokens. Elevation should be expressed via `surface.raised` vs `surface.base`, not shadows.

## 3. Component Rules
Page density to support: **cards (23), links (19), buttons (6), navigation (1)**.

All components must define these states: default, hover, focus-visible, active, disabled, loading, error. A component without explicit state rules must not ship.

### 3.1 Button
**Anatomy:** container, label, optional leading/trailing icon, loading spinner.

| Variant | Background | Text |
|---|---|---|
| Primary | `surface.raised` | `text.primary` |
| Secondary | transparent, 2px border `text.primary` | `text.primary` |
| Destructive (admin) | `color.feedback.error` | `text.inverse` or `text.primary` per contrast |

| State | Rule |
|---|---|
| Default | `font.size.sm`, weight base, padding `space.4` × `space.7`, `radius.xl` |
| Hover | Background → `surface.strong` |
| Focus-visible | 3px outline `color.focus.ring`, 2px offset; must never be removed |
| Active | Slight scale (0.98), keep `surface.strong` |
| Disabled | `aria-disabled="true"`, tertiary text, no hover; still focusable only if it explains why |
| Loading | Spinner replaces icon, label retained, `aria-busy="true"`, clicks ignored |
| Error | Inline message beneath/adjacent, linked via `aria-describedby` |

**Behavior:** Keyboard — Enter/Space activate. Pointer — activates on click release. Touch — min target 44×44px (≥ 24px is the WCAG 2.2 floor), no hover dependence.
**Labels** must be specific: "Book 2 tickets", not "Submit".
**Edge cases:** long labels wrap to two lines max and then truncate with tooltip; icon-only buttons must have `aria-label`.

### 3.2 Link
- Inline links must be distinguishable by more than color (underline).
- On dark surfaces use `text.primary` + underline (see 2.2 warning).
- States: hover increases underline thickness; focus-visible uses focus ring; visited should not rely on color alone.
- External links (e.g. Google Maps) must indicate "opens in new tab" via icon and `aria-label`/visually-hidden text.
- Link text must be descriptive; "click here" is prohibited.

### 3.3 Navigation (1)
**Anatomy:** logo, primary links (Events, About, Admin), primary CTA ("Browse events"), mobile menu toggle.
- Desktop: horizontal bar, sticky, `surface.base`.
- Mobile (<768px): toggle opens a full-height panel; focus must be trapped inside while open, Esc closes and returns focus to the toggle.
- Current page link must carry `aria-current="page"`.
- Must include a "Skip to content" link as the first focusable element.
- States: hover (underline), focus-visible (ring), active (`surface.strong` pill), disabled n/a, loading n/a (static), error n/a.
- Keyboard: Tab order matches visual order; menu toggle is a `button` with `aria-expanded`.

### 3.4 Event Card (primary card, 23 on page)
**Anatomy:** image (`img`), title, date, location, price, seat indicator, action link/button.
- Container: `surface.raised`, `radius.sm`, padding `space.6`, gap `space.4`.
- Title: `font.size.md`, max 2 lines then ellipsis (full title available via accessible name).
- Image: `radius.xs`, fixed aspect ratio (16:9), `alt` meaningful or empty if purely decorative, lazy loaded.
- **Seat indicator:** text + icon, never color alone. Thresholds: >20% "N seats left", ≤20% "Only N left", 0 "Sold out". Updates must be announced via `aria-live="polite"` sparingly (debounced) and must not steal focus.
- Entire card should be clickable via a single stretched link on the title; there must be only one tab stop per card.

| State | Rule |
|---|---|
| Default | As above |
| Hover | Background → `surface.strong`, subtle lift (`translateY(-4px)`, `motion.duration.base`) |
| Focus-visible | Ring around the whole card |
| Active | Lift removed |
| Disabled (sold out) | Reduced emphasis, "Sold out" badge, still navigable to details |
| Loading | Skeleton with same dimensions (no layout shift) |
| Error | "Couldn't load this event" with Retry button |

**Responsive:** grid 1 col (<640), 2 cols (640–1023), 3 cols (≥1024). Gap `space.7`.
**Empty state:** "No events match your filters." + "Clear filters" button.
**Long content:** location wraps to 2 lines then truncates; price must never wrap.

### 3.5 Search and Filter Controls
- Inputs: `radius.xs`, `font.size.sm`, visible persistent label (placeholder is not a label).
- Location filter: combobox pattern; Date: native date input or accessible date-range picker.
- Error: message tied by `aria-describedby`, `aria-invalid="true"`.
- Filter changes should update results without full-page reload and should announce result count via `aria-live`.

### 3.6 Ticket Selector and Checkout Form
- Category radios (Early Bird / Standard / VIP) use a radio group with visible selected state beyond color (check icon).
- Quantity stepper: buttons with `aria-label`, min 1, max = available seats; value announced.
- Total price updates must be announced politely.
- Form fields: name, email, mobile; autocomplete attributes (`name`, `email`, `tel`) must be set.
- Validation must run on blur and submit; errors listed in a summary at top with links to fields.
- Form step animation: opacity + translate only; must respect reduced motion.
- Seat lock countdown (bonus) must expose remaining time textually and warn at 60 seconds.

### 3.7 Booking Result (Success / Failure)
- Success: confetti (decorative, `aria-hidden`), heading "Booking confirmed", booking ID, QR ticket, "Download ticket" button. Focus moves to the heading.
- Failure: shake/fade animation (non-essential), heading "Booking failed", plain-language reason, "Try again" button. Focus moves to the heading; error announced with `role="alert"`.
- QR ticket must include text alternative (booking ID, event, date) so it is usable without the image.

### 3.8 Admin Dashboard
- Data table with real `table` semantics, sortable column headers as buttons, row actions with specific labels ("Edit Summit 2026").
- Create/edit uses a modal or page; modal must trap focus, Esc closes, returns focus to trigger.
- Delete requires confirmation naming the event; destructive button uses the Destructive variant.
- Empty state: "No events yet." + "Create event".

### 3.9 Landing Page (Summitra reference)
- Hero: `font.size.3xl` headline (clamp on mobile), one primary CTA, one secondary link.
- Parallax: decorative layers only; content must remain readable and static under reduced motion.
- Sections: value props (cards), featured events, how it works, final CTA.
- Each section should have a single `h2`; heading levels must not skip.

## 4. Accessibility Requirements and Testable Acceptance Criteria
| ID | Requirement | Pass/Fail test |
|---|---|---|
| A1 | Body text contrast ≥ 4.5:1; large text and UI components ≥ 3:1 | Automated (axe) + manual spot check for every token pair; fails if any pair < threshold |
| A2 | `color.text.secondary` not used on dark surfaces | Lint/grep of component styles; fail on any usage |
| A3 | All interactive elements reachable and operable by keyboard | Tab through every page; no traps except intentional modals |
| A4 | Focus indicator visible with ≥ 3:1 contrast and not obscured by sticky nav | Manual; fail if focus hidden |
| A5 | Target size ≥ 24×24 CSS px (goal 44×44 on touch) | Measure in devtools |
| A6 | Page has skip link, landmarks, one `h1` | axe + manual |
| A7 | Form fields have labels, errors programmatically associated | axe + screen reader check |
| A8 | Status changes (seat count, errors, results) announced without focus theft | Screen reader test (NVDA/VoiceOver) |
| A9 | Reduced motion respected | Toggle OS setting; parallax/confetti/lifts disabled |
| A10 | Content reflows at 320px with no horizontal scroll; text resizes to 200% | Manual |
| A11 | Information not conveyed by color alone (seat status, errors, selection) | Manual grayscale check |
| A12 | Drag-free alternatives (WCAG 2.2) and consistent help/redirect behavior | Manual review |

## 5. Content and Tone Standards
Tone: concise, confident, implementation-focused.

| Do | Don't |
|---|---|
| "Book 2 tickets" | "Submit" |
| "Only 4 seats left" | "Hurry!!!" |
| "Booking failed: only 1 seat left. Choose 1 ticket or pick another event." | "Error 409" |
| "Download ticket (PNG)" | "Click here" |
| "No events match your filters. Clear filters" | "Nothing found" |

Microcopy must state what happened and what the user can do next. Dates should use a locale format with timezone when relevant.

## 6. Anti-Patterns and Prohibited Implementations
- Using raw hex values in components instead of semantic tokens.
- `color.text.secondary` (#0000ee) on black or purple surfaces.
- Removing outlines or hiding focus (`outline: none` without replacement).
- One-off spacing, radius, or font-size values.
- Ambiguous labels ("Submit", "Click here", "More").
- Conveying seat status or errors by color alone.
- Autoplaying motion that ignores `prefers-reduced-motion`.
- Layout shift on loading (skeletons must match final size).
- Placeholder-as-label inputs.
- Multiple tab stops per card for the same destination.
- Shipping a component without all seven states documented.

## 7. Migration Notes
- Convert any Webflow-derived values to tokens before implementation; map nearest spacing token and record the delta.
- The reference lists no shadow, motion, or feedback tokens; the extensions above must be reviewed and approved before use.
- Implement tokens as CSS variables in `styles/tokens.css` and mirror them in `tailwind.config` (`theme.extend`).

## 8. QA Checklist
- [ ] Every color/space/radius/type value comes from a token
- [ ] All seven states implemented per component (default, hover, focus-visible, active, disabled, loading, error)
- [ ] Contrast verified for every text/surface pair; #0000ee not on dark
- [ ] Keyboard-only run: browse → filter → book → download ticket → admin CRUD
- [ ] Screen reader pass on event card, checkout form, result screens
- [ ] Touch run on a 360px device; targets ≥ 44px
- [ ] 320px reflow and 200% zoom checked
- [ ] Reduced-motion mode verified
- [ ] Empty, long-content, overflow, and error states checked for cards, tables, forms
- [ ] Component density handled: cards (23), links (19), buttons (6), navigation (1)
- [ ] axe and Lighthouse a11y ≥ 95, zero critical violations
- [ ] Content reviewed against the tone standards in section 5
