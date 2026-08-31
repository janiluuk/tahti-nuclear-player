import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, FilterChips, Popover, Select } from '@nuclearplayer/ui';

import { fetchTrackDetail } from '../api/client';
import {
  fetchArtistOfTheWeek,
  fetchLatestTracks,
  fetchLovedTracks,
  fetchNewToYou,
  fetchRandomArtist,
  fetchTopTracks,
} from '../api/discover';
import type { DiscoverArtistOfWeek } from '../api/discover';
import type { DiscoverTrackItem, TahtiPlayable } from '../api/types';
import { WidgetCard } from '../components/discover/WidgetCard';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { Eyebrow } from '../components/tahti/Eyebrow';
import { WaveformSeekbar } from '../components/tahti/WaveformSeekbar';
import { PRESET_GENRES } from '../lib/genres';
import {
  ALL_WIDGET_IDS,
  useDiscoverStore,
  type DiscoverWidgetId,
} from '../stores/discoverStore';
import { usePlayerStore } from '../stores/playerStore';

const CONTENT_TYPE_OPTIONS = [
  { id: 'LIVE', label: 'Live' },
  { id: 'STUDIO', label: 'Studio' },
  { id: 'DJ_MIX', label: 'DJ mix' },
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
};

type WidgetData = {
  loading: boolean;
  items: DiscoverTrackItem[];
  subtitle?: string;
  artist?: DiscoverArtistOfWeek;
};

type DiscoverSelection = {
  item: DiscoverTrackItem;
  playable: TahtiPlayable;
};

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
  const [data, setData] = useState<Record<string, WidgetData>>({});
  const [unheardIds, setUnheardIds] = useState<Set<string> | null>(null);
  const [genresOpen, setGenresOpen] = useState(false);
  const [contentTypesOpen, setContentTypesOpen] = useState(false);
  const [widgetIndex, setWidgetIndex] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState<DiscoverSelection | null>(
    null,
  );

  const filters = useMemo(
    () => ({ genres: genreFilter, contentTypes: contentTypeFilter }),
    [genreFilter, contentTypeFilter],
  );

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

  useEffect(() => {
    setWidgetIndex((current) =>
      Math.min(current, Math.max(0, enabledWidgets.length - 1)),
    );
  }, [enabledWidgets.length]);

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

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
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
            items={PRESET_GENRES.map((g) => ({ id: g, label: g }))}
            selected={genreFilter}
            onChange={setGenreFilter}
          />
        ) : null}
        {contentTypesOpen ? (
          <FilterChips
            multiple
            items={CONTENT_TYPE_OPTIONS}
            selected={contentTypeFilter}
            onChange={setContentTypeFilter}
          />
        ) : null}
      </div>

      {enabledWidgets.length > 0 && (
        <div className="relative px-10 sm:px-12">
          <button
            type="button"
            className="border-border bg-background text-foreground hover:border-primary absolute top-1/2 left-0 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() =>
              setWidgetIndex((current) => Math.max(0, current - 1))
            }
            disabled={widgetIndex === 0}
            aria-label="Previous discovery widget"
          >
            <ChevronLeftIcon size={18} aria-hidden />
          </button>
          <div className="overflow-hidden rounded-md">
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${widgetIndex * 100}%)` }}
            >
              {enabledWidgets.map((id, index) => {
                const widgetData = data[id];
                return (
                  <div key={id} className="min-w-full">
                    <WidgetCard
                      id={id}
                      title={WIDGET_LABELS[id]}
                      subtitle={widgetData?.subtitle}
                      loading={widgetData?.loading ?? true}
                      items={widgetData?.items ?? []}
                      artist={widgetData?.artist}
                      showRank={
                        id === 'this-week-most-played' ||
                        id === 'this-week-least-played' ||
                        id === 'most-played'
                      }
                      emptyMessage={
                        id === 'loved'
                          ? 'No community-loved tracks yet.'
                          : 'Nothing here yet.'
                      }
                      canMoveUp={index > 0}
                      canMoveDown={index < enabledWidgets.length - 1}
                      onMove={moveWidget}
                      onRemove={removeWidget}
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
                  </div>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            className="border-border bg-background text-foreground hover:border-primary absolute top-1/2 right-0 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() =>
              setWidgetIndex((current) =>
                Math.min(enabledWidgets.length - 1, current + 1),
              )
            }
            disabled={widgetIndex === enabledWidgets.length - 1}
            aria-label="Next discovery widget"
          >
            <ChevronRightIcon size={18} aria-hidden />
          </button>
          <p className="text-foreground-secondary mt-2 text-center text-xs tabular-nums">
            {widgetIndex + 1} / {enabledWidgets.length}
          </p>
        </div>
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
