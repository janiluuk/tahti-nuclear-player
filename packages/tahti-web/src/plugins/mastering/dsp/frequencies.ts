/** FFT-based EQ matching — ports `matchering/stage_helpers/match_frequencies.py`:
 * average the magnitude spectrum of the loudest pieces for target vs.
 * reference, derive a smoothed matching FIR filter from their ratio, and
 * convolve the target with it. */
import { fromReal } from './complex';
import { fitNaturalCubicSpline } from './cubicSpline';
import { fft, ifft, irfft, rfft } from './fft';
import { lowess } from './lowess';

/** Splits each piece into non-overlapping `fftSize`-length frames (no
 * window — matchering's own STFT call uses `window="boxcar"`, i.e. none),
 * and averages the magnitude spectrum across every frame from every
 * piece — mirrors `__average_fft`. */
export function averageMagnitudeSpectrum(
  pieces: Float64Array[],
  fftSize: number,
): Float64Array {
  const bins = fftSize / 2 + 1;
  const sum = new Float64Array(bins);
  let frameCount = 0;
  for (const piece of pieces) {
    const frames = Math.floor(piece.length / fftSize);
    for (let f = 0; f < frames; f++) {
      const frame = piece.subarray(f * fftSize, (f + 1) * fftSize);
      const spectrum = rfft(frame);
      for (let k = 0; k < bins; k++) {
        sum[k] += Math.hypot(spectrum.re[k], spectrum.im[k]);
      }
      frameCount++;
    }
  }
  if (frameCount > 0) {
    for (let k = 0; k < bins; k++) {
      sum[k] /= frameCount;
    }
  }
  return sum;
}

function hannWindow(size: number): Float64Array {
  const w = new Float64Array(size);
  if (size <= 1) {
    w.fill(1);
    return w;
  }
  for (let i = 0; i < size; i++) {
    w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }
  return w;
}

/** Circular shift that moves the second half of the array to the front —
 * mirrors `np.fft.ifftshift` (identical to `fftshift` for even lengths,
 * which `fftSize` always is here). */
function ifftshift(x: Float64Array): Float64Array {
  const n = x.length;
  const half = Math.floor(n / 2);
  const out = new Float64Array(n);
  out.set(x.subarray(half), 0);
  out.set(x.subarray(0, half), n - half);
  return out;
}

/** Smooths a linear-frequency magnitude ratio curve by resampling it onto
 * a log-frequency grid, LOWESS-smoothing there (matching perception, which
 * is roughly log-frequency), then resampling back — mirrors
 * `__smooth_exponentially`. */
function smoothExponentially(
  matchingFft: Float64Array,
  sampleRate: number,
  fftSize: number,
  lowessFrac: number,
  linLogOversampling: number,
): Float64Array {
  const bins = matchingFft.length;
  const gridLinear = Float64Array.from(
    { length: bins },
    (_, i) => sampleRate * 0.5 * (i / (bins - 1)),
  );

  const logCount = Math.floor(fftSize / 2) * linLogOversampling + 1;
  const logStart = Math.log10(4 / fftSize);
  const gridLogarithmic = Float64Array.from({ length: logCount }, (_, i) => {
    const t = logCount === 1 ? 0 : i / (logCount - 1);
    return sampleRate * 0.5 * 10 ** (logStart + t * -logStart);
  });

  const linearToLog = fitNaturalCubicSpline(gridLinear, matchingFft);
  const matchingFftLog = Float64Array.from(gridLogarithmic, (f) =>
    linearToLog.at(f),
  );

  const smoothedLog = lowess(matchingFftLog, lowessFrac);

  const logToLinear = fitNaturalCubicSpline(gridLogarithmic, smoothedLog);
  const filtered = Float64Array.from(gridLinear, (f) => logToLinear.at(f));

  filtered[0] = 0;
  filtered[1] = matchingFft[1];
  return filtered;
}

/** Derives the FIR filter that reshapes `target`'s average spectrum
 * toward `reference`'s — mirrors `get_fir`. */
export function deriveFir(
  targetPieces: Float64Array[],
  referencePieces: Float64Array[],
  sampleRate: number,
  fftSize: number,
  minValue: number,
  lowessFrac: number,
  linLogOversampling: number,
): Float64Array {
  const targetAvg = averageMagnitudeSpectrum(targetPieces, fftSize);
  const referenceAvg = averageMagnitudeSpectrum(referencePieces, fftSize);

  const matchingFft = new Float64Array(targetAvg.length);
  for (let i = 0; i < matchingFft.length; i++) {
    matchingFft[i] = referenceAvg[i] / Math.max(minValue, targetAvg[i]);
  }

  const smoothed = smoothExponentially(
    matchingFft,
    sampleRate,
    fftSize,
    lowessFrac,
    linLogOversampling,
  );

  let fir = irfft(fromReal(smoothed), fftSize);
  fir = ifftshift(fir);
  const window = hannWindow(fir.length);
  for (let i = 0; i < fir.length; i++) {
    fir[i] *= window[i];
  }
  return fir;
}

/** Linear convolution of `signal` with `fir`, returning the `signal`
 * -length "same" slice — mirrors `scipy.signal.fftconvolve(x, fir,
 * "same")`. Uses overlap-add so memory stays bounded by the block size
 * regardless of how long `signal` is (a full single-FFT convolution would
 * need an FFT the size of the whole track, which is both slow and
 * memory-heavy for multi-minute audio). */
export function convolveSame(
  signal: Float64Array,
  fir: Float64Array,
): Float64Array {
  const firLen = fir.length;
  let blockFftSize = 1;
  while (blockFftSize < firLen * 4) {
    blockFftSize <<= 1;
  }
  const blockSize = blockFftSize - firLen + 1;

  const firPadded = new Float64Array(blockFftSize);
  firPadded.set(fir);
  const firSpectrum = fft(fromReal(firPadded));

  const fullLength = signal.length + firLen - 1;
  const full = new Float64Array(fullLength);

  for (let start = 0; start < signal.length; start += blockSize) {
    const end = Math.min(signal.length, start + blockSize);
    const chunk = new Float64Array(blockFftSize);
    chunk.set(signal.subarray(start, end));
    const chunkSpectrum = fft(fromReal(chunk));

    const productRe = new Float64Array(blockFftSize);
    const productIm = new Float64Array(blockFftSize);
    for (let k = 0; k < blockFftSize; k++) {
      productRe[k] =
        chunkSpectrum.re[k] * firSpectrum.re[k] -
        chunkSpectrum.im[k] * firSpectrum.im[k];
      productIm[k] =
        chunkSpectrum.re[k] * firSpectrum.im[k] +
        chunkSpectrum.im[k] * firSpectrum.re[k];
    }
    const block = ifft({ re: productRe, im: productIm });

    const addLen = Math.min(blockFftSize, fullLength - start);
    for (let i = 0; i < addLen; i++) {
      full[start + i] += block.re[i];
    }
  }

  const sameStart = Math.floor((firLen - 1) / 2);
  return full.slice(sameStart, sameStart + signal.length);
}
