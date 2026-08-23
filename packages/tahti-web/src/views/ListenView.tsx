import { Link, useNavigate } from '@tanstack/react-router';
import { LibraryIcon, PlayIcon, RadioIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardGrid,
  FilterChips,
  Input,
  SectionShell,
} from '@nuclearplayer/ui';

import {
  fetchArtistPlayables,
  fetchChannel,
  fetchDirectory,
  fetchOnAirChannels,
  fetchRadioStation,
  TAHTI_RADIO_SLUG,
} from '../api/client';
import type {
  ChannelDirectoryItem,
  OnAirChannel,
  PublicChannel,
} from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { Eyebrow } from '../components/tahti/Eyebrow';
import { useAuthStore } from '../stores/authStore';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

const LIBRARY_PREVIEW_CHANNELS = 8;
const LIBRARY_PREVIEW_TRACKS = 6;
const LIBRARY_PREVIEW_HISTORY = 5;

export function ListenView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChannelDirectoryItem[]>([]);
  const [onAir, setOnAir] = useState<OnAirChannel[]>([]);
  const [radio, setRadio] = useState<PublicChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const toggleFavoriteChannel = useLibraryStore((s) => s.toggleFavoriteChannel);
  const favoriteChannels = useLibraryStore((s) => s.favoriteChannels);
  const favoriteTracks = useLibraryStore((s) => s.favoriteTracks);
  const history = useLibraryStore((s) => s.history);
  const user = useAuthStore((s) => s.user);
  const signedIn = Boolean(user);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      fetchDirectory(),
      fetchOnAirChannels(),
      fetchRadioStation().catch(() => null),
    ]).then(([dir, channels, station]) => {
      if (cancelled) {
        return;
      }
      setItems(dir.data.items);
      setOnAir(
        [...channels.data.live, ...channels.data.replaying].filter(
          (channel) => channel.slug !== TAHTI_RADIO_SLUG,
        ),
      );
      setRadio(station?.data ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ch of items) {
      for (const g of ch.genres) {
        const key = g.trim();
        if (!key) {
          continue;
        }
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((ch) => {
      if (
        genre !== 'all' &&
        !ch.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      ) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        ch.displayName.toLowerCase().includes(q) ||
        ch.username.toLowerCase().includes(q) ||
        ch.genres.some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [items, query, genre]);

  const playNow = async (slug: string) => {
    const { playable } = await fetchChannel(slug);
    if (playable) {
      play(playable);
    }
  };

  const add = async (slug: string) => {
    const { playable } = await fetchChannel(slug);
    if (playable) {
      enqueue(playable);
    }
  };

  const playArtist = async (username: string) => {
    const { data } = await fetchArtistPlayables(username);
    const [first, ...rest] = data;
    if (first) {
      play(first, { enqueueRest: rest });
    }
  };

  const queueArtist = async (username: string) => {
    const { data } = await fetchArtistPlayables(username);
    for (const item of data) {
      enqueue(item);
    }
  };

  const chipItems = useMemo(
    () => [
      { id: 'all', label: `All (${items.length})` },
      ...genres.map((g) => ({ id: g.name, label: `${g.name} (${g.count})` })),
    ],
    [genres, items.length],
  );

  const radioLogo =
    radio?.user.avatarUrl ?? radio?.nowPlaying?.artworkUrl ?? null;
  const radioName = radio?.user.displayName ?? 'Tahti Radio';

  const libraryChannels = favoriteChannels.slice(0, LIBRARY_PREVIEW_CHANNELS);
  const libraryTracks = favoriteTracks.slice(0, LIBRARY_PREVIEW_TRACKS);
  const recentHistory = history.slice(0, LIBRARY_PREVIEW_HISTORY);
  const hasLibraryContent =
    libraryChannels.length > 0 ||
    libraryTracks.length > 0 ||
    recentHistory.length > 0;

  return (
    <PageFrame>
      <PageHeader
        title="Listen"
        subtitle={
          signedIn
            ? 'Your library up top — then discover community artists.'
            : 'Discover Tahti artists. Sign in to see your library here.'
        }
        actions={
          user?.channel ? (
            <Link to="/studio/go-live">
              <Button size="sm">Go Live</Button>
            </Link>
          ) : !signedIn ? (
            <Link to="/what-is-it">
              <Button size="sm" variant="secondary">
                What is tahti.live?
              </Button>
            </Link>
          ) : undefined
        }
      />

      {signedIn ? (
        <section className="mb-6 flex w-full flex-col gap-3">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold">My Library</h2>
            <Link to="/library">
              <Button
                size="icon-sm"
                variant="secondary"
                aria-label="Open My Library"
                title="Open My Library"
              >
                <LibraryIcon size={16} aria-hidden />
              </Button>
            </Link>
          </div>
          {!hasLibraryContent ? (
            <PageEmpty
              title="Nothing saved yet"
              description="Heart channels while browsing, or open Library for favorites, history, and messages."
              action={
                <Link to="/library">
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    aria-label="Open My Library"
                    title="Open My Library"
                  >
                    <LibraryIcon size={16} aria-hidden />
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-5">
              {libraryChannels.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3>
                      <Eyebrow>Favorite channels</Eyebrow>
                    </h3>
                    {favoriteChannels.length > LIBRARY_PREVIEW_CHANNELS ? (
                      <Link
                        to="/library/favorites"
                        className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                      >
                        +{favoriteChannels.length - LIBRARY_PREVIEW_CHANNELS}{' '}
                        more
                      </Link>
                    ) : null}
                  </div>
                  <CardGrid>
                    {libraryChannels.map((ch) => (
                      <Card
                        key={ch.slug}
                        title={
                          <Link
                            to="/channel/$slug"
                            params={{ slug: ch.slug }}
                            className="hover:underline"
                          >
                            {ch.displayName}
                          </Link>
                        }
                        subtitle={ch.slug}
                        src={ch.avatarUrl ?? undefined}
                        onPlay={() => void playNow(ch.slug)}
                        onQueue={() => void add(ch.slug)}
                        favorited
                        onFavorite={() => toggleFavoriteChannel(ch)}
                        onClick={() => {
                          void navigate({
                            to: '/channel/$slug',
                            params: { slug: ch.slug },
                          });
                        }}
                      />
                    ))}
                  </CardGrid>
                </div>
              ) : null}

              {libraryTracks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h3>
                    <Eyebrow>Favorite tracks</Eyebrow>
                  </h3>
                  <PlayableTrackTable
                    items={libraryTracks}
                    emptyMessage="No favorite tracks."
                  />
                </div>
              ) : null}

              {recentHistory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3>
                      <Eyebrow>Recently played</Eyebrow>
                    </h3>
                    <Link
                      to="/library/history"
                      className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                    >
                      Full history
                    </Link>
                  </div>
                  <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
                    {recentHistory.map((entry) => (
                      <li
                        key={`${entry.playable.id}-${entry.playedAt}`}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {entry.playable.title}
                          </div>
                          <div className="text-foreground-secondary truncate text-xs">
                            {entry.playable.artist ?? 'Unknown'}
                          </div>
                        </div>
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          onClick={() => play(entry.playable)}
                          aria-label={`Play ${entry.playable.title}`}
                          title={`Play ${entry.playable.title}`}
                        >
                          <PlayIcon size={16} aria-hidden />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}

      {radio ? (
        <Box
          variant="secondary"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-bold tracking-tight">
              {radioLogo ? (
                <img
                  src={radioLogo}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <RadioIcon size={20} className="text-foreground-secondary" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-tight">
                {radioName}
              </div>
              <p className="text-foreground-secondary text-xs">
                {radio.hlsUrl
                  ? (radio.nowPlaying?.title ?? '24/7 community stream')
                  : 'Temporarily offline'}
                {radio.nowPlaying?.artistName
                  ? ` · ${radio.nowPlaying.artistName}`
                  : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="icon-sm"
              disabled={!radio.hlsUrl}
              title="Play Radio"
              aria-label="Play Radio"
              onClick={() => {
                void fetchRadioStation().then(({ playable }) => {
                  if (playable) {
                    play(playable);
                  }
                });
              }}
            >
              <PlayIcon size={16} className="fill-current" />
            </Button>
            <Link to="/radio">
              <Button size="sm" variant="secondary">
                Open radio
              </Button>
            </Link>
          </div>
        </Box>
      ) : null}

      {onAir.length > 0 ? (
        <SectionShell title="On air">
          <CardGrid>
            {onAir.map((channel) => (
              <Card
                key={channel.slug}
                title={
                  <Link
                    to="/channel/$slug"
                    params={{ slug: channel.slug }}
                    className="hover:underline"
                  >
                    {channel.user.displayName}
                  </Link>
                }
                subtitle={
                  <span className="font-semibold">
                    {channel.state === 'LIVE' ? 'Live now' : 'Replay'}
                  </span>
                }
                src={channel.user.avatarUrl ?? undefined}
                onPlay={() => void playNow(channel.slug)}
                onQueue={() => void add(channel.slug)}
                onClick={() => {
                  void navigate({
                    to: '/channel/$slug',
                    params: { slug: channel.slug },
                  });
                }}
              />
            ))}
          </CardGrid>
        </SectionShell>
      ) : null}

      <SectionShell title={signedIn ? 'Discover artists' : 'Artists'}>
        <div className="flex flex-col gap-4">
          <Input
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artist name, username, genre…"
            className="max-w-md"
          />

          {genres.length > 0 && (
            <FilterChips
              items={chipItems}
              selected={genre}
              onChange={setGenre}
            />
          )}

          <p className="text-foreground-secondary text-xs">
            Showing {filtered.length} of {items.length} artists
          </p>

          {loading ? (
            <PageLoading label="Loading artists…" />
          ) : filtered.length === 0 ? (
            <PageEmpty
              title="No artists match"
              description={`${query ? `“${query}”` : 'Try another filter'}${genre !== 'all' ? ` in ${genre}` : ''}.`}
            />
          ) : (
            <CardGrid>
              {filtered.map((ch) => {
                const favorited =
                  signedIn && favoriteChannels.some((c) => c.slug === ch.slug);
                return (
                  <Card
                    key={ch.slug}
                    title={
                      <Link
                        to="/u/$username"
                        params={{ username: ch.username }}
                        className="hover:underline"
                      >
                        {ch.displayName}
                      </Link>
                    }
                    subtitle={
                      <span className="font-mono">
                        {ch.genres.slice(0, 2).join(', ') || `@${ch.username}`}
                      </span>
                    }
                    src={ch.avatarUrl ?? undefined}
                    onPlay={() => void playArtist(ch.username)}
                    onQueue={() => void queueArtist(ch.username)}
                    onFavorite={
                      signedIn
                        ? () =>
                            toggleFavoriteChannel({
                              slug: ch.slug,
                              displayName: ch.displayName,
                              avatarUrl: ch.avatarUrl,
                            })
                        : undefined
                    }
                    favorited={favorited}
                    onClick={() => {
                      void navigate({
                        to: '/u/$username',
                        params: { username: ch.username },
                      });
                    }}
                  />
                );
              })}
            </CardGrid>
          )}
        </div>
      </SectionShell>
    </PageFrame>
  );
}
