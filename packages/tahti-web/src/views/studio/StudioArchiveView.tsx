import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import {
  AudioLinesIcon,
  BarChart3Icon,
  ChevronDownIcon,
  DownloadIcon,
  FilterIcon,
  FolderIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Dialog } from '@nuclearplayer/ui';

import {
  deleteStudioArchiveItem,
  fetchEditorSource,
  fetchStudioArchive,
  fetchStudioArchiveDownload,
  patchStudioArchiveItem,
} from '../../api/studio';
import type { StudioArchiveItem } from '../../api/studio-types';
import { AddToMusicActions } from '../../components/AddToMusicActions';
import { AddToPlaylistButton } from '../../components/AddToPlaylistButton';
import { PageLoading } from '../../components/PageStates';
import { StashFilesPanel } from '../../components/StashFilesPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { TrackEditDialog } from '../../components/TrackEditDialog';
import { TrackInsightsPanel } from '../../components/TrackInsightsPanel';
import {
  EMBED_PROVIDER_HEIGHT,
  EMBED_PROVIDER_LABEL,
  embedSrcFor,
  type EmbedProvider,
} from '../../lib/embedSrc';
import {
  countPinnedTracks,
  isPinned,
  MAX_PINNED_TRACKS,
  pinBlockedMessage,
  sortPinnedFirst,
} from '../../lib/pinnedTracks';
import { usePlayerStore } from '../../stores/playerStore';

const FOLDERS = [
  { id: 'archive' as const, label: 'Sounds', icon: AudioLinesIcon },
  { id: 'clips' as const, label: 'Clips', icon: AudioLinesIcon },
  { id: 'files' as const, label: 'Move to stash', icon: FolderIcon },
];

type EmbedFilter = 'ALL' | 'NATIVE' | EmbedProvider;
type SortField = 'title' | 'uploaded' | 'duration';

const EMBED_FILTERS: Array<{ id: EmbedFilter; label: string }> = [
  { id: 'ALL', label: 'All sources' },
  { id: 'NATIVE', label: 'Tahti audio' },
  { id: 'HEARTHIS', label: 'hearthis.at' },
  { id: 'MIXCLOUD', label: 'Mixcloud' },
  { id: 'SPOTIFY', label: 'Spotify' },
];

