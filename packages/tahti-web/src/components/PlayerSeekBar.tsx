import { PlayerBar } from '@nuclearplayer/ui';

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
