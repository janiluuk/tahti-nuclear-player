import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, MediaArtwork, SectionShell } from '@nuclearplayer/ui';

import { fetchArtistPlayables, fetchFeed } from '../api/client';
import type { FeedItem, TahtiPlayable } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { TrackInfoDialog, type TrackInfo } from '../components/TrackInfoDialog';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';

function formatFeedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

function feedBadge(item: FeedItem): string {
  if (item.kind === 'post') {
    return 'posted';
  }
  if (item.kind === 'track') {
    return 'shared a track';
  }
  return `released a ${item.releaseType.replace(/_/g, ' ').toLowerCase()}`;
}

function ArtistAvatar({ name, src }: { name: string; src: string | null }) {
  return (
    <div className="bg-surface-secondary flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold">
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

function FeedItemHeader({ item }: { item: FeedItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link to="/u/$username" params={{ username: item.artist.username }}>
        <ArtistAvatar
          name={item.artist.displayName}
          src={item.artist.avatarUrl}
        />
      </Link>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
        <Link
          to="/u/$username"
          params={{ username: item.artist.username }}
          className="font-medium underline-offset-2 hover:underline"
        >
          {item.artist.displayName}
        </Link>
        <span className="text-foreground-secondary text-xs">
          {feedBadge(item)}
        </span>
        <span className="text-foreground-secondary text-xs">
          {formatFeedDate(item.date)}
        </span>
      </div>
    </div>
  );
}

export function FeedView({ embedded = false }: { embedded?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [infoTrack, setInfoTrack] = useState<TrackInfo | null>(null);
  const [feedPlayables, setFeedPlayables] = useState<
    Record<string, TahtiPlayable>
  >({});
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const queue = usePlayerStore((s) => s.queue);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchFeed().then((res) => {
      setItems(res.data.items);
      setFollowingCount(res.data.followingCount);
      setLoading(false);
      const tracks = res.data.items.filter(
        (item): item is Extract<FeedItem, { kind: 'track' }> =>
          item.kind === 'track' && !item.audioUrl,
      );
      void Promise.all(
        tracks.map(async (item) => {
          const result = await fetchArtistPlayables(item.artist.username);
          const playable =
            result.data.find(
              (candidate) => candidate.id === `archive:${item.id}`,
            ) ??
            result.data.find((candidate) => candidate.title === item.title);
          return playable ? ([item.id, playable] as const) : null;
        }),
      ).then((resolved) => {
        setFeedPlayables(
          Object.fromEntries(
            resolved.filter(
              (entry): entry is readonly [string, TahtiPlayable] =>
                entry !== null,
            ),
          ),
        );
      });
    });
  }, [user]);

  if (!hydrated || (user && loading)) {
    return (
      <PageFrame maxWidth="3xl">
        <PageLoading label="Loading your feed…" />
      </PageFrame>
    );
  }

  if (!user) {
    return (
      <PageFrame maxWidth="3xl">
        <PageHeader
          title="Your feed"
          subtitle="New posts, tracks, and releases from artists you follow."
        />
        <PageEmpty
          icon="inbox"
          title="Sign in to see your feed"
          description="Follow artists to build a personal timeline of what they share."
          action={
            <Button onClick={() => useAuthModalStore.getState().open('login')}>
              Log in
            </Button>
          }
        />
      </PageFrame>
    );
  }

  const content = (
    <>
      {!embedded && (
        <PageHeader
          title="Your feed"
          subtitle={`New posts, tracks, and releases from the ${followingCount} artist${followingCount === 1 ? '' : 's'} you follow.`}
        />
      )}

      {items.length === 0 ? (
        <PageEmpty
          icon="inbox"
          title={
            followingCount === 0
              ? "You're not following any artists yet"
              : 'All quiet here'
          }
          description={
            followingCount === 0
              ? 'Discover artists on Listen, then follow them to fill this feed.'
              : 'New posts, tracks, and releases from artists you follow will show up here.'
          }
          action={
            <Link to="/">
              <Button size="sm" variant="secondary">
                Discover artists
              </Button>
            </Link>
          }
        />
      ) : (
        <ul className="flex gap-3 overflow-x-auto pb-2">
          {items.map((item) => (
            <li
              key={`${item.kind}-${item.id}`}
              className="border-border bg-background-secondary flex w-[min(24rem,calc(100vw-3rem))] shrink-0 flex-col gap-3 rounded-lg border p-4"
            >
              {item.kind !== 'track' && <FeedItemHeader item={item} />}

              <div className="min-w-0 flex-1">
                {item.kind === 'post' && (
                  <Link
                    to="/u/$username"
                    params={{ username: item.artist.username }}
                    className="hover:bg-background mt-2 block rounded-md text-left"
                  >
                    {item.title && (
                      <div className="text-sm font-medium">{item.title}</div>
                    )}
                    <p className="text-foreground-secondary mt-0.5 text-sm">
                      {item.body}
                    </p>
                  </Link>
                )}

                {item.kind === 'track' &&
                  (() => {
                    const playable: TahtiPlayable | null = item.audioUrl
                      ? {
                          id: `archive:${item.id}`,
                          kind: 'archive',
                          title: item.title,
                          artist: item.artist.displayName,
                          coverUrl: item.bannerUrl ?? undefined,
                          streamUrl: item.audioUrl,
                          protocol: 'https',
                          channelSlug: item.channelSlug,
                        }
                      : (feedPlayables[item.id] ?? null);
                    return (
                      <div className="flex flex-col gap-3">
                        <div className="relative aspect-square w-full overflow-hidden rounded-md">
                          <MediaArtwork
                            size="fill"
                            src={item.bannerUrl}
                            alt={item.title}
                            placeholder={
                              <span className="text-lg font-bold">
                                {item.title.slice(0, 2).toUpperCase()}
                              </span>
                            }
                            onArtworkClick={() =>
                              setInfoTrack({
                                title: item.title,
                                artistName: item.artist.displayName,
                                artistUsername: item.artist.username,
                                artworkUrl: item.bannerUrl,
                                meta: formatFeedDate(item.date),
                                playable,
                              })
                            }
                            onPlay={playable ? () => play(playable) : undefined}
                            playDisabled={!playable}
                            playLabel={`Play ${item.title}`}
                            onQueue={
                              playable ? () => enqueue(playable) : undefined
                            }
                            queueDisabled={!playable}
                            queueLabel={`Queue ${item.title}`}
                            queueActive={Boolean(
                              playable &&
                              queue.some(
                                (queueItem) => queueItem.id === playable.id,
                              ),
                            )}
                          />
                          <div
                            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 pt-6"
                            aria-hidden
                          />
                          <span className="pointer-events-none absolute right-2 bottom-2 left-2 truncate text-sm font-semibold text-white">
                            {item.title}
                          </span>
                        </div>
                        <FeedItemHeader item={item} />
                      </div>
                    );
                  })()}

                {item.kind === 'release' &&
                  (item.smartLinkSlug ? (
                    <Link
                      to="/r/$slug"
                      params={{ slug: item.smartLinkSlug }}
                      className="mt-2 flex items-center gap-3"
                    >
                      <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
                        {item.artworkUrl ? (
                          <img
                            src={item.artworkUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          item.title.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium underline-offset-2 hover:underline">
                        {item.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
                        {item.artworkUrl ? (
                          <img
                            src={item.artworkUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          item.title.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <Link
                        to="/u/$username"
                        params={{ username: item.artist.username }}
                        className="text-sm font-medium underline-offset-2 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </div>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <TrackInfoDialog
        isOpen={Boolean(infoTrack)}
        onClose={() => setInfoTrack(null)}
        track={infoTrack}
      />
    </>
  );

  return embedded ? (
    <SectionShell title="Your feed">{content}</SectionShell>
  ) : (
    <PageFrame maxWidth="3xl">{content}</PageFrame>
  );
}
