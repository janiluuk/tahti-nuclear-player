import { Link } from '@tanstack/react-router';
import {
  ArrowUpRightIcon,
  HeartIcon,
  ListPlusIcon,
  PauseIcon,
  PlayIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchTrackDetail } from '../api/client';
import type { PublicTrackDetail, TahtiPlayable } from '../api/types';
import { PageFrame } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { WaveformSeekbar } from '../components/tahti/WaveformSeekbar';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { formatDuration, providerLabel } from '../lib/playableToTrack';
import { useLibraryStore } from '../stores/libraryStore';
import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';
import { useTrackDetailStore } from '../stores/trackDetailStore';

function playableFromDetail(
  id: string,
  detail: PublicTrackDetail,
): TahtiPlayable {
  return {
    id: `archive:${id}`,
    kind: 'archive',
    title: detail.title,
    artist: detail.artistName,
    coverUrl: detail.bannerUrl ?? undefined,
    streamUrl: detail.audioUrl ?? '',
    protocol: detail.audioUrl?.includes('.m3u8') ? 'hls' : 'https',
    channelSlug: detail.channelSlug,
    durationSec: detail.durationSec ?? undefined,
  };
}

export function TrackDetailView({ id }: { id: string }) {
  const playableId = `archive:${id}`;
  const remembered = useTrackDetailStore((s) => s.cache[playableId]);
  const queueItem = usePlayerStore((s) =>
    s.queue.find((q) => q.id === playableId),
  );
  const fastPath =
    remembered ?? (queueItem ? playableFromQueueItem(queueItem) : null);

  const [detail, setDetail] = useState<PublicTrackDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchTrackDetail(id).then(({ data }) => {
      if (!cancelled) {
        setDetail(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  const playable = detail ? playableFromDetail(id, detail) : fastPath;

  if (!playable) {
    if (loading) {
      return (
        <PageFrame maxWidth="lg">
          <PageLoading label="Loading track…" />
        </PageFrame>
      );
    }
    return (
      <PageFrame maxWidth="lg">
        <PageEmpty
          title="Track unavailable"
          description="This track doesn't exist, isn't public, or was removed."
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
  const canPlay = Boolean(playable.streamUrl);

  return (
    <PageFrame maxWidth="lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="border-border bg-background-secondary flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
            <img
              src={playable.coverUrl ?? placeholderArtworkUrl(playable.id)}
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-center sm:text-left">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {playable.title}
            </h1>
            <p className="text-foreground-secondary text-sm">
              {playable.artist}
              {provider ? ` · ${provider}` : ''}
              {detail?.genre ? ` · ${detail.genre}` : ''}
              {playable.durationSec
                ? ` · ${formatDuration(playable.durationSec)}`
                : ''}
            </p>
            {detail?.description ? (
              <p className="text-foreground-secondary mt-1 max-w-md text-sm">
                {detail.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Button
                disabled={!canPlay}
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
                disabled={queued || !canPlay}
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
          peaks={detail?.peaks}
          onSeek={(fraction) => {
            if (!canPlay) {
              return;
            }
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
