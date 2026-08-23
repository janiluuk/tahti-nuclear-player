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

const BAR_COUNT = 64;

/** The tahti waveform motif used as a scrubbable progress bar — bars keyed
 * by track id stay identical across renders (no real peak data available
 * outside the studio editor), with playback progress shown as a fill. */
export function WaveformSeekbar({
  trackId,
  progress,
  bars = BAR_COUNT,
  onSeek,
  className,
}: {
  trackId: string;
  /** Playback position, 0–1. */
  progress: number;
  bars?: number;
  onSeek?: (fraction: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const heights = barHeights(seedFromId(trackId), bars);
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
