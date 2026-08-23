import { describe, expect, it } from 'vitest';

import { isDynamicDark } from './themeStore';

describe('isDynamicDark', () => {
  it.each([
    [0, true],
    [6, true],
    [7, false],
    [12, false],
    [18, false],
    [19, true],
    [23, true],
  ])('hour %s -> dark %s', (hour, expected) => {
    const date = new Date(2026, 0, 1, hour);
    expect(isDynamicDark(date)).toBe(expected);
  });
});
