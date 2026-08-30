import { describe, expect, it } from 'vitest';

import {
  designButterworthLowpass1,
  filtfiltOrder1,
  onePoleFilter,
} from './butterworth';

const SAMPLE_RATE = 1000;

describe('designButterworthLowpass1', () => {
  it('has unity gain at DC', () => {
    const filter = designButterworthLowpass1(50, SAMPLE_RATE);
    // H(z=1) = (b0+b1) / (1+a1)
    const dcGain = (filter.b0 + filter.b1) / (1 + filter.a1);
    expect(dcGain).toBeCloseTo(1, 8);
  });
});

describe('filtfiltOrder1', () => {
  it('leaves a constant (DC) signal unchanged, with no startup transient', () => {
    const filter = designButterworthLowpass1(50, SAMPLE_RATE);
    const x = new Float64Array(200).fill(3.5);
    const y = filtfiltOrder1(filter, x);
    for (const v of y) {
      expect(v).toBeCloseTo(3.5, 6);
    }
  });

  it('preserves a slow sine well below the cutoff, close to full amplitude', () => {
    const filter = designButterworthLowpass1(100, SAMPLE_RATE);
    const n = 2000;
    const freq = 2; // Hz, far below the 100Hz cutoff
    const x = Float64Array.from({ length: n }, (_, i) =>
      Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE),
    );
    const y = filtfiltOrder1(filter, x);
    const amplitude = Math.max(...Array.from(y).map(Math.abs));
    expect(amplitude).toBeGreaterThan(0.9);
  });

  it('attenuates a fast sine well above the cutoff', () => {
    const filter = designButterworthLowpass1(10, SAMPLE_RATE);
    const n = 2000;
    const freq = 300; // Hz, far above the 10Hz cutoff
    const x = Float64Array.from({ length: n }, (_, i) =>
      Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE),
    );
    const y = filtfiltOrder1(filter, x);
    // A slow filter (10Hz cutoff => ~16-sample time constant) needs several
    // time constants to settle from filtfilt's short (6-sample) edge
    // padding when the content is this much faster than the cutoff — check
    // steady state away from both edges, not the raw global max.
    const steadyState = y.slice(200, n - 200);
    const amplitude = Math.max(...Array.from(steadyState).map(Math.abs));
    expect(amplitude).toBeLessThan(0.3);
  });

  it('applies zero net phase shift — a symmetric peak stays where it is', () => {
    const filter = designButterworthLowpass1(20, SAMPLE_RATE);
    const n = 400;
    const center = 200;
    const x = Float64Array.from({ length: n }, (_, i) =>
      Math.exp(-((i - center) ** 2) / (2 * 5 ** 2)),
    );
    const y = filtfiltOrder1(filter, x);
    let peakIndex = 0;
    let peakValue = -Infinity;
    for (let i = 0; i < n; i++) {
      if (y[i] > peakValue) {
        peakValue = y[i];
        peakIndex = i;
      }
    }
    expect(peakIndex).toBeGreaterThanOrEqual(center - 2);
    expect(peakIndex).toBeLessThanOrEqual(center + 2);
  });

  it('one-pole attack filter also leaves a constant signal unchanged', () => {
    const filter = onePoleFilter(Math.exp(-2 / 44));
    const x = new Float64Array(100).fill(-1.2);
    const y = filtfiltOrder1(filter, x);
    for (const v of y) {
      expect(v).toBeCloseTo(-1.2, 6);
    }
  });

  it('handles arrays shorter than the default pad length without throwing', () => {
    const filter = designButterworthLowpass1(50, SAMPLE_RATE);
    const x = Float64Array.from([1, 2, 3]);
    const y = filtfiltOrder1(filter, x);
    expect(y.length).toBe(3);
    expect(Array.from(y).every((v) => Number.isFinite(v))).toBe(true);
  });
});
