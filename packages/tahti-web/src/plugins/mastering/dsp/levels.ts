/** Mid/side decomposition and RMS-based level matching — ports
 * `matchering/dsp.py`'s array helpers and
 * `matchering/stage_helpers/match_levels.py`. */

export type StereoSignal = { left: Float64Array; right: Float64Array };
export type PieceRange = { start: number; length: number };

export function lrToMs(stereo: StereoSignal): {
  mid: Float64Array;
  side: Float64Array;
} {
  const n = stereo.left.length;
  const mid = new Float64Array(n);
  const side = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const l = stereo.left[i];
    const r = stereo.right[i];
    mid[i] = (l + r) * 0.5;
    side[i] = (l - r) * 0.5;
  }
  return { mid, side };
}

export function msToLr(mid: Float64Array, side: Float64Array): StereoSignal {
  const n = mid.length;
  const left = new Float64Array(n);
  const right = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    left[i] = mid[i] + side[i];
    right[i] = mid[i] - side[i];
  }
  return { left, right };
}

export function rms(x: Float64Array | Float32Array): number {
  let sumSquares = 0;
  for (let i = 0; i < x.length; i++) {
    sumSquares += x[i] * x[i];
  }
  return Math.sqrt(sumSquares / x.length);
}

export function amplify(x: Float64Array, gain: number): Float64Array {
  const out = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) {
    out[i] = x[i] * gain;
  }
  return out;
}

export function clip(x: Float64Array, to = 1): Float64Array {
  const out = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) {
    out[i] = Math.min(to, Math.max(-to, x[i]));
  }
  return out;
}

/** Ports `matchering/dsp.py`'s `normalize`: scales `x` down so its peak
 * sits at `threshold`, unless it's already under threshold and
 * `normalizeClipped` is false (in which case it's left untouched). */
export function normalize(
  x: Float64Array,
  threshold: number,
  epsilon: number,
  normalizeClipped: boolean,
): { result: Float64Array; coefficient: number } {
  let maxValue = 0;
  for (let i = 0; i < x.length; i++) {
    maxValue = Math.max(maxValue, Math.abs(x[i]));
  }
  let coefficient = 1;
  if (maxValue < threshold || normalizeClipped) {
    coefficient = Math.max(epsilon, maxValue / threshold);
  }
  return { result: amplify(x, 1 / coefficient), coefficient };
}

/** Stereo-aware `normalize`: the peak is the max magnitude across both
 * channels, and both channels are scaled by the same coefficient —
 * mirrors calling matchering's `normalize` on the raw (L, R) array
 * directly (its `np.abs(array).max()` sees both channels at once). */
export function normalizeStereo(
  stereo: StereoSignal,
  threshold: number,
  epsilon: number,
  normalizeClipped: boolean,
): { result: StereoSignal; coefficient: number } {
  let maxValue = 0;
  for (let i = 0; i < stereo.left.length; i++) {
    maxValue = Math.max(
      maxValue,
      Math.abs(stereo.left[i]),
      Math.abs(stereo.right[i]),
    );
  }
  let coefficient = 1;
  if (maxValue < threshold || normalizeClipped) {
    coefficient = Math.max(epsilon, maxValue / threshold);
  }
  return {
    result: {
      left: amplify(stereo.left, 1 / coefficient),
      right: amplify(stereo.right, 1 / coefficient),
    },
    coefficient,
  };
}

/** Splits `totalLength` into as many equal pieces as fit under
 * `maxPieceSize`, dropping any remainder — ports
 * `__calculate_piece_sizes`/`unfold`. */
export function calculatePieceRanges(
  totalLength: number,
  maxPieceSize: number,
): PieceRange[] {
  const divisions = Math.floor(totalLength / maxPieceSize) + 1;
  const pieceSize = Math.floor(totalLength / divisions);
  const ranges: PieceRange[] = [];
  for (let i = 0; i < divisions; i++) {
    ranges.push({ start: i * pieceSize, length: pieceSize });
  }
  return ranges;
}

export function pieceRmses(
  x: Float64Array,
  ranges: PieceRange[],
): Float64Array {
  const out = new Float64Array(ranges.length);
  for (let i = 0; i < ranges.length; i++) {
    const { start, length } = ranges[i];
    out[i] = rms(x.subarray(start, start + length));
  }
  return out;
}

/** Ports `get_lpis_and_match_rms`: the pieces whose RMS meets or exceeds
 * the average, and the RMS of just those pieces. */
export function loudestPieces(
  pieceRms: Float64Array,
  averageRms: number,
): { indices: number[]; matchRms: number } {
  const indices: number[] = [];
  for (let i = 0; i < pieceRms.length; i++) {
    if (pieceRms[i] >= averageRms) {
      indices.push(i);
    }
  }
  const selected = Float64Array.from(indices, (i) => pieceRms[i]);
  return { indices, matchRms: rms(selected) };
}

export type LevelAnalysis = {
  mid: Float64Array;
  side: Float64Array;
  pieceRanges: PieceRange[];
  loudestMid: Float64Array[];
  loudestSide: Float64Array[];
  matchRms: number;
};

/** Ports `analyze_levels`. */
export function analyzeLevels(
  stereo: StereoSignal,
  maxPieceSize: number,
): LevelAnalysis {
  const { mid, side } = lrToMs(stereo);
  const pieceRanges = calculatePieceRanges(mid.length, maxPieceSize);
  const rmses = pieceRmses(mid, pieceRanges);
  let averageRms = 0;
  for (let i = 0; i < rmses.length; i++) {
    averageRms += rmses[i] * rmses[i];
  }
  averageRms = Math.sqrt(averageRms / rmses.length);

  const { indices, matchRms } = loudestPieces(rmses, averageRms);
  const loudestMid = indices.map((i) => {
    const { start, length } = pieceRanges[i];
    return mid.subarray(start, start + length);
  });
  const loudestSide = indices.map((i) => {
    const { start, length } = pieceRanges[i];
    return side.subarray(start, start + length);
  });

  return { mid, side, pieceRanges, loudestMid, loudestSide, matchRms };
}

export function rmsCoefficient(
  mainMatchRms: number,
  referenceMatchRms: number,
  epsilon: number,
): number {
  return referenceMatchRms / Math.max(epsilon, mainMatchRms);
}
