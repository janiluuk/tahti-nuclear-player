import { describe, expect, it } from 'vitest';

import { fitNaturalCubicSpline } from './cubicSpline';

describe('fitNaturalCubicSpline', () => {
  it('passes exactly through the given points', () => {
    const xs = Float64Array.from([0, 1, 2, 3, 4]);
    const ys = Float64Array.from([0, 1, 4, 9, 16]);
    const spline = fitNaturalCubicSpline(xs, ys);
    for (let i = 0; i < xs.length; i++) {
      expect(spline.at(xs[i])).toBeCloseTo(ys[i], 8);
    }
  });

  it('reproduces a straight line exactly, including between and beyond the points', () => {
    const xs = Float64Array.from([0, 2, 5, 10]);
    const ys = Float64Array.from(xs, (x) => 2 * x + 1);
    const spline = fitNaturalCubicSpline(xs, ys);
    expect(spline.at(3)).toBeCloseTo(7, 8);
    expect(spline.at(-2)).toBeCloseTo(-3, 6);
    expect(spline.at(15)).toBeCloseTo(31, 6);
  });

  it('interpolates smoothly between points on a smooth curve', () => {
    const n = 20;
    const xs = Float64Array.from({ length: n }, (_, i) => i);
    const ys = Float64Array.from(xs, (x) => Math.sin(x * 0.3));
    const spline = fitNaturalCubicSpline(xs, ys);
    // Midpoint between two samples should be close to the true function.
    const trueValue = Math.sin(5.5 * 0.3);
    expect(spline.at(5.5)).toBeCloseTo(trueValue, 2);
  });

  it('handles degenerate inputs of length 0 or 1', () => {
    const empty = fitNaturalCubicSpline(
      new Float64Array(0),
      new Float64Array(0),
    );
    expect(empty.at(5)).toBe(0);
    const single = fitNaturalCubicSpline(
      Float64Array.from([1]),
      Float64Array.from([42]),
    );
    expect(single.at(100)).toBe(42);
  });
});
