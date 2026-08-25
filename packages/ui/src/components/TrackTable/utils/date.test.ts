import { formatReleaseDate } from './date';

describe('formatReleaseDate', () => {
  it('formats an ISO date without a time component', () => {
    expect(formatReleaseDate('2026-01-15T00:00:00.000Z')).toBe('Jan 15, 2026');
  });

  it('returns an empty string when the date is missing', () => {
    expect(formatReleaseDate(undefined)).toBe('');
  });

  it('returns an empty string for an unparsable date', () => {
    expect(formatReleaseDate('not-a-date')).toBe('');
  });
});
