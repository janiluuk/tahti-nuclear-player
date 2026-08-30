/** Natural cubic spline interpolation. Matchering itself uses
 * `scipy.interpolate.interp1d(..., kind='cubic')`, which is a not-a-knot
 * B-spline — a different (but comparably smooth) boundary condition than
 * the natural spline used here. Both pass exactly through the given
 * points and are C2-continuous; this is a standard, well-tested
 * alternative for smoothing an EQ-matching curve, not a materially
 * different result. Query points beyond the data range extrapolate using
 * the nearest boundary segment's cubic polynomial, mirroring `interp1d`'s
 * `fill_value="extrapolate"`. */
export type CubicSpline = {
  at(x: number): number;
};

export function fitNaturalCubicSpline(
  xs: Float64Array,
  ys: Float64Array,
): CubicSpline {
  const n = xs.length;
  if (n !== ys.length) {
    throw new Error('fitNaturalCubicSpline: xs/ys length mismatch');
  }
  if (n < 2) {
    const constant = n === 1 ? ys[0] : 0;
    return { at: () => constant };
  }

  const h = new Float64Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i];
  }

  const alpha = new Float64Array(n);
  for (let i = 1; i < n - 1; i++) {
    alpha[i] =
      (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]);
  }

  const l = new Float64Array(n);
  const mu = new Float64Array(n);
  const z = new Float64Array(n);
  l[0] = 1;
  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }
  l[n - 1] = 1;

  const c = new Float64Array(n);
  const b = new Float64Array(n - 1);
  const d = new Float64Array(n - 1);
  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (ys[j + 1] - ys[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  function at(x: number): number {
    let i: number;
    if (x <= xs[0]) {
      i = 0;
    } else if (x >= xs[n - 1]) {
      i = n - 2;
    } else {
      let lo = 0;
      let hi = n - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (xs[mid] <= x) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      i = lo;
    }
    const dx = x - xs[i];
    return ys[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  }

  return { at };
}
