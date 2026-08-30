import { describe, expect, it } from 'vitest';

import { DEFAULT_LIMITER_CONFIG, limit } from './limiter';

const SAMPLE_RATE = 44100;
const THRESHOLD = (2 ** 15 - 61) / 2 ** 15;

function randomSignal(n: number, seed = 1): Float64Array {
  let state = seed;
  const rand = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  return Float64Array.from({ length: n }, () => rand() * 2 - 1);
}

describe('limit', () => {
  it('is a no-op when nothing exceeds the threshold', () => {
    const n = 2000;
    const quiet = randomSignal(n, 3).map((v) => v * 0.3);
    const stereo = { left: quiet, right: quiet.slice() };
    const result = limit(stereo, SAMPLE_RATE, THRESHOLD);
    expect(Array.from(result.left)).toEqual(Array.from(stereo.left));
    expect(Array.from(result.right)).toEqual(Array.from(stereo.right));
  });

  it('brings a clipping peak down to (approximately) the threshold', () => {
    const n = 20000;
    const left = new Float64Array(n);
    const right = new Float64Array(n);
    // A loud burst well above the threshold, in the middle of otherwise
    // quiet audio.
    for (let i = 9000; i < 9500; i++) {
      const v = 2.5 * Math.sin((i * Math.PI) / 250);
      left[i] = v;
      right[i] = v;
    }
    const result = limit(
      { left, right },
      SAMPLE_RATE,
      THRESHOLD,
      DEFAULT_LIMITER_CONFIG,
    );

    let maxAbs = 0;
    for (let i = 0; i < n; i++) {
      maxAbs = Math.max(
        maxAbs,
        Math.abs(result.left[i]),
        Math.abs(result.right[i]),
      );
    }
    // A small allowance for the attack stage's inherent lookahead/settling
    // behavior rather than a mathematically perfect brickwall.
    expect(maxAbs).toBeLessThan(THRESHOLD * 1.05);
  });

  it('never increases the peak amplitude anywhere (gain is <= 1 everywhere)', () => {
    const n = 5000;
    const left = randomSignal(n, 5).map((v) => v * 1.5);
    const right = randomSignal(n, 6).map((v) => v * 1.5);
    const result = limit(
      { left, right },
      SAMPLE_RATE,
      THRESHOLD,
      DEFAULT_LIMITER_CONFIG,
    );
    for (let i = 0; i < n; i++) {
      expect(Math.abs(result.left[i])).toBeLessThanOrEqual(
        Math.abs(left[i]) + 1e-9,
      );
      expect(Math.abs(result.right[i])).toBeLessThanOrEqual(
        Math.abs(right[i]) + 1e-9,
      );
    }
  });

  it('preserves stereo balance for a mid-only (identical L/R) signal', () => {
    const n = 8000;
    const mono = randomSignal(n, 8).map((v) => v * 1.8);
    const result = limit(
      { left: mono, right: mono.slice() },
      SAMPLE_RATE,
      THRESHOLD,
      DEFAULT_LIMITER_CONFIG,
    );
    for (let i = 0; i < n; i++) {
      expect(result.left[i]).toBeCloseTo(result.right[i], 10);
    }
  });
});
