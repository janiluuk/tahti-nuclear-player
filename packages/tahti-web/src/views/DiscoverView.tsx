import { ChevronDownIcon, PlusIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, FilterChips, Popover } from '@nuclearplayer/ui';

import {
  fetchArtistOfTheWeek,
  fetchLatestTracks,
  fetchLovedTracks,
  fetchNewToYou,
  fetchTopTracks,
} from '../api/discover';
import type { DiscoverArtistOfWeek } from '../api/discover';
import type { DiscoverTrackItem } from '../api/types';
import { WidgetCard } from '../components/discover/WidgetCard';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { Eyebrow } from '../components/tahti/Eyebrow';
import { PRESET_GENRES } from '../lib/genres';
import {
  ALL_WIDGET_IDS,
  useDiscoverStore,
  type DiscoverWidgetId,
} from '../stores/discoverStore';

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
};

type WidgetData = {
  loading: boolean;
  items: DiscoverTrackItem[];
  subtitle?: string;
  artist?: DiscoverArtistOfWeek;
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
  const [data, setData] = useState<Record<string, WidgetData>>({});
  const [unheardIds, setUnheardIds] = useState<Set<string> | null>(null);
  const [genresOpen, setGenresOpen] = useState(false);

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
  }, [enabledWidgets, filters, unheardIds, unheardOnly]);

  const availableToAdd = ALL_WIDGET_IDS.filter(
    (id) => !enabledWidgets.includes(id),
  );

  return (
    <PageFrame>
      <PageHeader
        title="Your dashboard"
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
        <FilterChips
          multiple
          items={CONTENT_TYPE_OPTIONS}
          selected={contentTypeFilter}
          onChange={setContentTypeFilter}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            />
          );
        })}

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
      </div>
    </PageFrame>
  );
}
