import { createComplex, fromReal, type ComplexArray } from './complex';

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/** In-place iterative radix-2 Cooley-Tukey FFT (Gentleman-Sande /
 * bit-reversal permutation + butterfly stages). `length` must be a power
 * of two. `inverse` computes the inverse DFT (not normalized by the
 * caller — this function divides by N itself so `ifft(fft(x)) === x`). */
export function fftInPlace(
  re: Float64Array,
  im: Float64Array,
  inverse: boolean,
): void {
  const n = re.length;
  if (n !== im.length) {
    throw new Error('fftInPlace: re/im length mismatch');
  }
  if (!isPowerOfTwo(n)) {
    throw new Error(`fftInPlace: length must be a power of two, got ${n}`);
  }
  if (n <= 1) {
    return;
  }

  // Bit-reversal permutation.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  const sign = inverse ? 1 : -1;
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const angleStep = (sign * 2 * Math.PI) / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k++) {
        const angle = angleStep * k;
        const wRe = Math.cos(angle);
        const wIm = Math.sin(angle);
        const evenIdx = start + k;
        const oddIdx = start + k + half;
        const oddRe = re[oddIdx] * wRe - im[oddIdx] * wIm;
        const oddIm = re[oddIdx] * wIm + im[oddIdx] * wRe;
        re[oddIdx] = re[evenIdx] - oddRe;
        im[oddIdx] = im[evenIdx] - oddIm;
        re[evenIdx] += oddRe;
        im[evenIdx] += oddIm;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

export function fft(input: ComplexArray): ComplexArray {
  const out = { re: input.re.slice(), im: input.im.slice() };
  fftInPlace(out.re, out.im, false);
  return out;
}

export function ifft(input: ComplexArray): ComplexArray {
  const out = { re: input.re.slice(), im: input.im.slice() };
  fftInPlace(out.re, out.im, true);
  return out;
}

/** Forward FFT of a real-valued signal, returning only the non-negative
 * frequency bins (`0..n/2` inclusive) — mirrors `numpy.fft.rfft`. `n` must
 * be a power of two. */
export function rfft(real: Float64Array | Float32Array): ComplexArray {
  const full = fft(fromReal(real));
  const half = real.length / 2 + 1;
  return { re: full.re.slice(0, half), im: full.im.slice(0, half) };
}

/** Inverse of `rfft`: reconstructs the full Hermitian-symmetric spectrum
 * from its non-negative-frequency half and returns `n` real samples —
 * mirrors `numpy.fft.irfft`. */
export function irfft(half: ComplexArray, n: number): Float64Array {
  if (!isPowerOfTwo(n)) {
    throw new Error(`irfft: n must be a power of two, got ${n}`);
  }
  const full = createComplex(n);
  const bins = half.re.length;
  for (let k = 0; k < bins; k++) {
    full.re[k] = half.re[k];
    full.im[k] = half.im[k];
    if (k > 0 && k < n - k) {
      full.re[n - k] = half.re[k];
      full.im[n - k] = -half.im[k];
    }
  }
  const result = ifft(full);
  return result.re;
}
