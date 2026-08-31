import { cn, PlayerBar } from '@nuclearplayer/ui';

import { usePlayerStore } from '../stores/playerStore';

/** Isolated so `currentTime`'s ~4x/sec `timeupdate` ticks only re-render this
 * small subtree, not whatever player surface it's embedded in (NowPlaying,
 * volume, queue controls, visualizer, etc. -- none of which depend on
 * playback position). Shared by the compact player bar and the full-screen
 * overlay. */
export function ConnectedSeekBar({ className }: { className?: string }) {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const status = usePlayerStore((s) => s.status);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerBar.SeekBar
      className={className}
      progress={seekProgress}
      elapsedSeconds={currentTime}
      remainingSeconds={Math.max(0, duration - currentTime)}
      isLoading={status === 'loading'}
      onSeek={(percent) => {
        if (duration <= 0) {
          return;
        }
        seekTo((percent / 100) * duration);
      }}
    />
  );
}

/** Replaces the seek bar for a live stream, which has no duration/position
 * to show — occupies the same slot (so the layout doesn't jump when
 * switching between live and on-demand playback) but renders no track,
 * just a small translucent "Live" badge anchored to the left corner where
 * the seek bar's elapsed-time label would otherwise sit. */
export function PlayerLiveIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-6 w-full', className)}>
      <div className="border-accent-red/40 bg-accent-red/10 text-accent-red absolute top-1/2 left-0 flex -translate-y-1/2 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
        <span
          className="bg-accent-red size-1.5 rounded-full motion-safe:animate-pulse"
          aria-hidden
        />
        Live
      </div>
    </div>
  );
}
