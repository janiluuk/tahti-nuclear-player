/** The Hyrax lookahead limiter — ports `matchering/limiter/hyrax.py`,
 * using matchering's own default `LimiterConfig` values. */
import {
  designButterworthLowpass1,
  filtfiltOrder1,
  lfilterOrder1,
  onePoleFilter,
} from './butterworth';
import type { StereoSignal } from './levels';
import { slidingMaxAttack, slidingMaxHold } from './slidingMax';

export type LimiterConfig = {
  attackMs: number;
  holdMs: number;
  releaseMs: number;
  attackFilterCoefficient: number;
  /** Cutoff (Hz) passed straight to the order-1 Butterworth hold filter —
   * matchering names this `hold_filter_coefficient`, but it's used exactly
   * as `scipy.signal.butter(1, this, fs=sampleRate)`'s cutoff argument. */
  holdFilterCutoffHz: number;
  /** Same, for the release filter, except matchering divides it by
   * `releaseMs` first (`release_filter_coefficient / release`). */
  releaseFilterCoefficient: number;
};

export const DEFAULT_LIMITER_CONFIG: LimiterConfig = {
  attackMs: 1,
  holdMs: 1,
  releaseMs: 3000,
  attackFilterCoefficient: -2,
  holdFilterCutoffHz: 7,
  releaseFilterCoefficient: 800,
};

function msToSamples(ms: number, sampleRate: number): number {
  return Math.trunc(sampleRate * ms * 1e-3);
}

/** Per-sample max(|L|, |R|, threshold) / threshold — mirrors `rectify`. */
function rectify(stereo: StereoSignal, threshold: number): Float64Array {
  const n = stereo.left.length;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    out[i] =
      Math.max(Math.abs(stereo.left[i]), Math.abs(stereo.right[i]), threshold) /
      threshold;
  }
  return out;
}

function flip(x: Float64Array): Float64Array {
  const out = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) {
    out[i] = 1 - x[i];
  }
  return out;
}

function invert(x: Float64Array): Float64Array {
  const out = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) {
    out[i] = 1 / x[i];
  }
  return out;
}

function maxMix(...arrays: Float64Array[]): Float64Array {
  const n = arrays[0].length;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let m = -Infinity;
    for (const a of arrays) {
      m = Math.max(m, a[i]);
    }
    out[i] = m;
  }
  return out;
}

/** Applies the lookahead limiter to a stereo signal, returning a new
 * `{left, right}` — mirrors `limit(array, config)`. `threshold` is
 * matchering's `Config.threshold`, the ceiling this limiter enforces. */
export function limit(
  stereo: StereoSignal,
  sampleRate: number,
  threshold: number,
  config: LimiterConfig = DEFAULT_LIMITER_CONFIG,
): StereoSignal {
  const rectified = rectify(stereo, threshold);

  let needsLimiting = false;
  for (let i = 0; i < rectified.length; i++) {
    if (Math.abs(rectified[i] - 1) > 1e-8) {
      needsLimiting = true;
      break;
    }
  }
  if (!needsLimiting) {
    return stereo;
  }

  const gainHardClip = flip(invert(rectified));

  const attackSamples = msToSamples(config.attackMs, sampleRate);
  const gainHardClipSlided = slidingMaxAttack(gainHardClip, attackSamples);
  const attackFilter = onePoleFilter(
    Math.exp(config.attackFilterCoefficient / attackSamples),
  );
  const gainAttack = filtfiltOrder1(attackFilter, gainHardClipSlided);

  const holdSamples = msToSamples(config.holdMs, sampleRate);
  const slidedHoldInput = slidingMaxHold(gainHardClipSlided, holdSamples);
  const holdFilter = designButterworthLowpass1(
    config.holdFilterCutoffHz,
    sampleRate,
  );
  const holdOutput = lfilterOrder1(holdFilter, slidedHoldInput);

  const releaseFilter = designButterworthLowpass1(
    config.releaseFilterCoefficient / config.releaseMs,
    sampleRate,
  );
  const releaseInput = maxMix(slidedHoldInput, holdOutput);
  const releaseOutput = lfilterOrder1(releaseFilter, releaseInput);
  const gainRelease = maxMix(holdOutput, releaseOutput);

  const gain = flip(maxMix(gainHardClip, gainAttack, gainRelease));

  const n = stereo.left.length;
  const left = new Float64Array(n);
  const right = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    left[i] = stereo.left[i] * gain[i];
    right[i] = stereo.right[i] * gain[i];
  }
  return { left, right };
}
