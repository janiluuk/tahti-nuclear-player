import { describe, expect, it } from 'vitest';

import { maxFilter1d, slidingMaxAttack, slidingMaxHold } from './slidingMax';

function naiveMaxFilter1d(x: Float64Array, size: number): Float64Array {
  const n = x.length;
  const left = Math.floor(size / 2);
  const out = new Float64Array(n);
  const clamp = (i: number) => x[Math.min(n - 1, Math.max(0, i))];
  for (let i = 0; i < n; i++) {
    let max = -Infinity;
    for (let k = 0; k < size; k++) {
      max = Math.max(max, clamp(i - left + k));
    }
    out[i] = max;
  }
  return out;
}

function randomSignal(n: number, seed = 1): Float64Array {
  let state = seed;
  const rand = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  return Float64Array.from({ length: n }, () => rand() * 2 - 1);
}

describe('maxFilter1d', () => {
  it('matches a naive O(n*w) reference for odd window sizes', () => {
    const x = randomSignal(200, 5);
    const actual = maxFilter1d(x, 7);
    const expected = naiveMaxFilter1d(x, 7);
    for (let i = 0; i < x.length; i++) {
      expect(actual[i]).toBeCloseTo(expected[i], 10);
    }
  });

  it('matches a naive O(n*w) reference for even window sizes', () => {
    const x = randomSignal(150, 11);
    const actual = maxFilter1d(x, 8);
    const expected = naiveMaxFilter1d(x, 8);
    for (let i = 0; i < x.length; i++) {
      expect(actual[i]).toBeCloseTo(expected[i], 10);
    }
  });

  it('finds an isolated peak', () => {
    const x = new Float64Array(50).fill(0);
    x[25] = 1;
    const out = maxFilter1d(x, 5);
    expect(out[25]).toBe(1);
    expect(out[23]).toBe(1);
    expect(out[27]).toBe(1);
    expect(out[10]).toBe(0);
  });

  it('is a no-op for window size 1', () => {
    const x = randomSignal(10, 3);
    expect(Array.from(maxFilter1d(x, 1))).toEqual(Array.from(x));
  });
});

describe('slidingMaxAttack / slidingMaxHold', () => {
  it('preserve the input length', () => {
    const x = randomSignal(500, 2);
    expect(slidingMaxAttack(x, 44).length).toBe(500);
    expect(slidingMaxHold(x, 44).length).toBe(500);
  });

  it('never produce a value below the local input (max filters only grow or hold)', () => {
    const x = randomSignal(300, 8).map((v) => Math.abs(v));
    const attack = slidingMaxAttack(x, 20);
    const hold = slidingMaxHold(x, 20);
    for (let i = 0; i < x.length; i++) {
      expect(attack[i]).toBeGreaterThanOrEqual(x[i] - 1e-9);
      expect(hold[i]).toBeGreaterThanOrEqual(x[i] - 1e-9);
    }
  });
});
