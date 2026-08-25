import { describe, expect, it } from 'vitest';

import type { StudioShowBooking } from '../api/shows';
import {
  addDays,
  atHour,
  buildBookingGrid,
  filterBookingsForStation,
  GREEN_ROOM_WINDOW_AFTER_MINUTES,
  GREEN_ROOM_WINDOW_BEFORE_MINUTES,
  isGreenRoomWindow,
  nextSelectionOnCellClick,
  selectionRange,
  startOfLocalDay,
  weekDays,
  weekLabel,
  weekRangeIso,
} from './radioSchedule';

function booking(overrides: Partial<StudioShowBooking>): StudioShowBooking {
  return {
    id: 'booking-1',
    startAt: new Date('2026-08-24T20:00:00').toISOString(),
    endAt: new Date('2026-08-24T21:00:00').toISOString(),
    note: null,
    showType: 'LIVE_SET',
    channelSlug: 'demo',
    username: 'demo',
    displayName: 'Demo Artist',
    isMine: false,
    ...overrides,
  };
}

describe('weekDays / weekRangeIso', () => {
  it('returns 7 consecutive local days starting at weekStart', () => {
    const start = startOfLocalDay(new Date('2026-08-24T15:00:00'));
    const days = weekDays(start);
    expect(days).toHaveLength(7);
    expect(days[0]!.toDateString()).toBe(start.toDateString());
    expect(days[6]!.toDateString()).toBe(addDays(start, 6).toDateString());
  });

  it('produces an ISO from/to spanning exactly the visible days', () => {
    const start = startOfLocalDay(new Date('2026-08-24T00:00:00'));
    const { from, to } = weekRangeIso(start);
    expect(new Date(from).getTime()).toBe(start.getTime());
    expect(new Date(to).getTime()).toBe(addDays(start, 7).getTime());
  });
});

describe('weekLabel', () => {
  it('formats the first and last visible day using the runtime locale', () => {
    const start = startOfLocalDay(new Date('2026-08-24T00:00:00'));
    const days = weekDays(start);
    const label = weekLabel(days);
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    expect(label).toBe(`${fmt(days[0]!)} – ${fmt(days[6]!)}`);
  });

  it('returns an empty string for an empty day list', () => {
    expect(weekLabel([])).toBe('');
  });
});

describe('filterBookingsForStation', () => {
  const bookings = [
    booking({ id: 'a', channelSlug: 'demo', isMine: true }),
    booking({ id: 'b', channelSlug: 'other-artist', isMine: false }),
  ];

  it('shows every booking for the "radio" station', () => {
    expect(filterBookingsForStation(bookings, 'radio', 'demo')).toHaveLength(2);
  });

  it('narrows to the caller channel for "mine"', () => {
    const filtered = filterBookingsForStation(bookings, 'mine', 'demo');
    expect(filtered).toEqual([bookings[0]]);
  });

  it('falls back to every booking for "mine" when there is no own channel', () => {
    expect(filterBookingsForStation(bookings, 'mine', null)).toHaveLength(2);
  });
});

describe('buildBookingGrid', () => {
  it('maps a booking to every hour cell it spans', () => {
    const day = startOfLocalDay(new Date('2026-08-24T00:00:00'));
    const twoHour = booking({
      startAt: atHour(day, 20).toISOString(),
      endAt: atHour(day, 22).toISOString(),
    });
    const grid = buildBookingGrid([day], [twoHour], [19, 20, 21, 22]);
    expect(grid.get(`${day.toDateString()}-19`)).toBeUndefined();
    expect(grid.get(`${day.toDateString()}-20`)).toBe(twoHour);
    expect(grid.get(`${day.toDateString()}-21`)).toBe(twoHour);
    expect(grid.get(`${day.toDateString()}-22`)).toBeUndefined();
  });
});

describe('nextSelectionOnCellClick', () => {
  const day = startOfLocalDay(new Date('2026-08-24T00:00:00'));

  it('starts a fresh 1h selection from no selection', () => {
    const next = nextSelectionOnCellClick(null, day, 20, 2);
    expect(next).toEqual({ day, startHour: 20, hours: 1 });
  });

  it('extends the selection when clicking the hour right after it', () => {
    const current = { day, startHour: 20, hours: 1 as const };
    const next = nextSelectionOnCellClick(current, day, 21, 2);
    expect(next).toEqual({ day, startHour: 20, hours: 2 });
  });

  it('does not extend past maxHours', () => {
    const current = { day, startHour: 20, hours: 2 as const };
    // Already at the 2h cap — clicking the following hour starts a new
    // selection there instead of growing past the cap.
    const next = nextSelectionOnCellClick(current, day, 22, 2);
    expect(next).toEqual({ day, startHour: 22, hours: 1 });
  });

  it('clears the selection when clicking its own start hour again', () => {
    const current = { day, startHour: 20, hours: 1 as const };
    const next = nextSelectionOnCellClick(current, day, 20, 2);
    expect(next).toBeNull();
  });

  it('replaces the selection when clicking an unrelated cell', () => {
    const current = { day, startHour: 20, hours: 1 as const };
    const otherDay = addDays(day, 1);
    const next = nextSelectionOnCellClick(current, otherDay, 10, 2);
    expect(next).toEqual({ day: otherDay, startHour: 10, hours: 1 });
  });
});

describe('selectionRange', () => {
  it('converts a selection into ISO start/end bounds', () => {
    const day = startOfLocalDay(new Date('2026-08-24T00:00:00'));
    const range = selectionRange({ day, startHour: 20, hours: 2 });
    expect(range.startAt).toBe(atHour(day, 20).toISOString());
    expect(range.endAt).toBe(atHour(day, 22).toISOString());
  });
});

describe('isGreenRoomWindow', () => {
  const start = new Date('2026-08-24T20:00:00Z').getTime();
  const end = new Date('2026-08-24T21:00:00Z').getTime();
  const show = booking({
    startAt: new Date(start).toISOString(),
    endAt: new Date(end).toISOString(),
  });

  it('is closed well before the slot starts', () => {
    const before = start - (GREEN_ROOM_WINDOW_BEFORE_MINUTES + 1) * 60_000;
    expect(isGreenRoomWindow(show, before)).toBe(false);
  });

  it('opens within the pre-show window', () => {
    const justBefore = start - (GREEN_ROOM_WINDOW_BEFORE_MINUTES - 1) * 60_000;
    expect(isGreenRoomWindow(show, justBefore)).toBe(true);
  });

  it('stays open while the slot is live', () => {
    expect(isGreenRoomWindow(show, start + 30 * 60_000)).toBe(true);
  });

  it('stays open through the post-show grace period', () => {
    const justAfter = end + (GREEN_ROOM_WINDOW_AFTER_MINUTES - 1) * 60_000;
    expect(isGreenRoomWindow(show, justAfter)).toBe(true);
  });

  it('closes once the grace period elapses', () => {
    const after = end + (GREEN_ROOM_WINDOW_AFTER_MINUTES + 1) * 60_000;
    expect(isGreenRoomWindow(show, after)).toBe(false);
  });
});
