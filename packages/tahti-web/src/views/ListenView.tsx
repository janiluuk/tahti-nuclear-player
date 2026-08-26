import { Link, useNavigate } from '@tanstack/react-router';
import { PlayIcon, RadioIcon } from 'lucide-react';
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
import {
  fetchDiscoverDiscoWidgets,
  fetchHomepageDiscoWidgets,
  type DiscoWidgetRenderItem,
} from '../api/disco-widgets';
import {
  isDirectoryArtistActive,
  type ChannelDirectoryItem,
  type OnAirChannel,
  type PublicChannel,
} from '../api/types';
import { DiscoWidgetsSection } from '../components/disco-widgets/DiscoWidgetsSection';
import { ListenerWidgetsSection } from '../components/ListenerWidgetsSection';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { useAuthStore } from '../stores/authStore';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

export function ListenView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChannelDirectoryItem[]>([]);
  const [onAir, setOnAir] = useState<OnAirChannel[]>([]);
  const [radio, setRadio] = useState<PublicChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [discoWidgets, setDiscoWidgets] = useState<DiscoWidgetRenderItem[]>([]);
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const toggleFavoriteChannel = useLibraryStore((s) => s.toggleFavoriteChannel);
  const favoriteChannels = useLibraryStore((s) => s.favoriteChannels);
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

  useEffect(() => {
    let cancelled = false;
    void fetchHomepageDiscoWidgets().then((home) => {
      if (cancelled) {
        return;
      }
      if (!signedIn) {
        setDiscoWidgets(home.data);
        return;
      }
      void fetchDiscoverDiscoWidgets().then((mine) => {
        if (cancelled) {
          return;
        }
        const seen = new Set(mine.data.map((w) => w.installId));
        setDiscoWidgets([
          ...mine.data,
          ...home.data.filter((w) => !seen.has(w.installId)),
        ]);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

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
    return items
      .filter((ch) => {
        if (activeOnly && !isDirectoryArtistActive(ch)) {
          return false;
        }
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
      })
      .sort((a, b) => {
        const aActive = isDirectoryArtistActive(a);
        const bActive = isDirectoryArtistActive(b);
        if (aActive !== bActive) {
          return aActive ? -1 : 1;
        }
        return a.displayName.localeCompare(b.displayName);
      });
  }, [items, query, genre, activeOnly]);

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

  return (
    <PageFrame>
      <PageHeader
        title="Listen"
        subtitle={
          signedIn
            ? 'Discover community artists — your library is one tab over.'
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

      <DiscoWidgetsSection widgets={discoWidgets} />

      <ListenerWidgetsSection />

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
                src={
                  channel.user.avatarUrl ?? placeholderArtworkUrl(channel.slug)
                }
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={activeOnly}
              onClick={() => setActiveOnly((prev) => !prev)}
              className={`inline-flex cursor-pointer items-center justify-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                activeOnly
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-foreground hover:bg-foreground/10 bg-transparent'
              }`}
            >
              Active now ({items.filter(isDirectoryArtistActive).length})
            </button>
            {genres.length > 0 && (
              <FilterChips
                items={chipItems}
                selected={genre}
                onChange={setGenre}
              />
            )}
          </div>

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
                        {isDirectoryArtistActive(ch) ? 'Active · ' : ''}
                        {ch.genres.slice(0, 2).join(', ') || `@${ch.username}`}
                      </span>
                    }
                    src={ch.avatarUrl ?? placeholderArtworkUrl(ch.username)}
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
