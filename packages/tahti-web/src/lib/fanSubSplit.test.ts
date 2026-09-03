import { describe, expect, it } from 'vitest';

import {
  computeFanSubSplit,
  eurosFromCents,
  EXAMPLE_FAN_SUB_GROSS_CENTS,
} from './fanSubSplit';

describe('computeFanSubSplit', () => {
  it('matches the documented €5 fan-sub money flow', () => {
    const split = computeFanSubSplit(EXAMPLE_FAN_SUB_GROSS_CENTS);
    expect(split).toEqual({
      grossCents: 500,
      stripeFeeCents: 45,
      orgFeeCents: 10,
      netToArtistCents: 445,
    });
  });

  it('returns zeros when the fan paid nothing', () => {
    expect(computeFanSubSplit(0)).toEqual({
      grossCents: 0,
      stripeFeeCents: 0,
      orgFeeCents: 0,
      netToArtistCents: 0,
    });
  });
});

describe('eurosFromCents', () => {
  it('formats cents as euro amounts', () => {
    expect(eurosFromCents(445)).toBe('€4.45');
  });
});
