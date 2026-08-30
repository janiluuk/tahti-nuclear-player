import { describe, expect, it } from 'vitest';

import { lowess } from './lowess';

describe('lowess', () => {
  it('returns the input unchanged for a constant signal', () => {
    const y = new Float64Array(50).fill(3);
    const out = lowess(y, 0.3);
    for (const v of out) {
      expect(v).toBeCloseTo(3, 8);
    }
  });

  it('recovers a linear trend away from the edges (degree-1 fit is exact for lines)', () => {
    const n = 100;
    const y = Float64Array.from({ length: n }, (_, i) => 2 + 5 * (i / (n - 1)));
    const out = lowess(y, 0.3);
    for (let i = 10; i < n - 10; i++) {
      expect(out[i]).toBeCloseTo(y[i], 2);
    }
  });

  it('smooths out a single spike without fully removing it', () => {
    const n = 60;
    const y = new Float64Array(n).fill(1);
    y[30] = 10;
    const out = lowess(y, 0.2);
    // The spike should be flattened relative to its raw height...
    expect(out[30]).toBeLessThan(10);
    // ...but the smoothed curve should still bulge upward near it.
    expect(out[30]).toBeGreaterThan(out[0]);
  });

  it('handles very small arrays without throwing', () => {
    expect(Array.from(lowess(new Float64Array(0), 0.3))).toEqual([]);
    expect(Array.from(lowess(Float64Array.from([5]), 0.3))).toEqual([5]);
    const out = lowess(Float64Array.from([1, 2]), 0.5);
    expect(out.length).toBe(2);
  });

  it('reduces variance of a noisy signal around a flat mean', () => {
    let state = 7;
    const rand = () => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
    const n = 200;
    const y = Float64Array.from({ length: n }, () => 5 + (rand() - 0.5) * 2);
    const out = lowess(y, 0.1);

    const variance = (arr: Float64Array) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
    };
    expect(variance(out)).toBeLessThan(variance(y));
  });
});
