import { describe, expect, it } from 'vitest';

import {
  amplify,
  analyzeLevels,
  calculatePieceRanges,
  clip,
  loudestPieces,
  lrToMs,
  msToLr,
  normalize,
  pieceRmses,
  rms,
  rmsCoefficient,
} from './levels';

describe('lrToMs / msToLr', () => {
  it('round-trips left/right through mid/side', () => {
    const left = Float64Array.from([1, -0.5, 0.2, 0.8]);
    const right = Float64Array.from([0.9, -0.3, -0.1, 0.4]);
    const { mid, side } = lrToMs({ left, right });
    const restored = msToLr(mid, side);
    for (let i = 0; i < left.length; i++) {
      expect(restored.left[i]).toBeCloseTo(left[i], 10);
      expect(restored.right[i]).toBeCloseTo(right[i], 10);
    }
  });

  it('mid is silent and side carries everything for a fully out-of-phase signal', () => {
    const left = Float64Array.from([1, 1, 1]);
    const right = Float64Array.from([-1, -1, -1]);
    const { mid, side } = lrToMs({ left, right });
    expect(Array.from(mid)).toEqual([0, 0, 0]);
    expect(Array.from(side)).toEqual([1, 1, 1]);
  });
});

describe('rms', () => {
  it('computes the RMS of a known signal', () => {
    expect(rms(Float64Array.from([3, 4]))).toBeCloseTo(Math.sqrt(25 / 2), 10);
  });

  it('is zero for silence', () => {
    expect(rms(new Float64Array(10))).toBe(0);
  });
});

describe('amplify / clip', () => {
  it('scales every sample by the gain', () => {
    expect(Array.from(amplify(Float64Array.from([1, -2, 3]), 2))).toEqual([
      2, -4, 6,
    ]);
  });

  it('clips to the given ceiling symmetrically', () => {
    expect(
      Array.from(clip(Float64Array.from([-2, -0.5, 0, 0.5, 2]), 1)),
    ).toEqual([-1, -0.5, 0, 0.5, 1]);
  });
});

describe('normalize', () => {
  // `normalize` brings a signal UP toward the threshold when it's under it
  // (e.g. bringing a too-quiet reference up to near-full-scale before
  // analysis) — it does not clip an over-threshold peak down unless
  // `normalizeClipped` is explicitly set.

  it('boosts a quiet signal so its peak sits exactly at the threshold', () => {
    const x = Float64Array.from([0, 0.1, -0.1]);
    const { result, coefficient } = normalize(x, 1, 1e-6, false);
    expect(coefficient).toBeCloseTo(0.1, 10);
    let maxAbs = 0;
    for (const v of result) {
      maxAbs = Math.max(maxAbs, Math.abs(v));
    }
    expect(maxAbs).toBeCloseTo(1, 10);
  });

  it('leaves a peak already at or above threshold untouched unless normalizeClipped is true', () => {
    const x = Float64Array.from([0, 2, -2, 1]);
    const untouched = normalize(x, 1, 1e-6, false);
    expect(untouched.coefficient).toBe(1);
    expect(Array.from(untouched.result)).toEqual(Array.from(x));

    const forced = normalize(x, 1, 1e-6, true);
    expect(forced.coefficient).toBeCloseTo(2, 10);
    let maxAbs = 0;
    for (const v of forced.result) {
      maxAbs = Math.max(maxAbs, Math.abs(v));
    }
    expect(maxAbs).toBeCloseTo(1, 10);
  });
});

describe('calculatePieceRanges', () => {
  it('splits into divisions of equal size, dropping the remainder', () => {
    const ranges = calculatePieceRanges(1000, 300);
    // divisions = floor(1000/300)+1 = 4, pieceSize = floor(1000/4) = 250
    expect(ranges).toHaveLength(4);
    for (const r of ranges) {
      expect(r.length).toBe(250);
    }
    expect(ranges[0].start).toBe(0);
    expect(ranges[3].start).toBe(750);
  });
});

describe('pieceRmses / loudestPieces', () => {
  it('finds pieces at or above the average RMS', () => {
    const quiet = new Float64Array(10).fill(0.01);
    const loud = new Float64Array(10).fill(1);
    const x = new Float64Array(30);
    x.set(quiet, 0);
    x.set(loud, 10);
    x.set(quiet, 20);
    const ranges = [
      { start: 0, length: 10 },
      { start: 10, length: 10 },
      { start: 20, length: 10 },
    ];
    const rmses = pieceRmses(x, ranges);
    const average = rms(rmses);
    const { indices, matchRms } = loudestPieces(rmses, average);
    expect(indices).toEqual([1]);
    expect(matchRms).toBeCloseTo(1, 10);
  });
});

describe('rmsCoefficient', () => {
  it('is the ratio of reference to main RMS', () => {
    expect(rmsCoefficient(0.1, 0.4, 1e-6)).toBeCloseTo(4, 10);
  });

  it('floors the denominator at epsilon to avoid dividing by ~0', () => {
    expect(rmsCoefficient(0, 0.4, 0.01)).toBeCloseTo(40, 10);
  });
});

describe('analyzeLevels', () => {
  it('extracts the loud section of a mostly-quiet stereo signal as the loudest piece', () => {
    const n = 4000;
    const left = new Float64Array(n);
    const right = new Float64Array(n);
    for (let i = 1000; i < 2000; i++) {
      left[i] = 0.8;
      right[i] = 0.8;
    }
    const analysis = analyzeLevels({ left, right }, 1000);
    expect(analysis.pieceRanges.length).toBeGreaterThan(1);
    expect(analysis.loudestMid.length).toBeGreaterThan(0);
    // Every extracted loudest-mid piece should actually contain signal.
    for (const piece of analysis.loudestMid) {
      expect(rms(piece)).toBeGreaterThan(0);
    }
  });
});
