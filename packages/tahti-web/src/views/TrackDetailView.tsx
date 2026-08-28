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

import {
  fetchChannel,
  fetchTrackComments,
  fetchTrackDetail,
  postTrackComment,
} from '../api/client';
import type {
  PublicChannel,
  PublicTrackDetail,
  TahtiPlayable,
  TrackComment,
} from '../api/types';
import { ChannelVisualizer } from '../components/ChannelVisualizer';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { WaveformSeekbar } from '../components/tahti/WaveformSeekbar';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { formatDuration, providerLabel } from '../lib/playableToTrack';
import { useDominantColor } from '../lib/useDominantColor';
import { useAuthStore } from '../stores/authStore';
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
  const user = useAuthStore((s) => s.user);
  const playableId = `archive:${id}`;
  const remembered = useTrackDetailStore((s) => s.cache[playableId]);
  const queueItem = usePlayerStore((s) =>
    s.queue.find((q) => q.id === playableId),
  );
  const fastPath =
    remembered ?? (queueItem ? playableFromQueueItem(queueItem) : null);

  const [detail, setDetail] = useState<PublicTrackDetail | null>(null);
  const [channel, setChannel] = useState<PublicChannel | null>(null);
  const [comments, setComments] = useState<TrackComment[]>([]);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchTrackDetail(id).then(({ data }) => {
      if (!cancelled) {
        setDetail(data);
        setLoading(false);
        if (data) {
          void fetchChannel(data.channelSlug).then((result) =>
            setChannel(result.data),
          );
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    void fetchTrackComments(id).then((result) => {
      if (!cancelled) {
        setComments(result.data.comments);
        setCommentsEnabled(result.data.commentsEnabled);
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
  const rgb = useDominantColor(playable?.coverUrl);

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
  const hasBackgroundOverride = Boolean(channel?.colorScheme?.background);
  const bgStyle = hasBackgroundOverride
    ? { backgroundColor: channel?.colorScheme?.background }
    : rgb
      ? {
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.28), transparent 70%)`,
        }
      : undefined;
  const visualScheme = channel?.colorScheme
    ? {
        accent: channel.colorScheme.accent,
        highlight: channel.colorScheme.highlight,
        bg: channel.colorScheme.background,
        text: channel.colorScheme.foreground,
        muted: channel.colorScheme.muted,
      }
    : undefined;

  const submitComment = async () => {
    const body = commentBody.trim();
    if (!body || !commentsEnabled || !user) {
      return;
    }
    setCommentBusy(true);
    setCommentError(null);
    const result = await postTrackComment(id, body);
    setCommentBusy(false);
    if (!result.ok) {
      setCommentError(result.error);
      return;
    }
    setComments((current) => [...current, result.data]);
    setCommentBody('');
  };

  return (
    <div className="relative min-h-full overflow-hidden" style={bgStyle}>
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <ChannelVisualizer
          preset={channel?.visualPreset}
          colorScheme={visualScheme}
          colorSchemeJson={channel?.colorSchemeJson}
          artworkUrl={playable.coverUrl}
          className="size-full"
        />
      </div>
      <PageFrame maxWidth="lg" className="relative z-10 py-8">
        <div className="flex flex-col gap-8">
          <div className="border-border bg-background/70 flex flex-col items-center gap-6 rounded-2xl border p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="border-border bg-background-secondary aspect-square w-full max-w-md shrink-0 overflow-hidden rounded-xl border shadow-2xl">
              <img
                src={playable.coverUrl ?? placeholderArtworkUrl(playable.id)}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="flex w-full min-w-0 flex-col items-center gap-1 text-center">
              <PageHeader
                title={playable.title}
                subtitle={
                  <>
                    <span>
                      {detail?.channel.username ? (
                        <Link
                          to="/u/$username"
                          params={{ username: detail.channel.username }}
                          className="hover:text-foreground underline-offset-2 hover:underline"
                        >
                          {playable.artist}
                        </Link>
                      ) : (
                        playable.artist
                      )}
                      {provider ? ` · ${provider}` : ''}
                      {detail?.genre ? ` · ${detail.genre}` : ''}
                      {playable.durationSec
                        ? ` · ${formatDuration(playable.durationSec)}`
                        : ''}
                    </span>
                    {detail?.channel.bio ? (
                      <span className="mt-1 block max-w-md">
                        {detail.channel.bio}
                      </span>
                    ) : null}
                    {detail?.description ? (
                      <span className="mt-1 block max-w-md">
                        {detail.description}
                      </span>
                    ) : null}
                  </>
                }
              />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
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

          <div className="border-border bg-background/70 rounded-2xl border p-5 shadow-xl backdrop-blur-md">
            <WaveformSeekbar
              trackId={playable.id}
              progress={progress}
              peaks={detail?.peaks}
              className="h-28"
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
            <div className="text-foreground-secondary mt-2 flex justify-between text-xs tabular-nums">
              <span>{isCurrent ? formatDuration(currentTime) : '0:00'}</span>
              <span>
                {formatDuration(duration || playable.durationSec || 0)}
              </span>
            </div>
          </div>
          <section
            className="border-border bg-background/80 rounded-2xl border p-5 shadow-xl backdrop-blur-md"
            aria-labelledby="track-comments-heading"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="track-comments-heading"
                className="font-heading text-lg font-bold"
              >
                Comments
              </h2>
              <span className="text-foreground-secondary text-xs">
                {comments.length}{' '}
                {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </div>
            {comments.length > 0 ? (
              <ul className="border-border divide-border mb-5 divide-y border-y">
                {comments.map((comment) => (
                  <li key={comment.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold">
                        {comment.authorDisplayName}
                      </span>
                      <time
                        className="text-foreground-secondary text-xs"
                        dateTime={comment.createdAt}
                      >
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-foreground-secondary mt-1 text-sm">
                      {comment.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-foreground-secondary mb-5 text-sm">
                No comments yet.
              </p>
            )}
            {!commentsEnabled ? (
              <p className="text-foreground-secondary text-sm">
                Comments are off for this track.
              </p>
            ) : user ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Add a comment…"
                  maxLength={2000}
                  rows={3}
                  disabled={commentBusy}
                  className="border-border bg-background text-foreground placeholder:text-foreground-secondary focus:border-primary resize-y rounded-md border px-3 py-2 text-sm outline-none"
                />
                <div className="flex items-center justify-between gap-3">
                  {commentError ? (
                    <p className="text-accent-red text-xs">{commentError}</p>
                  ) : (
                    <span />
                  )}
                  <Button
                    size="sm"
                    disabled={commentBusy || !commentBody.trim()}
                    onClick={() => void submitComment()}
                  >
                    {commentBusy ? 'Posting…' : 'Post comment'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground-secondary text-sm">
                Log in to comment.
              </p>
            )}
          </section>
        </div>
      </PageFrame>
    </div>
  );
}