const SORT_FIELDS: Array<{ id: SortField; label: string }> = [
  { id: 'title', label: 'Title' },
  { id: 'uploaded', label: 'Upload date' },
  { id: 'duration', label: 'Duration' },
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDateInput(value: string): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatUploadDate(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function StudioArchiveView() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { folder?: string };
  const folder =
    search.folder === 'files'
      ? 'files'
      : search.folder === 'clips'
        ? 'clips'
        : 'archive';
  const [items, setItems] = useState<StudioArchiveItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [embedFilter, setEmbedFilter] = useState<EmbedFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('uploaded');
  const [sortDescending, setSortDescending] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [uploadedFrom, setUploadedFrom] = useState('');
  const [uploadedTo, setUploadedTo] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [embedOpenId, setEmbedOpenId] = useState<string | null>(null);
  const [statsItem, setStatsItem] = useState<StudioArchiveItem | null>(null);
  const play = usePlayerStore((s) => s.play);

  const reload = () => {
    setLoading(true);
    void fetchStudioArchive().then((res) => {
      setItems(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = parseDateInput(uploadedFrom);
    const to = parseDateInput(uploadedTo);
    const toExclusive = to ? new Date(to.getTime() + DAY_IN_MS) : null;
    const base = !q
      ? items
      : items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            (i.genre?.toLowerCase().includes(q) ?? false) ||
            i.status.toLowerCase().includes(q),
        );
    const filteredItems = base.filter((item) => {
      if (item.embedProvider === 'HEARTHIS') {
        return false;
      }
      if (folder === 'clips' && item.contentType !== 'AUDIOCLIPS') {
        return false;
      }
      if (folder === 'archive' && item.contentType === 'AUDIOCLIPS') {
        return false;
      }
      const provider = item.embedProvider ?? 'NATIVE';
      if (embedFilter !== 'ALL' && provider !== embedFilter) {
        return false;
      }
      if (!item.createdAt) {
        return !from && !toExclusive;
      }
      const uploadedAt = new Date(item.createdAt);
      if (Number.isNaN(uploadedAt.getTime())) {
        return !from && !toExclusive;
      }
      return (
        (!from || uploadedAt >= from) &&
        (!toExclusive || uploadedAt < toExclusive)
      );
    });
    return sortPinnedFirst(filteredItems).sort((left, right) => {
      const comparison =
        sortField === 'title'
          ? left.title.localeCompare(right.title)
          : sortField === 'duration'
            ? (left.durationSec ?? 0) - (right.durationSec ?? 0)
            : new Date(left.createdAt ?? 0).getTime() -
              new Date(right.createdAt ?? 0).getTime();
      return sortDescending ? -comparison : comparison;
    });
  }, [
    embedFilter,
    items,
    query,
    sortDescending,
    sortField,
    uploadedFrom,
    uploadedTo,
    folder,
  ]);

  const pinnedCount = countPinnedTracks(items);

  const playItem = async (id: string, title: string) => {
    setBusyId(id);
    const { data } = await fetchEditorSource(id);
    play({
      id: `archive:${id}`,
      kind: 'archive',
      title: data.title || title,
      artist: 'You',
      streamUrl: data.url,
      protocol: data.url.includes('.m3u8') ? 'hls' : 'https',
    });
    setBusyId(null);
  };

  const downloadItem = async (item: StudioArchiveItem) => {
    setBusyId(item.id);
    const result = await fetchStudioArchiveDownload(item.id);
    setBusyId(null);
    if (!result.ok) {
      setPinMessage(result.error);
      return;
    }
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename ?? `${item.title}.audio`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const togglePin = async (item: StudioArchiveItem) => {
    const next = !isPinned(item);
    setPinMessage(null);
    if (next) {
      const blocked = pinBlockedMessage(pinnedCount);
      if (blocked) {
        setPinMessage(blocked);
        return;
      }
    }
    setBusyId(item.id);
    const result = await patchStudioArchiveItem(item.id, { pinned: next });
    setBusyId(null);
    if (!result.ok) {
      setPinMessage(result.error);
      return;
    }
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? result.data : row)),
    );
  };

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/archive" />
        <StudioPageHeader
          title="Sounds"
          subtitle="Your sounds and other files, in one place."
          action={
            folder === 'archive' ? (
              <AddToMusicActions onUploaded={reload} />
            ) : undefined
          }
        />

        <nav className="flex flex-wrap gap-2" role="tablist">
          {FOLDERS.map((f) => (
            <Button
              key={f.id}
              type="button"
              variant="text"
              role="tab"
              aria-selected={folder === f.id}
              onClick={() =>
                void navigate({
                  to: '/studio/archive',
                  search: f.id === 'archive' ? {} : { folder: f.id },
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                folder === f.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              <f.icon size={14} aria-hidden />
              {f.label}
            </Button>
          ))}
        </nav>

        {folder === 'files' ? (
          <StashFilesPanel />
        ) : (
          <StudioPanel>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="border-border bg-background focus:border-primary max-w-md flex-1 rounded-md border px-3 py-2 text-sm outline-none"
              />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                aria-expanded={filtersOpen}
                aria-label={filtersOpen ? 'Collapse filters' : 'Expand filters'}
                title={filtersOpen ? 'Collapse filters' : 'Expand filters'}
                onClick={() => setFiltersOpen((current) => !current)}
              >
                <FilterIcon size={15} aria-hidden />
                <ChevronDownIcon
                  size={13}
                  aria-hidden
                  className={filtersOpen ? 'rotate-180' : ''}
                />
              </Button>
              <span className="text-foreground-secondary text-xs">
                Pinned {pinnedCount}/{MAX_PINNED_TRACKS}
              </span>
            </div>
            {filtersOpen && (
              <div className="border-border mb-4 flex flex-wrap items-end gap-3 border-b pb-4">
                <label className="flex min-w-40 flex-col gap-1 text-xs">
                  Source
                  <select
                    value={embedFilter}
                    onChange={(event) =>
                      setEmbedFilter(event.target.value as EmbedFilter)
                    }
                    className="border-border bg-background h-9 rounded-md border px-2 text-sm"
                  >
                    {EMBED_FILTERS.map((filterOption) => (
                      <option key={filterOption.id} value={filterOption.id}>
                        {filterOption.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-w-40 flex-col gap-1 text-xs">
                  Sort by
                  <select
                    value={sortField}
                    onChange={(event) =>
                      setSortField(event.target.value as SortField)
                    }
                    className="border-border bg-background h-9 rounded-md border px-2 text-sm"
                  >
                    {SORT_FIELDS.map((sortOption) => (
                      <option key={sortOption.id} value={sortOption.id}>
                        {sortOption.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSortDescending((current) => !current)}
                >
                  {sortDescending ? 'Descending' : 'Ascending'}
                </Button>
                <label className="flex min-w-36 flex-col gap-1 text-xs">
                  Uploaded from
                  <input
                    type="date"
                    value={uploadedFrom}
                    onChange={(event) => setUploadedFrom(event.target.value)}
                    className="border-border bg-background h-9 rounded-md border px-2 text-sm"
                  />
                </label>
                <label className="flex min-w-36 flex-col gap-1 text-xs">
                  Uploaded to
                  <input
                    type="date"
                    value={uploadedTo}
                    onChange={(event) => setUploadedTo(event.target.value)}
                    className="border-border bg-background h-9 rounded-md border px-2 text-sm"
                  />
                </label>
              </div>
            )}

            {pinMessage && (
              <p
                className="text-foreground-secondary mb-3 text-sm"
                role="status"
              >
                {pinMessage}
              </p>
            )}

            {loading ? (
              <PageLoading label="Loading…" />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col gap-3 py-4 text-center">
                <p className="text-foreground-secondary text-sm">
                  No tracks yet. Upload a file or import from Sources.
                </p>
                <AddToMusicActions align="center" onUploaded={reload} />
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {filtered.map((item) => {
                  const embedSrc =
                    item.embedProvider && item.embedUri
                      ? embedSrcFor(item.embedProvider, item.embedUri)
                      : null;
                  return (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/t/$id"
                          params={{ id: item.id }}
                          className="font-medium hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="text-foreground-secondary text-xs">
                          {item.status}
                          {formatUploadDate(item.createdAt)
                            ? `, uploaded ${formatUploadDate(item.createdAt)}`
                            : ''}
                          {isPinned(item) ? ', pinned' : ''}
                          {item.durationSec != null
                            ? `, ${Math.round(item.durationSec / 60)} min`
                            : ''}
                          {item.genre ? `, ${item.genre}` : ''}
                          {item.isPublic === false ? ', private' : ''}
                          {embedSrc
                            ? `, via ${EMBED_PROVIDER_LABEL[item.embedProvider!]}`
                            : ''}
                        </p>
                      </div>
                      <Button
                        size="icon-sm"
                        disabled={busyId === item.id}
                        onClick={() =>
                          embedSrc
                            ? setEmbedOpenId((id) =>
                                id === item.id ? null : item.id,
                              )
                            : void playItem(item.id, item.title)
                        }
                        aria-label={
                          embedSrc
                            ? `Play ${item.title} on ${EMBED_PROVIDER_LABEL[item.embedProvider!]}`
                            : `Play ${item.title}`
                        }
                        title={
                          embedSrc
                            ? `Play on ${EMBED_PROVIDER_LABEL[item.embedProvider!]}`
                            : 'Play'
                        }
                      >
                        <PlayIcon size={16} aria-hidden />
                      </Button>
                      {item.downloadsEnabled ? (
                        <Button
                          size="icon-sm"
                          variant="text"
                          disabled={busyId === item.id}
                          onClick={() => void downloadItem(item)}
                          aria-label={`Download ${item.title}`}
                          title="Download original"
                        >
                          <DownloadIcon size={16} aria-hidden />
                        </Button>
                      ) : null}
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        aria-label={`Edit ${item.title}`}
                        title="Edit track"
                        onClick={() => setEditingId(item.id)}
                      >
                        <PencilIcon size={16} aria-hidden />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="text"
                        onClick={() => setStatsItem(item)}
                        aria-label={`Show stats for ${item.title}`}
                        title="Stats"
                      >
                        <BarChart3Icon size={16} aria-hidden />
                      </Button>
                      <AddToPlaylistButton
                        archiveItemId={item.id}
                        trackTitle={item.title}
                      />
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label={openMoreId === item.id ? 'Less' : 'More'}
                        title={openMoreId === item.id ? 'Less' : 'More'}
                        onClick={() =>
                          setOpenMoreId((id) =>
                            id === item.id ? null : item.id,
                          )
                        }
                      >
                        <MoreHorizontalIcon size={16} aria-hidden />
                      </Button>
                      {openMoreId === item.id && (
                        <div className="flex w-full flex-wrap gap-2 pt-1">
                          <Button
                            size="icon-sm"
                            variant="text"
                            disabled={busyId === item.id}
                            aria-label={
                              isPinned(item) ? 'Unpin from page' : 'Pin to page'
                            }
                            title={
                              !isPinned(item) &&
                              pinnedCount >= MAX_PINNED_TRACKS
                                ? (pinBlockedMessage(pinnedCount) ??
                                  (isPinned(item)
                                    ? 'Unpin from page'
                                    : 'Pin to page'))
                                : isPinned(item)
                                  ? 'Unpin from page'
                                  : 'Pin to page'
                            }
                            onClick={() => void togglePin(item)}
                          >
                            {isPinned(item) ? (
                              <PinOffIcon size={16} aria-hidden />
                            ) : (
                              <PinIcon size={16} aria-hidden />
                            )}
                          </Button>
                          {!embedSrc && (
                            <Link
                              to="/studio/archive/$id/editor"
                              params={{ id: item.id }}
                            >
                              <Button
                                size="icon-sm"
                                variant="text"
                                aria-label="Audio editor"
                                title="Audio editor"
                              >
                                <AudioLinesIcon size={16} aria-hidden />
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label={`Delete ${item.title}`}
                            title="Delete"
                            onClick={() => {
                              if (!confirm(`Delete “${item.title}”?`)) {
                                return;
                              }
                              void deleteStudioArchiveItem(item.id).then(() =>
                                reload(),
                              );
                            }}
                          >
                            <Trash2Icon size={16} aria-hidden />
                          </Button>
                        </div>
                      )}
                      {embedSrc && embedOpenId === item.id && (
                        <iframe
                          title={item.title}
                          src={embedSrc}
                          width="100%"
                          height={EMBED_PROVIDER_HEIGHT[item.embedProvider!]}
                          style={{ border: 0, display: 'block' }}
                          allow="autoplay; encrypted-media"
                          loading="lazy"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </StudioPanel>
        )}
        <TrackEditDialog
          archiveItemId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={(saved) =>
            setItems((current) =>
              current.map((item) => (item.id === saved.id ? saved : item)),
            )
          }
        />
      </div>
      <Dialog.Root
        isOpen={Boolean(statsItem)}
        onClose={() => setStatsItem(null)}
        className="max-w-3xl"
      >
        <Dialog.Title>{statsItem?.title ?? 'Track stats'}</Dialog.Title>
        <Dialog.Description>
          Plays, downloads, and listener geography for this sound.
        </Dialog.Description>
        {statsItem ? (
          <TrackInsightsPanel kind="archive" id={statsItem.id} />
        ) : null}
        <Dialog.Actions>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Root>
    </StudioGate>
  );
}
