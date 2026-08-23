import { useRef } from 'react';

import { cn } from '../../lib/cn';

/** Deterministic pseudo-random bar heights keyed by `seed` — same sequence
 * as the ambient `Waveform` motif, so a track's bar shape is stable across
 * renders without needing real decoded peak data. */
function barHeights(seed: number, bars: number): number[] {
  return Array.from({ length: bars }, (_, i) => {
    const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const frac = v - Math.floor(v);
    return 20 + frac * 80;
  });
}

function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100_000;
  }
  return hash / 100_000 || 1;
}

/** Downsample real peak buckets to the bar count, averaging each bar's span. */
function resamplePeaks(peaks: number[], bars: number): number[] {
  if (peaks.length === bars) {
    return peaks;
  }
  return Array.from({ length: bars }, (_, i) => {
    const start = Math.floor((i / bars) * peaks.length);
    const end = Math.max(
      start + 1,
      Math.floor(((i + 1) / bars) * peaks.length),
    );
    let sum = 0;
    let count = 0;
    for (let j = start; j < end && j < peaks.length; j++) {
      sum += peaks[j]!;
      count++;
    }
    return count > 0 ? sum / count : 0;
  });
}

function heightsFromPeaks(peaks: number[]): number[] {
  const max = Math.max(1, ...peaks);
  return peaks.map((p) => Math.max(6, (p / max) * 100));
}

const BAR_COUNT = 64;

/** The tahti waveform motif used as a scrubbable progress bar. Draws real
 * decoded amplitude buckets when `peaks` is given; otherwise falls back to
 * deterministic bars keyed by track id, stable across renders. */
export function WaveformSeekbar({
  trackId,
  progress,
  peaks,
  bars = BAR_COUNT,
  onSeek,
  className,
}: {
  trackId: string;
  /** Playback position, 0–1. */
  progress: number;
  /** Real [0..255] amplitude buckets, when decoded — null/omitted falls back
   * to the synthetic per-track bars. */
  peaks?: number[] | null;
  bars?: number;
  onSeek?: (fraction: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const heights =
    peaks && peaks.length > 0
      ? heightsFromPeaks(resamplePeaks(peaks, bars))
      : barHeights(seedFromId(trackId), bars);
  const clamped = Math.min(1, Math.max(0, progress));
  const filledCount = Math.round(clamped * bars);

  const seekAt = (clientX: number) => {
    if (!onSeek || !ref.current) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const fraction = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width),
    );
    onSeek(fraction);
  };

  return (
    <div
      ref={ref}
      role={onSeek ? 'slider' : undefined}
      aria-label={onSeek ? 'Seek' : undefined}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 100 : undefined}
      aria-valuenow={onSeek ? Math.round(clamped * 100) : undefined}
      className={cn(
        'flex h-20 items-end gap-[2px]',
        onSeek && 'cursor-pointer',
        className,
      )}
      onClick={onSeek ? (e) => seekAt(e.clientX) : undefined}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn(
            'flex-1 origin-bottom rounded-full transition-colors',
            i < filledCount ? 'bg-primary' : 'bg-foreground-secondary/25',
          )}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
