# Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a search-first booking flow — availability search from the home hero and room pages, room selection, guest details, and a confirmed booking persisted to localStorage.

**Architecture:** One pure store module (`bookingStore.js`) owns dates, the deterministic availability mock, and localStorage; three new route pages (`/book`, `/book/:slug`, `/booking/:ref`) and one reusable `AvailabilityForm` component build the UI on the existing SCSS design system. `RoomContext` and `data.js` are untouched; dates travel in query params.

**Tech Stack:** Vite 8 + React 19 (plain JS), react-router v8, Vitest + jsdom, SCSS.

**Spec:** `docs/superpowers/specs/2026-11-20-booking-flow-design.md`

## Global Constraints

- Plain JavaScript, JSX in `.jsx` files. No TypeScript, no new dependencies.
- Import routing from `'react-router'`, never `'react-router-dom'`.
- Dates are `'YYYY-MM-DD'` strings; parse them as **local** midnight.
- localStorage key: `resort-bookings`. Booking reference matches `/^BR-[0-9a-z]+-[0-9a-z]{3}$/`.
- Booking object shape (exact):
  `{ ref, roomSlug, roomName, checkIn, checkOut, guests, nights, totalPrice, name, email, phone, createdAt }`
  — `ref` string, `guests`/`nights`/`totalPrice` numbers, `createdAt` ISO string, rest strings.
- UI copy: plain, active, sentence case. Fixed strings: "Check-out must be after check-in", "Check-in can't be in the past", confirm button "Confirm booking".
- Reuse existing SCSS: tokens (`--primaryColor`, `--borderRadius`, `--lightShadow`, …) and classes `.form-control`, `.form-group`, `.btn-primary`, `.section-title`. New SCSS is appended to `App.scss` with a `/* … */` section comment per the file's convention.
- No changes to `src/context.jsx` or `src/data.js`.
- Room objects come from `useContext(RoomContext)` → `{ rooms, getRoom }` (rooms have `id, name, slug, capacity, price, images[0], featured, …`).

## Review Focus

Failure modes the spec implies but no page test exercises (pages are not unit-tested):

1. **Same room re-booked for overlapping dates** (two confirmations) — the second confirm must fail with "Those dates are no longer available". Pinned by Task 1's `isRoomAvailable`-after-`saveBooking` test.
2. **Zero-night stay** (`checkOut === checkIn`) — must be rejected before any availability call. Pinned by Task 1's `nightsBetween` zero test + Task 2's validation.
3. **Half-open date boundary** — a stay ending on the 15th must not block a stay starting on the 15th. Pinned by Task 1's `rangesOverlap` touching test.
4. **Unknown booking reference** on `/booking/:ref` — plain "couldn't find that booking" state, no crash. Task 5 verification step.
5. **Guests above room capacity** — room must be absent from `/book` results. Task 3 verification step.

---

### Task 1: `bookingStore` module (TDD)

**Files:**
- Create: `src/bookingStore.js`
- Test: `src/bookingStore.test.js`

**Interfaces:**
- Consumes: nothing (pure module + jsdom `localStorage`; jsdom env already configured in `vite.config.mjs`).
- Produces (all later tasks rely on these exact signatures):
  - `toDateKey(date: Date) -> string` — `'YYYY-MM-DD'`, local timezone.
  - `parseDate(str: string) -> Date` — local midnight.
  - `nightsBetween(checkIn: string, checkOut: string) -> number` — negative when reversed, 0 when equal.
  - `rangesOverlap(aStart, aEnd, bStart, bEnd) -> boolean` — half-open intervals: touching end/start does **not** overlap.
  - `hashSlug(slug: string) -> number` — deterministic non-negative integer.
  - `blockedWindowsFor(slug: string) -> Array<{start: string, end: string}>` — 2–3 windows, all inside [today, today+90 days], each ≥ 1 night.
  - `generateReference() -> string` — `'BR-'` + `Date.now().toString(36)` + `'-'` + 3 random base36 chars.
  - `getBookings() -> Array<booking>` — `[]` when nothing stored.
  - `saveBooking(booking: booking) -> Array<booking>` — appends, persists, returns new array.
  - `getBookingByRef(ref: string) -> booking | undefined`.
  - `isRoomAvailable(slug: string, checkIn: string, checkOut: string) -> boolean` — true when no overlap with the slug's blocked windows or any saved booking for that slug. Capacity is NOT checked here (pages own that).

