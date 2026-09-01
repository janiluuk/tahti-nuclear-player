import { Link } from '@tanstack/react-router';
import {
  ChevronDownIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, FilterChips, Popover, Select } from '@nuclearplayer/ui';

import { fetchDirectory, fetchTrackDetail } from '../api/client';
import {
  fetchArtistOfTheWeek,
  fetchLatestTracks,
  fetchLovedTracks,
  fetchNewToYou,
  fetchPublicCollections,
  fetchRandomArtist,
  fetchTopTracks,
} from '../api/discover';
import type { DiscoverArtistOfWeek } from '../api/discover';
import {
  isDirectoryArtistActive,
  type ChannelDirectoryItem,
  type DiscoverCollection,
  type DiscoverTrackItem,
  type TahtiPlayable,
} from '../api/types';
import { WidgetCard } from '../components/discover/WidgetCard';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { Eyebrow } from '../components/tahti/Eyebrow';
import { WaveformSeekbar } from '../components/tahti/WaveformSeekbar';
import { hasAccountRole } from '../lib/accountRoles';
import { PRESET_GENRES } from '../lib/genres';
import { useAuthStore } from '../stores/authStore';
import {
  ALL_WIDGET_IDS,
  useDiscoverStore,
  type DiscoverWidgetId,
} from '../stores/discoverStore';
import { usePlayerStore } from '../stores/playerStore';

const ALL_FILTER_ID = '__all__';

const CONTENT_TYPE_OPTIONS = [
  { id: 'LIVE', label: 'Live broadcast' },
  { id: 'STUDIO', label: 'Track' },
  { id: 'DJ_MIX', label: 'DJ Set' },
  { id: 'PODCAST', label: 'Podcast' },
  { id: 'ORIGINAL', label: 'Original' },
  { id: 'REMIX', label: 'Remix' },
  { id: 'RADIO_SHOW', label: 'Radio show' },
];

const WIDGET_LABELS: Record<DiscoverWidgetId, string> = {
  'this-week-most-played': 'This week: most played',
  'this-week-least-played': 'This week: least played',
  'new-to-you': 'New to you',
  'latest-tracks': 'Latest tracks',
  'most-played': 'Most played',
  loved: 'Loved by the community',
  'artist-of-the-week': 'Random artist of the week',
  'random-artist': 'Random artist pick',
  'public-playlists': 'Public playlists',
};

const TOP_LIST_WIDGET_IDS = new Set<DiscoverWidgetId>([
  'this-week-most-played',
  'this-week-least-played',
  'most-played',
]);

type WidgetData = {
  loading: boolean;
  items: DiscoverTrackItem[];
  collections?: DiscoverCollection[];
  subtitle?: string;
  artist?: DiscoverArtistOfWeek;
};

type DiscoverSelection = {
  item: DiscoverTrackItem;
  playable: TahtiPlayable;
};

type DiscoverTab = 'discover' | 'artists';

