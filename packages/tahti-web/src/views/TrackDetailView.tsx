import { Link } from '@tanstack/react-router';
import {
  ArrowUpRightIcon,
  HeartIcon,
  ListPlusIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
} from 'lucide-react';

import { Button } from '@nuclearplayer/ui';

import { PageFrame } from '../components/PageHeader';
import { PageEmpty } from '../components/PageStates';
import { WaveformSeekbar } from '../components/tahti/WaveformSeekbar';
import { formatDuration, providerLabel } from '../lib/playableToTrack';
import { useLibraryStore } from '../stores/libraryStore';
import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';
import { useTrackDetailStore } from '../stores/trackDetailStore';

export function TrackDetailView({ id }: { id: string }) {
  const playableId = `archive:${id}`;
  const remembered = useTrackDetailStore((s) => s.cache[playableId]);
  const queueItem = usePlayerStore((s) =>
    s.queue.find((q) => q.id === playableId),
  );
  const playable =
    remembered ?? (queueItem ? playableFromQueueItem(queueItem) : null);

  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const currentId = usePlayerStore((s) => s.currentId);
  const status = usePlayerStore((s) => s.status);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const queue = usePlayerStore((s) => s.queue);
  const toggleFavoriteTrack = useLibraryStore((s) => s.toggleFavoriteTrack);
  const favoriteTracks = useLibraryStore((s) => s.favoriteTracks);

  if (!playable) {
    return (
      <PageFrame maxWidth="lg">
        <PageEmpty
          title="Track unavailable"
          description="This track's details aren't loaded — open it again from where you found it."
          action={
            <Link to="/">
              <Button size="sm" variant="secondary">
                Back to Listen
              </Button>
            </Link>
          }
        />
      </PageFrame>
    );
  }

  const isCurrent = currentId === playableId;
  const isPlaying = isCurrent && (status === 'playing' || status === 'loading');
  const progress = isCurrent && duration > 0 ? currentTime / duration : 0;
  const favorited = favoriteTracks.some((t) => t.id === playable.id);
  const queued = queue.some((q) => q.id === playable.id);
  const provider = providerLabel(playable.sourceProvider);

  return (
    <PageFrame maxWidth="lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="border-border bg-background-secondary flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
            {playable.coverUrl ? (
              <img
                src={playable.coverUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <MusicIcon
                size={40}
                aria-hidden
                className="text-foreground-secondary"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-center sm:text-left">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {playable.title}
            </h1>
            <p className="text-foreground-secondary text-sm">
              {playable.artist}
              {provider ? ` · ${provider}` : ''}
              {playable.durationSec
                ? ` · ${formatDuration(playable.durationSec)}`
                : ''}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Button
                onClick={() => {
                  if (isCurrent) {
                    setStatus(isPlaying ? 'paused' : 'playing');
                  } else {
                    play(playable);
                  }
                }}
              >
                {isPlaying ? (
                  <PauseIcon size={16} aria-hidden className="mr-1.5" />
                ) : (
                  <PlayIcon size={16} aria-hidden className="mr-1.5" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                size="icon-sm"
                variant="secondary"
                disabled={queued}
                aria-label={queued ? 'In queue' : 'Add to queue'}
                title={queued ? 'In queue' : 'Add to queue'}
                onClick={() => enqueue(playable)}
              >
                <ListPlusIcon size={16} aria-hidden />
              </Button>
              <Button
                size="icon-sm"
                variant="secondary"
                aria-label={favorited ? 'Remove from favorites' : 'Favorite'}
                title={favorited ? 'Remove from favorites' : 'Favorite'}
                onClick={() => toggleFavoriteTrack(playable)}
              >
                <HeartIcon
                  size={16}
                  aria-hidden
                  className={
                    favorited ? 'text-accent-red fill-current' : undefined
                  }
                />
              </Button>
              {playable.channelSlug && (
                <Link
                  to="/channel/$slug"
                  params={{ slug: playable.channelSlug }}
                >
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    aria-label="Open channel"
                    title="Open channel"
                  >
                    <ArrowUpRightIcon size={16} aria-hidden />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <WaveformSeekbar
          trackId={playable.id}
          progress={progress}
          onSeek={(fraction) => {
            if (!isCurrent) {
              play(playable);
              return;
            }
            if (duration > 0) {
              seekTo(fraction * duration);
            }
          }}
        />
        {isCurrent && duration > 0 ? (
          <p className="text-foreground-secondary -mt-2 text-xs tabular-nums">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </p>
        ) : null}
      </div>
    </PageFrame>
  );
}