- [ ] **Step 1: Write the failing tests** in `src/bookingStore.test.js`

```js
import { beforeEach, describe, expect, it } from 'vitest';
import {
  nightsBetween, rangesOverlap, hashSlug, blockedWindowsFor,
  generateReference, getBookings, saveBooking, getBookingByRef,
  isRoomAvailable, toDateKey,
} from './bookingStore';

describe('nightsBetween', () => {
  it('counts full nights', () =>
    expect(nightsBetween('2026-11-20', '2026-11-23')).toBe(3));
  it('same day is zero nights', () =>
    expect(nightsBetween('2026-11-20', '2026-11-20')).toBe(0));
  it('reversed range is negative', () =>
    expect(nightsBetween('2026-11-23', '2026-11-20')).toBe(-3));
});

describe('rangesOverlap', () => {
  it('detects overlap', () =>
    expect(rangesOverlap('2026-11-10', '2026-11-15', '2026-11-14', '2026-11-20')).toBe(true));
  it('touching end/start does not overlap (half-open)', () =>
    expect(rangesOverlap('2026-11-10', '2026-11-15', '2026-11-15', '2026-11-20')).toBe(false));
  it('contained range overlaps', () =>
    expect(rangesOverlap('2026-11-10', '2026-11-20', '2026-11-12', '2026-11-14')).toBe(true));
});

describe('hashSlug', () => {
  it('is deterministic', () =>
    expect(hashSlug('beach-house')).toBe(hashSlug('beach-house')));
  it('is a non-negative integer', () => {
    const h = hashSlug('beach-house');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
  });
});

describe('blockedWindowsFor', () => {
  it('is stable for a slug', () =>
    expect(blockedWindowsFor('beach-house')).toEqual(blockedWindowsFor('beach-house')));
  it('returns 2–3 windows within the 90-day horizon', () => {
    const today = toDateKey(new Date());
    const windows = blockedWindowsFor('beach-house');
    expect(windows.length).toBeGreaterThanOrEqual(2);
    expect(windows.length).toBeLessThanOrEqual(3);
    for (const w of windows) {
      expect(nightsBetween(w.start, w.end)).toBeGreaterThan(0);
      expect(nightsBetween(today, w.start)).toBeGreaterThanOrEqual(0);
      expect(nightsBetween(today, w.end)).toBeLessThanOrEqual(90);
    }
  });
});

describe('generateReference', () => {
  it('matches the BR-… format', () =>
    expect(generateReference()).toMatch(/^BR-[0-9a-z]+-[0-9a-z]{3}$/));
  it('is unique across calls', () => {
    const refs = new Set(Array.from({ length: 20 }, generateReference));
    expect(refs.size).toBe(20);
  });
});

describe('bookings', () => {
  beforeEach(() => localStorage.clear());
  // Dates are past the 90-day mock horizon so blocked windows can't interfere.
  const booking = {
    ref: 'BR-test-001', roomSlug: 'beach-house', roomName: 'Beach House',
    checkIn: '2027-05-10', checkOut: '2027-05-15', guests: 2, nights: 5,
    totalPrice: 500, name: 'Test Guest', email: 't@example.com',
    phone: '', createdAt: new Date().toISOString(),
  };

  it('starts empty', () => expect(getBookings()).toEqual([]));
  it('saves and retrieves by reference', () => {
    saveBooking(booking);
    expect(getBookingByRef('BR-test-001')).toEqual(booking);
  });
  it('appends without overwriting', () => {
    saveBooking(booking);
    saveBooking({ ...booking, ref: 'BR-test-002' });
    expect(getBookings().length).toBe(2);
  });
  it('a saved booking makes its room unavailable for overlapping dates', () => {
    saveBooking(booking);
    expect(isRoomAvailable('beach-house', '2027-05-12', '2027-05-20')).toBe(false);
    expect(isRoomAvailable('beach-house', '2027-05-15', '2027-05-20')).toBe(true); // half-open
    expect(isRoomAvailable('other-room', '2027-05-12', '2027-05-20')).toBe(true);
  });
  it('a mocked blocked window makes the room unavailable', () => {
    const [w] = blockedWindowsFor('beach-house');
    expect(isRoomAvailable('beach-house', w.start, w.end)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/bookingStore.test.js`
