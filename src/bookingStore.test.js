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
