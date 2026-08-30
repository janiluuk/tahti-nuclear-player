/** First-order digital lowpass filters + zero-phase (`filtfilt`) filtering,
 * ported from `matchering/limiter/hyrax.py`'s use of `scipy.signal.butter`
 * (order 1), `scipy.signal.filtfilt`, and its own closed-form one-pole
 * "attack" filter. All three of hyrax's filters (attack, hold, release)
 * are order 1, so this only needs to handle that case — not a general
 * filter-design/filtering library. */

export type Order1Filter = { b0: number; b1: number; a1: number };

/** The limiter's attack-stage filter: `b = [1 - coef]`, `a = [1, -coef]`,
 * `coef = exp(attack_filter_coefficient / attack)` — a plain one-pole
 * smoother, not a Butterworth design. */
export function onePoleFilter(coefficient: number): Order1Filter {
  return { b0: 1 - coefficient, b1: 0, a1: -coefficient };
}

/** A first-order Butterworth lowpass, digitized via the bilinear transform
 * with frequency pre-warping — mirrors `scipy.signal.butter(1, cutoffHz,
 * fs=sampleRate)`. Closed-form for order 1 (no general pole/zero placement
 * needed): `H(s) = wc / (s + wc)` with `wc` the pre-warped cutoff. */
export function designButterworthLowpass1(
  cutoffHz: number,
  sampleRate: number,
): Order1Filter {
  const warpedCutoff =
    2 * sampleRate * Math.tan((Math.PI * cutoffHz) / sampleRate);
  const k = warpedCutoff / (2 * sampleRate + warpedCutoff);
  const alpha =
    (2 * sampleRate - warpedCutoff) / (2 * sampleRate + warpedCutoff);
  return { b0: k, b1: k, a1: -alpha };
}

function directFormII(
  filter: Order1Filter,
  x: Float64Array,
  z1init: number,
): Float64Array {
  const { b0, b1, a1 } = filter;
  const y = new Float64Array(x.length);
  let z1 = z1init;
  for (let n = 0; n < x.length; n++) {
    const yn = b0 * x[n] + z1;
    z1 = b1 * x[n] - a1 * yn;
    y[n] = yn;
  }
  return y;
}

/** Steady-state initial condition for a constant input of 1 — mirrors
 * `scipy.signal.lfilter_zi` for an order-1 system, closed form: solving
 * for the state at which a constant input produces a constant (transient
 * -free) output. */
function initialConditionForUnitInput(filter: Order1Filter): number {
  const { b0, b1, a1 } = filter;
  return (b1 - a1 * b0) / (1 + a1);
}

/** Odd (point) reflection at both ends — mirrors `scipy.signal.odd_ext`,
 * the default padding `scipy.signal.filtfilt` uses. */
function oddExtend(x: Float64Array, padLength: number): Float64Array {
  const n = x.length;
  const out = new Float64Array(n + 2 * padLength);
  for (let i = 0; i < padLength; i++) {
    out[i] = 2 * x[0] - x[Math.min(n - 1, padLength - i)];
  }
  out.set(x, padLength);
  for (let i = 0; i < padLength; i++) {
    out[padLength + n + i] = 2 * x[n - 1] - x[Math.max(0, n - 2 - i)];
  }
  return out;
}

/** Plain forward-only IIR filtering with zero initial state — mirrors
 * `scipy.signal.lfilter(b, a, x)`'s default (`zi=None`). Used for the
 * limiter's hold/release stages, which (unlike the attack stage) apply a
 * single causal pass, not a zero-phase one. */
export function lfilterOrder1(
  filter: Order1Filter,
  x: Float64Array,
): Float64Array {
  return directFormII(filter, x, 0);
}

/** Zero-phase forward-backward filtering — mirrors
 * `scipy.signal.filtfilt(b, a, x)` with its defaults (`padtype='odd'`,
 * `padlen=3*max(len(a),len(b))`, steady-state initial conditions scaled by
 * each pass's first sample). For these order-1 filters `padlen` is a fixed
 * 6 samples either way (`len(a)===len(b)===2` once `b1=0` is made
 * explicit). */
export function filtfiltOrder1(
  filter: Order1Filter,
  x: Float64Array,
): Float64Array {
  const padLength = Math.min(6, Math.max(0, x.length - 1));
  const padded = padLength > 0 ? oddExtend(x, padLength) : x;
  const zi = initialConditionForUnitInput(filter);

  const forward = directFormII(filter, padded, zi * padded[0]);
  const forwardReversed = forward.slice().reverse();
  const backward = directFormII(
    filter,
    forwardReversed,
    zi * forwardReversed[0],
  );
  const result = backward.reverse();

  return padLength > 0 ? result.slice(padLength, padLength + x.length) : result;
}
