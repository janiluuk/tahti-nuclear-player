import { describe, expect, it } from 'vitest';

import { rms } from './dsp/levels';
import {
  defaultMasteringConfig,
  matchTracks,
  type MasteringConfig,
} from './match';

function randomSignal(n: number, seed = 1): Float64Array {
  let state = seed;
  const rand = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  return Float64Array.from({ length: n }, () => rand() * 2 - 1);
}

/** A small, fast test config: a lower sample rate and FFT size than
 * matchering's real defaults, so this integration test runs in
 * milliseconds instead of processing a multi-minute track. The algorithm
 * itself is unchanged — only the analysis-window sizes shrink. */
function fastTestConfig(sampleRate: number): MasteringConfig {
  const base = defaultMasteringConfig(sampleRate);
  return { ...base, fftSize: 256, maxPieceSizeSeconds: 1 };
}

describe('matchTracks', () => {
  const sampleRate = 8000;

  it('brings a quiet target closer to a louder reference of similar tonal balance', () => {
    const n = sampleRate * 4; // 4 seconds
    const noise = randomSignal(n, 11);

    // Quiet target: low-passed noise at a small amplitude.
    const target = new Float64Array(n);
    let smoothed = 0;
    for (let i = 0; i < n; i++) {
      smoothed += 0.05 * (noise[i] - smoothed);
      target[i] = smoothed * 0.05;
    }

    // Louder reference: the same tonal shape (low-passed noise), much
    // louder, from an independent noise source so it isn't a bit-identical
    // copy of the target.
    const noise2 = randomSignal(n, 47);
    const reference = new Float64Array(n);
    let smoothed2 = 0;
    for (let i = 0; i < n; i++) {
      smoothed2 += 0.05 * (noise2[i] - smoothed2);
      reference[i] = smoothed2 * 0.5;
    }

    const targetSignal = { left: target, right: target.slice() };
    const referenceSignal = { left: reference, right: reference.slice() };

    const targetRms = rms(target);
    const referenceRms = rms(reference);
    expect(targetRms).toBeLessThan(referenceRms); // sanity check on the fixture

    const result = matchTracks(
      { stereo: targetSignal, sampleRate },
      { stereo: referenceSignal, sampleRate },
      fastTestConfig(sampleRate),
    );

    expect(result.left.length).toBe(n);
    expect(result.right.length).toBe(n);

    const resultRms = rms(result.left);
    // The mastered result should have moved substantially toward the
    // reference's loudness, not stayed near the target's original level.
    const originalGap = Math.abs(referenceRms - targetRms);
    const remainingGap = Math.abs(referenceRms - resultRms);
    expect(remainingGap).toBeLessThan(originalGap * 0.5);

    // The limiter's job: nothing in the result should exceed its threshold
    // by more than a small settling allowance.
    const config = fastTestConfig(sampleRate);
    let maxAbs = 0;
    for (let i = 0; i < n; i++) {
      maxAbs = Math.max(
        maxAbs,
        Math.abs(result.left[i]),
        Math.abs(result.right[i]),
      );
    }
    expect(maxAbs).toBeLessThan(config.threshold * 1.1);
  });

  it('produces a finite, non-silent result', () => {
    const n = sampleRate * 4;
    const target = randomSignal(n, 3).map((v) => v * 0.1);
    const reference = randomSignal(n, 4).map((v) => v * 0.3);
    const result = matchTracks(
      { stereo: { left: target, right: target.slice() }, sampleRate },
      { stereo: { left: reference, right: reference.slice() }, sampleRate },
      fastTestConfig(sampleRate),
    );
    expect(Array.from(result.left).every((v) => Number.isFinite(v))).toBe(true);
    expect(rms(result.left)).toBeGreaterThan(0);
  });

  it('throws a clear error when target and reference sample rates differ', () => {
    const n = sampleRate * 4;
    const target = randomSignal(n, 1);
    const reference = randomSignal(n, 2);
    expect(() =>
      matchTracks(
        { stereo: { left: target, right: target.slice() }, sampleRate },
        {
          stereo: { left: reference, right: reference.slice() },
          sampleRate: 44100,
        },
      ),
    ).toThrow(/sample rate/i);
  });

  it('throws a clear error when either track is too short', () => {
    const config = fastTestConfig(sampleRate);
    const short = randomSignal(10, 1);
    const long = randomSignal(sampleRate * 2, 2);
    expect(() =>
      matchTracks(
        { stereo: { left: short, right: short.slice() }, sampleRate },
        { stereo: { left: long, right: long.slice() }, sampleRate },
        config,
      ),
    ).toThrow(/longer than/i);
  });
});
