import { Link } from '@tanstack/react-router';
import {
  AudioLinesIcon,
  ImageIcon,
  PencilIcon,
  PlayIcon,
  RadioTowerIcon,
  UploadCloudIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FC } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchEditorSource, fetchStudioArchive } from '../api/studio';
import type { StudioArchiveItem } from '../api/studio-types';
import { PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { TrackEditDialog } from '../components/TrackEditDialog';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import { MyCollectionsView } from './MyCollectionsView';

type VisibilityFilter = 'all' | 'private' | 'processing' | 'public';
type SortKey = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

const FILTERS: Array<{ id: VisibilityFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'private', label: 'Private' },
  { id: 'processing', label: 'Processing' },
  { id: 'public', label: 'Public' },
];

const SORT_OPTIONS: Array<{ id: SortKey; label: string }> = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'title-asc', label: 'Title A–Z' },
  { id: 'title-desc', label: 'Title Z–A' },
];

const itemFilter = (
  item: StudioArchiveItem,
): Exclude<VisibilityFilter, 'all'> => {
  if (item.status !== 'READY') {
    return 'processing';
  }
  return item.isPublic === false ? 'private' : 'public';
};

const sortItems = (items: StudioArchiveItem[], sort: SortKey) =>
  [...items].sort((first, second) => {
    if (sort === 'title-asc') {
      return first.title.localeCompare(second.title);
    }
    if (sort === 'title-desc') {
      return second.title.localeCompare(first.title);
    }
    const firstTime = new Date(first.createdAt ?? 0).getTime();
    const secondTime = new Date(second.createdAt ?? 0).getTime();
    return sort === 'oldest' ? firstTime - secondTime : secondTime - firstTime;
  });

export const MyDiscographyView: FC = () => {
  const user = useAuthStore((state) => state.user);
  const play = usePlayerStore((state) => state.play);
  const [items, setItems] = useState<StudioArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<VisibilityFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    void fetchStudioArchive().then((result) => {
      setItems(result.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      private: items.filter((item) => itemFilter(item) === 'private').length,
      processing: items.filter((item) => itemFilter(item) === 'processing')
        .length,
      public: items.filter((item) => itemFilter(item) === 'public').length,
    }),
    [items],
  );

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (filter !== 'all' && itemFilter(item) !== filter) {
        return false;
      }
      return (
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.artistName?.toLowerCase().includes(normalizedQuery) ||
        item.genre?.toLowerCase().includes(normalizedQuery)
      );
    });
    return sortItems(filtered, sort);
  }, [filter, items, query, sort]);

  const playItem = async (item: StudioArchiveItem) => {
    setPlayingId(item.id);
    const { data } = await fetchEditorSource(item.id);
    play({
      id: `archive:${item.id}`,
      kind: 'archive',
      title: item.title,
      artist: item.artistName || user?.displayName || 'You',
      coverUrl: item.bannerUrl ?? undefined,
      streamUrl: data.url,
      protocol: data.url.includes('.m3u8') ? 'hls' : 'https',
    });
    setPlayingId(null);
  };

  if (!user?.channel) {
    return (
      <PageEmpty
        title="No sounds yet"
        description="Go live or upload music to start your complete audio archive."
        action={
          <Link to="/studio/go-live">
            <Button size="sm" variant="secondary">
              <RadioTowerIcon size={16} aria-hidden className="mr-1.5" />
              Open Studio
            </Button>
          </Link>
        }
      />
    );
  }

  if (loading) {
    return <PageLoading label="Loading all sounds…" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <PageHeader
          title="All sounds"
          subtitle="Your complete archive, including public, private, and processing audio."
          meta={
            <Link to="/studio/upload">
              <Button size="sm">
                <UploadCloudIcon size={16} aria-hidden className="mr-1.5" />
                Upload
              </Button>
            </Link>
          }
        />

        <div className="border-border bg-background-secondary/30 flex flex-col gap-3 rounded-xl border p-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                  filter === option.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border text-foreground-secondary hover:text-foreground border'
                }`}
              >
                {option.label} ({counts[option.id]})
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search all sounds…"
              className="border-border bg-background focus:border-primary min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none"
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Sort all sounds"
              className="border-border bg-background rounded-md border px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <PageEmpty
            title={items.length === 0 ? 'No sounds yet' : 'No sounds match'}
            description={
              items.length === 0
                ? 'Upload or import audio to start your archive.'
                : 'Change the search or filter to see more of your archive.'
            }
          />
        ) : (
          <ul className="border-border divide-border divide-y overflow-hidden rounded-xl border">
            {visible.map((item) => (
              <li
                key={item.id}
                className="bg-background hover:bg-background-secondary/40 flex items-center gap-3 p-3 transition-colors"
              >
                <div className="border-border bg-background-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                  {item.bannerUrl ? (
                    <img
                      src={item.bannerUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      size={18}
                      aria-hidden
                      className="text-foreground-secondary"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/studio/archive/$id"
                    params={{ id: item.id }}
                    className="block truncate font-semibold hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-foreground-secondary truncate text-xs">
                    {item.artistName || user.displayName} ·{' '}
                    {itemFilter(item) === 'processing'
                      ? item.status
                      : itemFilter(item) === 'private'
                        ? 'Private'
                        : 'Public'}
                    {item.genre ? ` · ${item.genre}` : ''}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  disabled={playingId === item.id}
                  aria-label={`Play ${item.title}`}
                  title="Play"
                  onClick={() => void playItem(item)}
                >
                  <PlayIcon size={16} aria-hidden />
                </Button>
                <Button
                  size="icon-sm"
                  variant="secondary"
                  aria-label={`Edit ${item.title}`}
                  title="Edit track"
                  onClick={() => setEditingArchiveId(item.id)}
                >
                  <PencilIcon size={16} aria-hidden />
                </Button>
                <Link to="/studio/archive/$id/editor" params={{ id: item.id }}>
                  <Button
                    size="icon-sm"
                    variant="text"
                    aria-label={`Open ${item.title} in audio editor`}
                    title="Audio editor"
                  >
                    <AudioLinesIcon size={16} aria-hidden />
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MyCollectionsView embedded hasOtherContent={items.length > 0} />

      <TrackEditDialog
        archiveItemId={editingArchiveId}
        onClose={() => setEditingArchiveId(null)}
        onSaved={reload}
      />
    </div>
  );
};