Expected: FAIL — module does not exist / imports unresolved.

- [ ] **Step 3: Implement `src/bookingStore.js`**

Signatures above; the only non-obvious body is the mock windows. Deterministic
algorithm (the constants are the spec's "90-day horizon, 2–3 windows"):

```js
const count = 2 + (hash % 2);                     // 2–3 windows
for (let i = 0; i < count; i++) {
  const offsetDays = 5 + ((hash * (i + 7)) % 70); // starts 5–74 days out
  const lengthDays = 2 + ((hash >> (i * 5)) % 6); // 2–7 nights (end ≤ today+81)
  // start = today + offsetDays, end = start + lengthDays, as 'YYYY-MM-DD'
}
```

Everything else is straightforward from the signatures and tests: `parseDate`
via `new Date(y, m-1, d)`; `nightsBetween` via rounded ms difference / 86400000;
`hashSlug` via djb2 (`h = 5381; h = (h * 33 + code) >>> 0` per char);
`rangesOverlap` via `aStart < bEnd && bStart < aEnd` on the date strings
(lexicographic comparison is valid for `'YYYY-MM-DD'`); bookings under key
`resort-bookings` with JSON parse guarded by try/catch → `[]`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/bookingStore.test.js`
Expected: PASS (all).

- [ ] **Step 5: Commit** (includes the spec and this plan, still untracked)

```bash
git add src/bookingStore.js src/bookingStore.test.js docs/
git commit -m "feat: booking store with availability mock and tests"
```

---

### Task 2: `AvailabilityForm` component

**Files:**
- Create: `src/components/AvailabilityForm.jsx`

**Interfaces:**
- Consumes: nothing from Task 1 yet (validation is self-contained).
- Produces:

```jsx
// src/components/AvailabilityForm.jsx
// Props:
//   variant: 'strip' | 'panel'   — strip: horizontal row (hero); panel: stacked
//   initial: { checkIn: string, checkOut: string, guests: number } (optional)
//   onSubmit: ({ checkIn, checkOut, guests }) => void  — called ONLY with valid data
```

- [ ] **Step 1: Implement the component**

Controlled form, `useState` for the three fields (initialized from `initial`,
guests defaulting to 1). On submit: validate — all fields present; `checkIn`
not before today (message "Check-in can't be in the past"); `checkOut` after
`checkIn` ("Check-out must be after check-in"). Invalid → render the messages
inline above the fields; valid → `onSubmit({ checkIn, checkOut, guests: Number(guests) })`.
Markup: `.form-group` + `label` + `.form-control`; `type="date"` with
`min={todayKey}` on check-in; guests is `type="number"` `min="1"`. Root class
`availability-form availability-form--strip|panel`. Use `toDateKey(new Date())`
from `../bookingStore` for the `min` and the past check.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/AvailabilityForm.jsx
git commit -m "feat: reusable availability form"
```

---

### Task 3: `/book` page — search + available rooms

**Files:**
- Create: `src/pages/Book.jsx`
- Modify: `src/App.jsx` (add route + import)
- Modify: `src/App.scss` (append `/* booking pages */` section)

**Interfaces:**
- Consumes: `AvailabilityForm` (Task 2), `isRoomAvailable` (Task 1),
  `nightsBetween` (Task 1), `RoomContext` → `{ rooms }`.
- Produces: route `/book` reading/writing query params `checkIn`, `checkOut`,
  `guests`; result cards link to `/book/:slug?checkIn=…&checkOut=…&guests=…`
  (Task 4 reads those).

- [ ] **Step 1: Implement the page**

`useSearchParams` from `'react-router'`. On mount read the three params
(`guests` via `parseInt`). Render `AvailabilityForm variant="strip"` whose
`onSubmit` writes the params back (`setSearchParams`) — this is the URL-sync
decision. Below it:

- Params missing/invalid (no dates, or `nightsBetween <= 0`): show the hint
  "Pick your dates to see available rooms." and no results.
- Valid: filter `rooms` to `room.capacity >= guests && isRoomAvailable(room.slug, checkIn, checkOut)`,
  and render a card per room: `images[0]`, name, "Sleeps {capacity}", total
  `nights * room.price` as `{total}€ for {nights} nights`, and a `.btn-primary`
  `Link` to `/book/${room.slug}?${params}` labelled "Book this room".
- No matches: "No rooms match those dates. Try shifting your stay."
- Page heading via the existing `.section-title` ("book your stay").

- [ ] **Step 2: Add the route** in `src/App.jsx`

```jsx
<Route path='/book' element={<Book />} />
```

- [ ] **Step 3: Styles** — append `/* booking pages */` styles for the
  results grid (reuse the `roomslist-center` grid pattern) and the strip row.

- [ ] **Step 4: Verify**

Run: `npm run build` → clean. Start `npm start`, open
`http://localhost:3000/book?checkIn=2026-12-01&checkOut=2026-12-03&guests=2`
— expect a list of rooms whose capacity ≥ 2 (Review Focus #5), totals of
`2 × price`, and no room whose mocked windows cover those dates. Open the same
URL with `guests=20` — expect the empty state.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Book.jsx src/App.jsx src/App.scss
git commit -m "feat: availability search page at /book"
```

---

### Task 4: `/book/:slug` — stay summary + guest details

**Files:**
- Create: `src/pages/BookRoom.jsx`
- Modify: `src/App.jsx` (route)
- Modify: `src/App.scss`

**Interfaces:**
- Consumes: `AvailabilityForm` (Task 2), `isRoomAvailable`, `saveBooking`,
  `generateReference`, `nightsBetween` (Task 1), `RoomContext` → `getRoom(slug)`.
- Produces: route `/book/:slug`; on confirm navigates to `/booking/:ref`
  (Task 5). Writes bookings of the exact shape from Global Constraints.

- [ ] **Step 1: Implement the page**

Read `slug` (`useParams`) and the three query params. `getRoom(slug)` →
unknown slug renders the existing `Error` page import style (`return <Error />`
is fine). Then the availability re-check — a **failed re-check is a normal
path** (the SingleRoom panel sends user-typed dates here):

- Valid params, room fits (`capacity >= guests`), `isRoomAvailable` true →
  stay summary (room name, dates, `{nights} nights`, `{guests} guests`,
  total `nights * room.price`) + guest form: name (required), email
  (`type="email"`, required), phone (optional). Confirm button "Confirm booking"
  → build the booking object (exact shape), `saveBooking`, then
  `navigate(`/booking/${ref}`)`.
- Anything off (missing/invalid params, past dates, no capacity, unavailable):
  render the message "Those dates are no longer available." plus an inline
  `AvailabilityForm variant="panel"` whose `onSubmit` updates the query params
  in place (`setSearchParams`) — the page re-checks and recovers without
  leaving.

- [ ] **Step 2: Add the route** in `src/App.jsx`

```jsx
<Route path='/book/:slug' element={<BookRoom />} />
```

- [ ] **Step 3: Styles** — summary block and guest form layout (two-column
  summary/form at `min-width: 992px`, following the `.single-room-info` pattern).

- [ ] **Step 4: Verify**

Run: `npm run build` → clean. In the dev server: `/book/beach-house` with no
params → inline form + message, not a crash (Review Focus #1 path). With valid
free dates → summary + form; submit → lands on `/booking/BR-…`. Re-submitting
the same room/dates again (now saved in localStorage) → shows the unavailable
message (Review Focus #1).

- [ ] **Step 5: Commit**

```bash
git add src/pages/BookRoom.jsx src/App.jsx src/App.scss
git commit -m "feat: room booking step with guest details"
```

---

### Task 5: `/booking/:ref` — confirmation page

**Files:**
- Create: `src/pages/BookingConfirmed.jsx`
- Modify: `src/App.jsx` (route)
- Modify: `src/App.scss`

**Interfaces:**
- Consumes: `getBookingByRef(ref)` (Task 1).
- Produces: route `/booking/:ref`.

- [ ] **Step 1: Implement the page**

`useParams` → `getBookingByRef(ref)`. Found: `.section-title` heading, the
reference in a prominent block (`--primaryLight` background, `--mainBlack`
text, monospace-friendly large reference — no new font, use `Inter` with
letter-spacing), then stay details: room name, dates, nights, guests, total,
guest name/email. Button "Back to home" (`Link` to `/`), copy: "Your booking
is confirmed". Not found: heading "Booking not found", text "We couldn't find
that booking.", `Link` to `/book` labelled "Check availability" — no crash
(Review Focus #4).

- [ ] **Step 2: Add the route** in `src/App.jsx`

```jsx
<Route path='/booking/:ref' element={<BookingConfirmed />} />
```

- [ ] **Step 3: Styles** — confirmation block.

- [ ] **Step 4: Verify**

Run: `npm run build` → clean. Dev server: a ref from a Task 4 booking renders
its details; `/booking/BR-bogus` renders the not-found state and the rest of
the app still works (navbar routes intact).

- [ ] **Step 5: Commit**

```bash
git add src/pages/BookingConfirmed.jsx src/App.jsx src/App.scss
git commit -m "feat: booking confirmation page"
```

---

### Task 6: Entry points — home strip + room panel, then full walkthrough

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/SingleRoom.jsx`
- Modify: `src/App.scss`

**Interfaces:**
- Consumes: `AvailabilityForm` (Task 2). Navigation via `useNavigate` from
  `'react-router'`.
- Produces: the two entry points of the shipped flow.

- [ ] **Step 1: Home hero strip**

In `Home.jsx`, wrap the existing `Banner` and the new form in one column
container (the `Hero` lays children out in a row — a single wrapper keeps the
banner centered):

```jsx
<Hero>
  <div className='home-cta'>
    <Banner …>…</Banner>
    <AvailabilityForm variant='strip' onSubmit={…} />
  </div>
</Hero>
```

`onSubmit` → `navigate(`/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)`.
`.home-cta` style: flex column, centered, gap, no width constraints beyond the
banner's own `max-width`.

- [ ] **Step 2: SingleRoom booking panel**

In `SingleRoom.jsx`, after the `.room-extras` section: a "book this room"
section — `.section-title` "book this room" + `AvailabilityForm variant='panel'`
whose `onSubmit` → `navigate(`/book/${slug}?…`)`. The `/book/:slug` page owns
the availability re-check.

- [ ] **Step 3: Styles** — strip-on-hero legibility (the banner's translucent
  white-on-image treatment won't fit the strip; give the strip a solid
  `--mainWhite` card look with `--lightShadow`), panel section spacing.

- [ ] **Step 4: Full-flow verification**

Run: `npx vitest run` → all Task 1 tests still pass. `npm run build` → clean.
Then with `npm start` running, walk the whole flow and confirm each hop:

1. Home → strip: pick dates/guests → lands on `/book` with params in the URL.
2. `/book` → pick a room → `/book/:slug` summary shows correct nights × price.
3. Confirm with name + email → `/booking/BR-…` shows the reference.
4. Reload the confirmation page → still renders (localStorage).
5. Book the same room for the same dates again from the room page → "no
   longer available" message.
6. Navbar routes (`/`, `/rooms/`, `/rooms/:slug`, `/about`, unknown) unaffected.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.jsx src/pages/SingleRoom.jsx src/App.scss
git commit -m "feat: booking entry points on home and room pages"
```
