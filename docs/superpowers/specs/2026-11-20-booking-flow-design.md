# Booking Flow — Design

Date: 2026-11-20
Status: awaiting approval

## Intent and why

The resort site currently only *shows* rooms — there is no way for a visitor to
express intent to stay. A booking flow gives the app its purpose: search
availability by dates and guests, pick a room, leave details, get a
confirmation. There is no backend, so the flow ends in a locally stored
booking with a generated reference — the shape of the real thing, with a
single, clearly marked seam where a real API would plug in later.

## Goals

- Search-first flow: the home hero offers a "check availability" strip
  (check-in, check-out, guests) that leads to available rooms.
- Room detail page (`SingleRoom`) gets a compact "book this room" panel with
  the same date/guests inputs, pre-scoped to that room. Both entry points feed
  one flow.
- Availability check per room for the chosen dates.
- Guest details form with validation (name, email, phone optional).
- Confirmation page with a generated booking reference; booking persisted to
  localStorage so it survives refresh.
- Total price for the stay (nights × room price) shown before confirming.

## Non-goals

- No payment step, no fake credit-card screens.
- No backend, no network calls.
- No calendar-picker library — native `<input type="date">`.
- No "manage my bookings" UI (a list page can come later; the store already
  keeps the data for it).
- No changes to the room filter on `/rooms` (type/price/size filtering stays
  as is).

## Anti-goals

- Do not restructure `RoomContext` or `data.js` in this change. The Contentful
  shape in `data.js` is a known cleanup, but it is a separate task; this flow
  works against the flattened room objects `formatData` already produces.
- Do not introduce new dependencies.

## Approaches considered

1. **Search-first, both entry points, one flow (chosen).** Home hero search
   strip and SingleRoom panel both route into `/book`. One flow to build and
   test; the room-first entry is nearly free once availability logic exists.
   Cost: slightly more work than panel-only up front.
2. **Room-first only.** A booking panel on each room's detail page. Simplest,
   but the site never learns about the trip until the last step, and there is
   no "what's available for my dates" moment — weaker as a resort experience.
3. **Full multi-page checkout with route-per-step and a booking context.**
   Sub-routes for every step plus global booking state in context. More
   machinery than a no-backend mock needs; context changes touch the whole
   app.

## How it was decided (the calls made)

- **State: local + a small store module, not React context.** Booking flow
  state lives in the booking pages' local state; persistence goes through a
  new plain module `src/bookingStore.js` (get/save bookings in localStorage,
  availability check, reference generation). RoomContext is untouched. If a
  later feature needs bookings app-wide (navbar badge, bookings list), a
  context can wrap this module then.
- **Availability is mocked deterministically.** Each room has pre-booked
  windows derived deterministically from its slug (hash → 2–3 blocked ranges
  in the next ~90 days), so results are stable across refreshes and users, in
  addition to any bookings already in localStorage. A room is available for
  chosen dates if: no overlap with blocked windows or existing bookings, and
  `room.capacity >= guests`. The mock lives in one function in
  `bookingStore.js`, documented as the swap point for a real API.
- **Prefill between pages uses query params** (`/book/:slug?checkIn=…&checkOut=…&guests=…`),
  not router state — survives refresh, shareable URLs.
- **Validation is minimal and native-first**: required fields, `type="email"`,
  `min` on dates; check-out must be after check-in, check-in not in the past —
  enforced in JS with inline messages in the interface's plain voice
  ("Check-out must be after check-in", not "Error 400").
- **Visuals reuse the existing design system** — `App.scss` tokens
  (`--primaryColor`, `--borderRadius`, …), `.form-control`, `.btn-primary`,
  `.section-title`. New SCSS appended to `App.scss` following its existing
  section-comment style. No new fonts, no new palette.
- **Degraded visits to `/book/:slug`** (missing/invalid params, dates now
  blocked or in the past) are handled in place: the page shows a plain message
  ("Those dates are no longer available") plus a compact inline stay-form so
  the person fixes dates right there — no redirect back to `/book`.
- **`/book` keeps its search in the URL**: re-submitting the search form
  rewrites the query string, so results stay shareable/bookmarkable at every
  hop, not just the first.
- **Tests**: `bookingStore.js` gets Vitest unit tests (date helpers,
  availability/overlap logic, reference generation) — the first tests in the
  repo. Pages are not unit-tested; the flow is verified via the running app.

## Routes

| Path | Page | Content |
|---|---|---|
| `/book` | Book | Stay search form (dates, guests) + list of available rooms with total price per stay |
| `/book/:slug` | BookRoom | Stay summary + guest details form + confirm |
| `/booking/:ref` | BookingConfirmed | Reference, stay details, link home; reads the booking from localStorage by ref |

Unchanged: `/`, `/rooms/`, `/rooms/:slug`, `/about`, `*`. Unknown `:ref` on
the confirmation page renders a plain "we couldn't find that booking" state
with a link to `/book`.

## Flow

1. Home hero gains an availability strip below the banner: check-in, check-out,
   guests, "Check availability" → `/book?checkIn=…&checkOut=…&guests=…`.
2. `/book` validates the dates (nights ≥ 1, check-in ≥ today, guests ≥ 1),
   shows each room that fits with nights × price and capacity, and links each
   to `/book/:slug` carrying the query params. Rooms that don't fit are absent;
   if none fit, an empty state invites changing dates.
3. `/book/:slug` shows the room, the stay summary (dates, nights, guests,
   total), and the guest form (name, email, phone optional). Confirm saves the
   booking to localStorage and navigates to `/booking/:ref`.
4. `/booking/:ref` displays the saved booking and the reference
   (`BR-` + base36 timestamp + short random suffix).

SingleRoom entry: a "book this room" panel with date/guests inputs; on submit
it goes to `/book/:slug` with those params (the page re-checks availability).

## Files

- `src/bookingStore.js` — new: localStorage read/write, availability mock,
  reference generation, date helpers. No React.
- `src/bookingStore.test.js` — new: unit tests for the store module.
- `src/pages/Book.jsx` — new: search + results.
- `src/pages/BookRoom.jsx` — new: summary + guest form + confirm.
- `src/pages/BookingConfirmed.jsx` — new.
- `src/components/AvailabilityForm.jsx` — new: the date/guests fields, reused
  by the home strip and the SingleRoom panel (variant prop for layout).
- `src/App.jsx` — add the three routes.
- `src/pages/Home.jsx` — add the availability strip to the hero.
- `src/pages/SingleRoom.jsx` — add the booking panel.
- `src/App.scss` — append booking styles.

## What's left to the builder

- Exact markup/ordering inside the forms, and the empty/error states' wording.
- The deterministic blocked-window algorithm (any stable hash of the slug is
  fine) and its constants (window lengths, horizon).
- Mobile layout details, within the existing responsive conventions.
- Whether the home strip sits inside `Hero` as a child of `Banner` or between
  hero and services — builder's eye, keep the hero uncluttered.
