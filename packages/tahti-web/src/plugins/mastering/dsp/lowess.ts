/** LOWESS (locally weighted linear regression) smoothing, evaluated at the
 * signal's own evenly-spaced positions — mirrors
 * `statsmodels.nonparametric.lowess(y, linspace(0,1,n), frac, it=0)`, the
 * call matchering makes with its default config (`lowess_it: int = 0`).
 * `it=0` means no robustness-reweighting passes, so this is a single
 * tricube-weighted degree-1 local regression per point — matchering's own
 * default behavior, not a simplification of it. The `delta` interpolation
 * shortcut statsmodels also takes is a pure performance optimization (it
 * doesn't change the result by design), and is skipped here: computing
 * every point directly is still fast at the sizes this pipeline uses. */
export function lowess(y: Float64Array, frac: number): Float64Array {
  const n = y.length;
  const out = new Float64Array(n);
  if (n === 0) {
    return out;
  }
  if (n === 1) {
    out[0] = y[0];
    return out;
  }

  const x = Float64Array.from({ length: n }, (_, i) => i / (n - 1));
  const windowSize = Math.min(n, Math.max(2, Math.ceil(frac * n)));

  for (let i = 0; i < n; i++) {
    let left = i - Math.floor((windowSize - 1) / 2);
    let right = left + windowSize - 1;
    if (left < 0) {
      right -= left;
      left = 0;
    }
    if (right > n - 1) {
      left -= right - (n - 1);
      right = n - 1;
    }
    left = Math.max(0, left);

    const xi = x[i];
    let maxDist = 0;
    for (let j = left; j <= right; j++) {
      maxDist = Math.max(maxDist, Math.abs(x[j] - xi));
    }
    if (maxDist === 0) {
      maxDist = Number.EPSILON;
    }

    let sw = 0;
    let swx = 0;
    let swy = 0;
    let swxx = 0;
    let swxy = 0;
    for (let j = left; j <= right; j++) {
      const u = Math.abs(x[j] - xi) / maxDist;
      const weight = u < 1 ? (1 - u ** 3) ** 3 : 0;
      sw += weight;
      swx += weight * x[j];
      swy += weight * y[j];
      swxx += weight * x[j] * x[j];
      swxy += weight * x[j] * y[j];
    }

    // Weighted least squares fit of y = a + b*x, evaluated at x = xi.
    const det = sw * swxx - swx * swx;
    if (Math.abs(det) < 1e-12) {
      out[i] = sw > 0 ? swy / sw : y[i];
    } else {
      const a = (swy * swxx - swx * swxy) / det;
      const b = (sw * swxy - swx * swy) / det;
      out[i] = a + b * xi;
    }
  }

  return out;
}
