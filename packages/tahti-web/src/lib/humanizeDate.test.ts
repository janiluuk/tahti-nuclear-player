import { describe, expect, it } from 'vitest';

import { humanizePastDate } from './humanizeDate';

const NOW = new Date('2026-09-03T12:00:00.000Z');

describe('humanizePastDate', () => {
  it('uses relative wording for recent times', () => {
    expect(humanizePastDate('2026-09-03T11:59:30.000Z', NOW)).toBe('just now');
    expect(humanizePastDate('2026-09-03T11:59:00.000Z', NOW)).toBe(
      '1 minute ago',
    );
    expect(humanizePastDate('2026-09-03T11:45:00.000Z', NOW)).toBe(
      '15 minutes ago',
    );
    expect(humanizePastDate('2026-09-03T10:00:00.000Z', NOW)).toBe(
      '2 hours ago',
    );
  });

  it('keeps a clock on yesterday and older calendar days', () => {
    const yesterday = new Date(NOW);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);
    expect(humanizePastDate(yesterday.toISOString(), NOW)).toMatch(
      /^yesterday, /,
    );

    const threeDaysAgo = new Date(NOW);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(8, 0, 0, 0);
    expect(humanizePastDate(threeDaysAgo.toISOString(), NOW)).toMatch(
      /^3 days ago, /,
    );

    const lastMonth = new Date(NOW);
    lastMonth.setDate(lastMonth.getDate() - 17);
    expect(humanizePastDate(lastMonth.toISOString(), NOW)).not.toMatch(
      /ago|yesterday/,
    );
  });
});