export function DiscoverView() {
  const enabledWidgets = useDiscoverStore((s) => s.enabledWidgets);
  const genreFilter = useDiscoverStore((s) => s.genreFilter);
  const contentTypeFilter = useDiscoverStore((s) => s.contentTypeFilter);
  const unheardOnly = useDiscoverStore((s) => s.unheardOnly);
  const addWidget = useDiscoverStore((s) => s.addWidget);
  const removeWidget = useDiscoverStore((s) => s.removeWidget);
  const moveWidget = useDiscoverStore((s) => s.moveWidget);
  const setGenreFilter = useDiscoverStore((s) => s.setGenreFilter);
  const setContentTypeFilter = useDiscoverStore((s) => s.setContentTypeFilter);
  const setUnheardOnly = useDiscoverStore((s) => s.setUnheardOnly);
  const randomArtistRotationDays = useDiscoverStore(
    (s) => s.randomArtistRotationDays,
  );
  const setRandomArtistRotationDays = useDiscoverStore(
    (s) => s.setRandomArtistRotationDays,
  );
  const play = usePlayerStore((state) => state.play);
  const user = useAuthStore((state) => state.user);
  const isAdmin = hasAccountRole(user, 'BOARD');
  const [data, setData] = useState<Record<string, WidgetData>>({});
  const [unheardIds, setUnheardIds] = useState<Set<string> | null>(null);
  const [genresOpen, setGenresOpen] = useState(false);
  const [contentTypesOpen, setContentTypesOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<DiscoverSelection | null>(
    null,
  );
  const [artists, setArtists] = useState<ChannelDirectoryItem[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DiscoverTab>('discover');

  const filters = useMemo(
    () => ({ genres: genreFilter, contentTypes: contentTypeFilter }),
    [genreFilter, contentTypeFilter],
  );

  useEffect(() => {
    let cancelled = false;
    setArtistsLoading(true);
    void fetchDirectory().then((result) => {
      if (!cancelled) {
        setArtists(
          result.data.items.filter((artist) => artist.slug !== 'tahti-radio'),
        );
        setArtistsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [contentTypeFilter, genreFilter, randomArtistRotationDays, unheardOnly]);

  const filteredArtists = useMemo(() => {
    if (genreFilter.length === 0) {
      return artists;
    }
    const selectedGenres = new Set(
      genreFilter.map((genre) => genre.toLowerCase()),
    );
    return artists.filter((artist) =>
      artist.genres.some((genre) => selectedGenres.has(genre.toLowerCase())),
    );
  }, [artists, genreFilter]);

  useEffect(() => {
    if (!unheardOnly) {
      setUnheardIds(null);
      return;
    }
    setUnheardIds(new Set());
    let cancelled = false;
    void fetchNewToYou().then((result) => {
      if (!cancelled) {
        setUnheardIds(new Set(result.data.map((track) => track.id)));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [unheardOnly]);

  useEffect(() => {
    let cancelled = false;

    for (const id of enabledWidgets) {
      setData((prev) => ({
        ...prev,
        [id]: { loading: true, items: prev[id]?.items ?? [] },
      }));

      const load = async (): Promise<WidgetData> => {
        switch (id) {
          case 'artist-of-the-week': {
            const { data: artist } = await fetchArtistOfTheWeek();
            return { loading: false, items: [], artist: artist ?? undefined };
          }
          case 'random-artist': {
            const { data: artist } = await fetchRandomArtist(
              randomArtistRotationDays,
            );
            return { loading: false, items: [], artist: artist ?? undefined };
          }
          case 'this-week-most-played': {
            const { data: items } = await fetchTopTracks(
              'week',
              'desc',
              filters,
            );
            return { loading: false, items };
          }
          case 'this-week-least-played': {
            const { data: items } = await fetchTopTracks(
              'week',
              'asc',
              filters,
            );
            return { loading: false, items };
          }
          case 'most-played': {
            const { data: items } = await fetchTopTracks(
              'all_time',
              'desc',
              filters,
            );
            return { loading: false, items };
          }
          case 'latest-tracks': {
            const { data: items } = await fetchLatestTracks(filters);
            return { loading: false, items };
          }
          case 'new-to-you': {
            const res = await fetchNewToYou();
            return {
              loading: false,
              items: res.data,
              subtitle: res.authenticated
                ? res.preferenceGenres.length > 0
                  ? `Based on ${res.preferenceGenres.join(', ')}`
                  : undefined
                : 'Sign in for picks based on your taste',
            };
          }
          case 'loved': {
            const { data: items } = await fetchLovedTracks(filters);
            return { loading: false, items };
          }
          case 'public-playlists': {
            const { data: collections } = await fetchPublicCollections(filters);
            return { loading: false, items: [], collections };
          }
        }
      };

      void load().then((result) => {
        if (!cancelled) {
          const filteredItems =
            unheardOnly && unheardIds
              ? result.items.filter((item) => unheardIds.has(item.id))
              : result.items;
          setData((prev) => ({
            ...prev,
            [id]: { ...result, items: filteredItems },
          }));
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [
    enabledWidgets,
    filters,
    unheardIds,
    unheardOnly,
    randomArtistRotationDays,
  ]);

  const availableToAdd = ALL_WIDGET_IDS.filter(
    (id) => !enabledWidgets.includes(id),
  );

  const selectTrack = async (item: DiscoverTrackItem) => {
    const detail = item.audioUrl
      ? {
          title: item.title,
          artistName: item.artist,
          channelSlug: item.channelSlug,
          audioUrl: item.audioUrl,
          bannerUrl: item.coverUrl,
          durationSec: null,
        }
      : (await fetchTrackDetail(item.id.replace(/^archive:/, ''))).data;
    if (!detail?.audioUrl) {
      return;
    }
    const playable: TahtiPlayable = {
      id: item.id,
      kind: 'archive',
      title: detail.title,
      artist: detail.artistName,
      coverUrl: detail.bannerUrl ?? undefined,
      streamUrl: detail.audioUrl,
      protocol: detail.audioUrl.includes('.m3u8') ? 'hls' : 'https',
      channelSlug: detail.channelSlug,
      durationSec: detail.durationSec ?? undefined,
    };
    setSelectedTrack({ item, playable });
    play(playable);
  };

  return (
    <PageFrame>
      <PageHeader
        title="Discover"
        subtitle="Pick the widgets you want to see, and filter by genre or type."
        meta={<Eyebrow>Discover</Eyebrow>}
      />

      <div className="border-border flex gap-1 border-b" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'discover'}
          className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${activeTab === 'discover' ? 'border-primary text-foreground' : 'text-foreground-secondary hover:text-foreground border-transparent'}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'artists'}
          className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${activeTab === 'artists' ? 'border-primary text-foreground' : 'text-foreground-secondary hover:text-foreground border-transparent'}`}
          onClick={() => setActiveTab('artists')}
        >
          Artists
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div
          data-testid="discover-filters"
          className="flex flex-wrap items-center gap-2"
        >
          <Button
            size="sm"
            variant="secondary"
            aria-expanded={genresOpen}
            onClick={() => setGenresOpen((open) => !open)}
          >
            <SlidersHorizontalIcon size={15} className="mr-1.5" aria-hidden />
            Genres{genreFilter.length > 0 ? ` (${genreFilter.length})` : ''}
            <ChevronDownIcon
              size={15}
              className={`ml-1.5 transition-transform ${genresOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            aria-expanded={contentTypesOpen}
            onClick={() => setContentTypesOpen((open) => !open)}
          >
            <SlidersHorizontalIcon size={15} className="mr-1.5" aria-hidden />
            Types
            {contentTypeFilter.length > 0
              ? ` (${contentTypeFilter.length})`
              : ''}
            <ChevronDownIcon
              size={15}
              className={`ml-1.5 transition-transform ${contentTypesOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </Button>
          <FilterChips
            multiple
            items={[{ id: 'unheard', label: 'Tracks I haven’t heard' }]}
            selected={unheardOnly ? ['unheard'] : []}
            onChange={(selected) =>
              setUnheardOnly(selected.includes('unheard'))
            }
          />
        </div>
        {genresOpen ? (
          <FilterChips
            multiple
            items={[
              { id: ALL_FILTER_ID, label: 'All' },
              ...PRESET_GENRES.map((g) => ({ id: g, label: g })),
            ]}
            selected={genreFilter.length > 0 ? genreFilter : [ALL_FILTER_ID]}
            onChange={(selected) =>
              setGenreFilter(selected.filter((id) => id !== ALL_FILTER_ID))
            }
          />
        ) : null}
        {contentTypesOpen ? (
          <FilterChips
            multiple
            items={[
              { id: ALL_FILTER_ID, label: 'All' },
              ...CONTENT_TYPE_OPTIONS,
            ]}
            selected={
              contentTypeFilter.length > 0 ? contentTypeFilter : [ALL_FILTER_ID]
            }
            onChange={(selected) =>
              setContentTypeFilter(
                selected.filter((id) => id !== ALL_FILTER_ID),
              )
            }
          />
        ) : null}
      </div>

      {activeTab === 'discover' && enabledWidgets.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {enabledWidgets.map((id, index) => {
            const widgetData = data[id];
            return (
              <WidgetCard
                key={id}
                id={id}
                title={WIDGET_LABELS[id]}
                subtitle={widgetData?.subtitle}
                loading={widgetData?.loading ?? true}
                items={widgetData?.items ?? []}
                collections={widgetData?.collections}
                artist={widgetData?.artist}
                showRank={TOP_LIST_WIDGET_IDS.has(id)}
                emptyMessage={
                  id === 'loved'
                    ? 'No community-loved tracks yet.'
                    : id === 'public-playlists'
                      ? 'No public playlists match these filters yet.'
                      : 'Nothing here yet.'
                }
                canMoveUp={index > 0}
                canMoveDown={index < enabledWidgets.length - 1}
                onMove={moveWidget}
                onRemove={removeWidget}
                isAdmin={isAdmin}
                onSelectTrack={(track) => void selectTrack(track)}
                settings={
                  id === 'random-artist' ? (
                    <Select
                      label="Keep the same pick for"
                      value={String(randomArtistRotationDays)}
                      onValueChange={(value) =>
                        setRandomArtistRotationDays(Number(value))
                      }
                      options={[
                        { id: '1', label: '1 day' },
                        { id: '3', label: '3 days' },
                        { id: '7', label: '7 days' },
                        { id: '14', label: '14 days' },
                        { id: '30', label: '30 days' },
                      ]}
                    />
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}

      {activeTab === 'artists' && (
        <ArtistCarousel artists={filteredArtists} loading={artistsLoading} />
      )}

      {selectedTrack && (
        <DiscoverWaveformPlayer
          selection={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      )}

      {availableToAdd.length > 0 && (
        <div className="border-border flex min-h-[280px] items-center justify-center rounded-md border-(length:--border-width) border-dashed">
          <Popover
            className="relative"
            anchor="bottom start"
            trigger={
              <Button variant="secondary">
                <PlusIcon size={16} className="mr-1.5" aria-hidden />
                Add a widget
              </Button>
            }
            panelClassName="w-56"
          >
            <Popover.Menu>
              {availableToAdd.map((id) => (
                <Popover.Item key={id} onClick={() => addWidget(id)}>
                  {WIDGET_LABELS[id]}
                </Popover.Item>
              ))}
            </Popover.Menu>
          </Popover>
        </div>
      )}
    </PageFrame>
  );
}

function ArtistCarousel({
  artists,
  loading,
}: {
  artists: ChannelDirectoryItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <section className="border-border bg-background-secondary flex min-h-[280px] items-center justify-center rounded-md border p-4">
        <p className="text-foreground-secondary text-sm">Loading artists…</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3" aria-label="Discover artists">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Discover artists</h2>
          <p className="text-foreground-secondary mt-1 text-sm">
            Artists from the Listen directory, filtered for your picks.
          </p>
        </div>
        <span className="text-foreground-secondary text-xs tabular-nums">
          {artists.length} artists
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <div key={artist.slug} className="group relative">
            <div
              className="from-accent-cyan/50 via-accent-purple/35 to-accent-cyan/45 pointer-events-none absolute -inset-3 rounded-3xl bg-linear-to-br opacity-75 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden
            />
            <Link
              to="/u/$username"
              params={{ username: artist.username }}
              className="border-border bg-background-secondary shadow-shadow relative block h-48 overflow-hidden rounded-xl border transition-transform duration-300 hover:-translate-y-1"
            >
              {artist.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="bg-primary text-primary-foreground absolute inset-0 flex items-center justify-center text-6xl font-bold">
                  {artist.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-black/95" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/95 via-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <div className="min-w-0 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  <h3 className="truncate text-lg font-bold tracking-tight">
                    {artist.displayName}
                  </h3>
                  <p className="truncate text-xs font-medium text-white/90">
                    @{artist.username}
                    {artist.genres.length > 0
                      ? ` · ${artist.genres.slice(0, 2).join(', ')}`
                      : ''}
                  </p>
                </div>
                {isDirectoryArtistActive(artist) ? (
                  <span className="bg-accent-cyan text-accent-foreground shrink-0 rounded-full px-2 py-1 text-[10px] font-bold tracking-wide uppercase shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    Live
                  </span>
                ) : null}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function DiscoverWaveformPlayer({
  selection,
  onClose,
}: {
  selection: DiscoverSelection;
  onClose: () => void;
}) {
  const currentId = usePlayerStore((state) => state.currentId);
  const status = usePlayerStore((state) => state.status);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const play = usePlayerStore((state) => state.play);
  const setStatus = usePlayerStore((state) => state.setStatus);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const isCurrent = currentId === selection.playable.id;
  const isPlaying = isCurrent && (status === 'playing' || status === 'loading');
  const progress = isCurrent && duration > 0 ? currentTime / duration : 0;

  return (
    <section
      className="border-border bg-background-secondary rounded-md border p-4 shadow-sm"
      aria-label="Waveform player"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
          onClick={() => {
            if (isCurrent) {
              setStatus(isPlaying ? 'paused' : 'playing');
            } else {
              play(selection.playable);
            }
          }}
          aria-label={
            isPlaying ? 'Pause selected track' : 'Play selected track'
          }
        >
          {isPlaying ? <PauseIcon size={17} /> : <PlayIcon size={17} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {selection.playable.title}
          </p>
          <p className="text-foreground-secondary truncate text-xs">
            {selection.playable.artist}
          </p>
          <WaveformSeekbar
            trackId={selection.playable.id}
            progress={progress}
            className="mt-3 h-9 w-full"
            onSeek={
              isCurrent && duration > 0
                ? (fraction) => seekTo(fraction * duration)
                : undefined
            }
          />
        </div>
        <button
          type="button"
          className="text-foreground-secondary hover:text-foreground shrink-0 rounded p-1 transition-colors"
          onClick={onClose}
          aria-label="Close waveform player"
        >
          <XIcon size={16} />
        </button>
      </div>
    </section>
  );
}
