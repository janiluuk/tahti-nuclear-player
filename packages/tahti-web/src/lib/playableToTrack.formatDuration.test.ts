import { describe, expect, it } from 'vitest';

import { formatDuration } from './playableToTrack';

describe('formatDuration', () => {
  it('renders minutes and seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(125)).toBe('2:05');
  });

  it('renders hours for long sets', () => {
    expect(formatDuration(5249)).toBe('1:27:29');
  });
});
