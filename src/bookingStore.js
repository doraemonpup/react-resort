// Booking store: dates, availability mock, localStorage persistence.
// No React. The availability mock in blockedWindowsFor is the swap point
// for a real availability API (see docs/superpowers/specs booking design).

const STORAGE_KEY = 'resort-bookings';
const MS_PER_DAY = 86400000;
const HORIZON_DAYS = 90;

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function nightsBetween(checkIn, checkOut) {
  const a = parseDate(checkIn);
  const b = parseDate(checkOut);
  return Math.round((b - a) / MS_PER_DAY);
}

// Half-open intervals: touching end/start does NOT overlap.
// 'YYYY-MM-DD' strings compare correctly as lexicographic strings.
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// djb2: deterministic non-negative 32-bit hash of the slug.
export function hashSlug(slug) {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 33 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Deterministic mock: each room has 2–3 pre-booked windows in the next
// 90 days, derived from its slug, stable across reloads and users.
export function blockedWindowsFor(slug) {
  const hash = hashSlug(slug);
  const today = new Date();
  const count = 2 + (hash % 2); // 2–3 windows
  const windows = [];
  for (let i = 0; i < count; i++) {
    const offsetDays = 5 + ((hash * (i + 7)) % 70); // starts 5–74 days out
    const lengthDays = 2 + ((hash >>> (i * 5)) % 6); // 2–7 nights
    const start = new Date(today);
    start.setDate(start.getDate() + offsetDays);
    const end = new Date(start);
    end.setDate(end.getDate() + lengthDays);
    windows.push({ start: toDateKey(start), end: toDateKey(end) });
  }
  return windows;
}

export function generateReference() {
  const random = Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .padStart(3, '0');
  return `BR-${Date.now().toString(36)}-${random}`;
}

export function getBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  const bookings = [...getBookings(), booking];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return bookings;
}

export function getBookingByRef(ref) {
  return getBookings().find(booking => booking.ref === ref);
}

export function isRoomAvailable(slug, checkIn, checkOut) {
  for (const w of blockedWindowsFor(slug)) {
    if (rangesOverlap(checkIn, checkOut, w.start, w.end)) return false;
  }
  for (const booking of getBookings()) {
    if (booking.roomSlug !== slug) continue;
    if (rangesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)) {
      return false;
    }
  }
  return true;
}
