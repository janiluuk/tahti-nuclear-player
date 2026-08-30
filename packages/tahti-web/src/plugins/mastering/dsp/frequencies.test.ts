import { describe, expect, it } from 'vitest';

import {
  averageMagnitudeSpectrum,
  convolveSame,
  deriveFir,
} from './frequencies';
import { rms } from './levels';

function randomSignal(n: number, seed = 1): Float64Array {
  let state = seed;
  const rand = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  return Float64Array.from({ length: n }, () => rand() * 2 - 1);
}

describe('averageMagnitudeSpectrum', () => {
  it('peaks at the correct bin for a pure sine tone', () => {
    const fftSize = 256;
    const freqBin = 20;
    const piece = Float64Array.from({ length: fftSize * 4 }, (_, i) =>
      Math.sin((2 * Math.PI * freqBin * i) / fftSize),
    );
    const spectrum = averageMagnitudeSpectrum([piece], fftSize);
    let peakBin = 0;
    let peakValue = -Infinity;
    for (let i = 0; i < spectrum.length; i++) {
      if (spectrum[i] > peakValue) {
        peakValue = spectrum[i];
        peakBin = i;
      }
    }
    expect(peakBin).toBe(freqBin);
  });

  it('averages across multiple pieces', () => {
    const fftSize = 64;
    const silent = new Float64Array(fftSize);
    const loud = new Float64Array(fftSize).fill(1);
    const spectrum = averageMagnitudeSpectrum([silent, loud], fftSize);
    // DC bin should be the average of 0 (silent) and fftSize (loud).
    expect(spectrum[0]).toBeCloseTo(fftSize / 2, 6);
  });

  it('returns all zeros when no piece is long enough for a full frame', () => {
    const spectrum = averageMagnitudeSpectrum([new Float64Array(10)], 256);
    expect(Array.from(spectrum).every((v) => v === 0)).toBe(true);
  });
});

describe('convolveSame', () => {
  it('matches a naive direct "same"-mode convolution for a small case', () => {
    const signal = randomSignal(50, 3);
    const fir = Float64Array.from([0.2, 0.5, 0.2, 0.1]);

    // Naive full convolution, then take the scipy "same" center slice.
    const fullLen = signal.length + fir.length - 1;
    const full = new Float64Array(fullLen);
    for (let i = 0; i < signal.length; i++) {
      for (let j = 0; j < fir.length; j++) {
        full[i + j] += signal[i] * fir[j];
      }
    }
    const start = Math.floor((fir.length - 1) / 2);
    const expected = full.slice(start, start + signal.length);

    const actual = convolveSame(signal, fir);
    expect(actual.length).toBe(signal.length);
    for (let i = 0; i < signal.length; i++) {
      expect(actual[i]).toBeCloseTo(expected[i], 8);
    }
  });

  it('is close to identity when convolved with a unit impulse at the FIR\'s "same"-mode center tap', () => {
    const signal = randomSignal(2000, 9);
    const fir = new Float64Array(4096);
    // scipy's "same" mode centers the output on `floor((firLen-1)/2)`, not
    // on `firLen/2` — this is the tap that makes the impulse an identity.
    fir[Math.floor((fir.length - 1) / 2)] = 1;
    const result = convolveSame(signal, fir);
    for (let i = 0; i < signal.length; i++) {
      expect(result[i]).toBeCloseTo(signal[i], 6);
    }
  });

  it('produces an output whose length equals the input length across a block boundary', () => {
    const fir = new Float64Array(4096);
    fir[Math.floor((fir.length - 1) / 2)] = 1;
    // Longer than one overlap-add block (block size is ~12k for this FIR
    // length), so this exercises more than one iteration of the loop.
    const signal = randomSignal(50000, 21);
    const result = convolveSame(signal, fir);
    expect(result.length).toBe(signal.length);
    for (let i = 0; i < signal.length; i += 997) {
      expect(result[i]).toBeCloseTo(signal[i], 6);
    }
  });
});

describe('deriveFir', () => {
  const fftSize = 4096;
  const sampleRate = 44100;

  it('is close to a centered unit impulse when target and reference spectra already match', () => {
    const piece = randomSignal(fftSize * 8, 5);
    const fir = deriveFir(
      [piece],
      [piece],
      sampleRate,
      fftSize,
      1e-6,
      0.0375,
      4,
    );
    expect(fir.length).toBe(fftSize);

    // The FIR should be dominated by its center tap (an approximate
    // identity filter), not spread out into a strong EQ correction.
    const center = fftSize / 2;
    const centerEnergy = fir[center] ** 2;
    const totalEnergy = fir.reduce((sum, v) => sum + v * v, 0);
    expect(centerEnergy / totalEnergy).toBeGreaterThan(0.3);
  });

  it('boosts high frequencies in the target when the reference is brighter', () => {
    // Broadband (noise-based) signals, not pure tones: this is what the
    // smoothing pipeline (LOWESS over a densely-populated spectrum) is
    // actually designed for, and avoids the edge case of an all-but-empty
    // spectrum a single sine tone produces. Target: heavily low-pass
    // -smoothed noise (dull). Reference: raw broadband noise (comparatively
    // bright/flat spectrum).
    const n = fftSize * 8;
    const noise = randomSignal(n, 17);
    const target = new Float64Array(n);
    let smoothed = 0;
    const alpha = 0.02;
    for (let i = 0; i < n; i++) {
      smoothed += alpha * (noise[i] - smoothed);
      target[i] = smoothed;
    }
    const reference = randomSignal(n, 31);

    const fir = deriveFir(
      [target],
      [reference],
      sampleRate,
      fftSize,
      1e-6,
      0.0375,
      4,
    );
    const processed = convolveSame(target, fir);

    // Compare high-frequency content (a simple high-pass proxy: sample
    // -to-sample differencing amplifies high frequencies) before and after.
    const highFreqEnergy = (x: Float64Array) => {
      let sum = 0;
      for (let i = 1; i < x.length; i++) {
        sum += (x[i] - x[i - 1]) ** 2;
      }
      return sum;
    };
    expect(highFreqEnergy(processed)).toBeGreaterThan(highFreqEnergy(target));
  });
});

describe('rms sanity check for the module boundary', () => {
  it('is re-exported correctly from levels.ts (smoke test for imports)', () => {
    expect(rms(Float64Array.from([1, 1]))).toBeCloseTo(1, 8);
  });
});
