import { describe, expect, it } from 'vitest';

import { createComplex, fromReal } from './complex';
import { fft, ifft, irfft, rfft } from './fft';

/** Naive O(n^2) DFT — a ground truth independent of the radix-2 code path,
 * used only in tests to cross-check `fft()`. */
function bruteForceDft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  const outRe = new Float64Array(n);
  const outIm = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let sumRe = 0;
    let sumIm = 0;
    for (let t = 0; t < n; t++) {
      const angle = (-2 * Math.PI * k * t) / n;
      const wRe = Math.cos(angle);
      const wIm = Math.sin(angle);
      sumRe += re[t] * wRe - im[t] * wIm;
      sumIm += re[t] * wIm + im[t] * wRe;
    }
    outRe[k] = sumRe;
    outIm[k] = sumIm;
  }
  return { re: outRe, im: outIm };
}

function randomSignal(n: number, seed = 1): Float64Array {
  let state = seed;
  const rand = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  return Float64Array.from({ length: n }, () => rand() * 2 - 1);
}

describe('fft', () => {
  it('matches a brute-force DFT for a small power-of-two signal', () => {
    const re = randomSignal(16);
    const expected = bruteForceDft(re, new Float64Array(16));
    const actual = fft(fromReal(re));
    for (let i = 0; i < 16; i++) {
      expect(actual.re[i]).toBeCloseTo(expected.re[i], 8);
      expect(actual.im[i]).toBeCloseTo(expected.im[i], 8);
    }
  });

  it('round-trips fft -> ifft back to the original signal', () => {
    const n = 64;
    const re = randomSignal(n, 42);
    const im = randomSignal(n, 99);
    const spectrum = fft({ re, im });
    const restored = ifft(spectrum);
    for (let i = 0; i < n; i++) {
      expect(restored.re[i]).toBeCloseTo(re[i], 8);
      expect(restored.im[i]).toBeCloseTo(im[i], 8);
    }
  });

  it('throws for a non-power-of-two length', () => {
    expect(() => fft(fromReal(new Float64Array(10)))).toThrow(/power of two/);
  });

  it('produces a zero-frequency bin equal to the sum of a real signal', () => {
    const re = Float64Array.from([1, 2, 3, 4]);
    const spectrum = fft(fromReal(re));
    expect(spectrum.re[0]).toBeCloseTo(10, 8);
    expect(spectrum.im[0]).toBeCloseTo(0, 8);
  });
});

describe('rfft / irfft', () => {
  it('rfft returns n/2 + 1 bins matching the first half of a full fft', () => {
    const n = 32;
    const re = randomSignal(n, 7);
    const full = fft(fromReal(re));
    const half = rfft(re);
    expect(half.re.length).toBe(n / 2 + 1);
    for (let i = 0; i < half.re.length; i++) {
      expect(half.re[i]).toBeCloseTo(full.re[i], 8);
      expect(half.im[i]).toBeCloseTo(full.im[i], 8);
    }
  });

  it('round-trips rfft -> irfft back to the original real signal', () => {
    const n = 128;
    const re = randomSignal(n, 13);
    const spectrum = rfft(re);
    const restored = irfft(spectrum, n);
    for (let i = 0; i < n; i++) {
      expect(restored[i]).toBeCloseTo(re[i], 6);
    }
  });

  it('reconstructs a pure sine tone from its rfft representation', () => {
    const n = 256;
    const freqBin = 10;
    const re = Float64Array.from({ length: n }, (_, i) =>
      Math.sin((2 * Math.PI * freqBin * i) / n),
    );
    const spectrum = rfft(re);
    // Energy should be concentrated at the tone's bin.
    const magnitudes = spectrum.re.map((v, i) => Math.hypot(v, spectrum.im[i]));
    const peakBin = magnitudes.indexOf(Math.max(...magnitudes));
    expect(peakBin).toBe(freqBin);

    const restored = irfft(spectrum, n);
    for (let i = 0; i < n; i++) {
      expect(restored[i]).toBeCloseTo(re[i], 6);
    }
  });

  it('handles a zero signal', () => {
    const spectrum = rfft(new Float64Array(16));
    expect(Array.from(spectrum.re).every((v) => v === 0)).toBe(true);
    expect(Array.from(spectrum.im).every((v) => v === 0)).toBe(true);
  });
});

describe('createComplex', () => {
  it('creates zero-filled parallel arrays of the requested length', () => {
    const c = createComplex(4);
    expect(c.re.length).toBe(4);
    expect(c.im.length).toBe(4);
    expect(Array.from(c.re)).toEqual([0, 0, 0, 0]);
  });
});
