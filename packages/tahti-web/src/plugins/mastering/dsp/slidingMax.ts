/** O(n) sliding-window maximum via a monotonic deque (index-based ring
 * buffer, no array shift/splice) — ports the two ways
 * `matchering/limiter/hyrax.py`'s `__sliding_window_fast` calls
 * `scipy.ndimage.maximum_filter1d`.
 *
 * Edge handling deviates slightly from scipy's default `mode='reflect'`:
 * this clamps to the edge value instead of mirroring. The affected region
 * is at most one window's width (tens of samples) at the very start/end of
 * a track that is typically millions of samples long — an inaudible,
 * documented simplification, not a different algorithm. */
function maxFilter1d(x: Float64Array, size: number): Float64Array {
  const n = x.length;
  if (n === 0) {
    return x;
  }
  if (size <= 1) {
    return x.slice();
  }

  const left = Math.floor(size / 2);
  const right = size - left - 1;
  const padded = new Float64Array(n + left + right);
  padded.fill(x[0], 0, left);
  padded.set(x, left);
  padded.fill(x[n - 1], left + n, padded.length);

  const out = new Float64Array(n);
  // Ring-buffer deque of indices into `padded`, values monotonically
  // decreasing front-to-back so the front is always the window's max.
  const deque = new Int32Array(padded.length);
  let head = 0;
  let tail = 0; // next free slot

  for (let i = 0; i < padded.length; i++) {
    while (tail > head && padded[deque[tail - 1]] <= padded[i]) {
      tail--;
    }
    deque[tail++] = i;
    while (deque[head] <= i - size) {
      head++;
    }
    if (i >= size - 1) {
      out[i - size + 1] = padded[deque[head]];
    }
  }

  return out;
}

function makeOdd(n: number): number {
  return n % 2 === 0 ? n + 1 : n;
}

/** The limiter's attack-stage window: a symmetric centered max filter of
 * width `2*makeOdd(windowSize)-1`. */
export function slidingMaxAttack(
  x: Float64Array,
  windowSize: number,
): Float64Array {
  const w = makeOdd(Math.max(1, Math.round(windowSize)));
  return maxFilter1d(x, 2 * w - 1);
}

/** The limiter's hold-stage window: zero-pad on the left by
 * `floor((windowSize-1)/2)`, run a centered max filter, then drop the same
 * number of samples from the end — a lookahead-style max, implemented via
 * padding the same way the source algorithm does. */
export function slidingMaxHold(
  x: Float64Array,
  windowSize: number,
): Float64Array {
  const size = Math.max(1, Math.round(windowSize));
  const half = Math.floor((size - 1) / 2);
  if (half === 0) {
    return maxFilter1d(x, size);
  }
  const padded = new Float64Array(x.length + half);
  padded.set(x, half);
  const filtered = maxFilter1d(padded, size);
  return filtered.slice(0, filtered.length - half);
}

export { maxFilter1d };
