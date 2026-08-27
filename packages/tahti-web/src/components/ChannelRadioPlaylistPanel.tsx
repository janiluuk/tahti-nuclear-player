import { Link } from '@tanstack/react-router';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ListMusicIcon,
  PlusIcon,
  RadioIcon,
  Trash2Icon,
} from 'lucide-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button, Input, SaveButton, Toggle } from '@nuclearplayer/ui';

import {
  createStudioCollection,
  fetchStudioCollection,
  fetchStudioCollections,
} from '../api/studio';
import {
  applyPlaylistToProgramme,
  fetchProgramme,
  MAX_RADIO_PLAYLIST_ITEMS,
  patchProgramme,
  type ProgrammeItem,
  type ProgrammeView,
} from '../api/studio-extras';
import type { StudioCollection } from '../api/studio-types';

const SECONDS_PER_MINUTE = 60;

const formatDuration = (durationSec: number | null) => {
  if (durationSec == null) {
    return null;
  }
  const minutes = Math.floor(durationSec / SECONDS_PER_MINUTE);
  const seconds = durationSec % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const isPlaylist = (collection: StudioCollection) =>
  !collection.style ||
  collection.style === 'PLAYLIST' ||
  collection.style === 'CUSTOM';

export const ChannelRadioPlaylistPanel: FC = () => {
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [playlists, setPlaylists] = useState<StudioCollection[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [fallbackMode, setFallbackMode] = useState<'shuffle' | 'ordered'>(
    'shuffle',
  );
  const [fallbackAutoEnroll, setFallbackAutoEnroll] = useState(false);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const applyProgramme = (next: ProgrammeView) => {
    setProgramme(next);
    setFallbackEnabled(next.fallbackEnabled);
    setFallbackMode(next.fallbackMode);
    setFallbackAutoEnroll(next.fallbackAutoEnroll);
    setAnnouncementsEnabled(next.announcementsEnabled);
  };

  const reload = () => {
    void Promise.all([fetchProgramme(), fetchStudioCollections()]).then(
      ([programmeResult, collectionResult]) => {
        applyProgramme(programmeResult.data);
        const nextPlaylists = collectionResult.data.filter(isPlaylist);
        setPlaylists(nextPlaylists);
        setSelectedSlug((current) => current || nextPlaylists[0]?.slug || '');
      },
    );
  };

  useEffect(() => {
    reload();
  }, []);

  const rotation = useMemo(
    () =>
      (programme?.items ?? [])
        .filter((item) => item.isFallback)
        .sort(
          (left, right) =>
            (left.fallbackOrder ?? 0) - (right.fallbackOrder ?? 0),
        ),
    [programme],
  );
  const availableItems = useMemo(
    () =>
      (programme?.items ?? []).filter(
        (item) => item.status === 'READY' && !item.isFallback,
      ),
    [programme],
  );
  const selectedPlaylist = playlists.find(
    (playlist) => playlist.slug === selectedSlug,
  );
  const settingsDirty = Boolean(
    programme &&
    (fallbackEnabled !== programme.fallbackEnabled ||
      fallbackMode !== programme.fallbackMode ||
      fallbackAutoEnroll !== programme.fallbackAutoEnroll ||
      announcementsEnabled !== programme.announcementsEnabled),
  );

  const saveSettings = async () => {
    setBusy(true);
    const result = await patchProgramme({
      fallbackEnabled,
      fallbackMode,
      fallbackAutoEnroll,
      announcementsEnabled,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    applyProgramme(result.data);
    toast.success('24/7 settings saved.');
  };

  const applySelected = async () => {
    if (!selectedSlug) {
      return;
    }
    setBusy(true);
    const { data } = await fetchStudioCollection(selectedSlug);
    const archiveItemIds = (data.items ?? [])
      .map((item) => item.archiveItemId)
      .filter((id): id is string => Boolean(id));
    const result = await applyPlaylistToProgramme(archiveItemIds, {
      enable: fallbackEnabled,
      mode: fallbackMode,
      autoEnroll: fallbackAutoEnroll,
      announcementsEnabled,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    applyProgramme(result.data);
    toast.success(
      `Using “${data.name}” with ${Math.min(archiveItemIds.length, MAX_RADIO_PLAYLIST_ITEMS)} tracks.`,
    );
  };

  const saveRotation = async (
    nextRotation: ProgrammeItem[],
    nextMode: 'shuffle' | 'ordered' = fallbackMode,
  ) => {
    if (!programme) {
      return;
    }
    setBusy(true);
    const positions = new Map(
      nextRotation.map((item, index) => [item.id, index]),
    );
    const result = await patchProgramme({
      fallbackMode: nextMode,
      fallbackEnabled,
      fallbackAutoEnroll,
      announcementsEnabled,
      items: programme.items.map((item) => {
        const position = positions.get(item.id);
        return {
          archiveItemId: item.id,
          isFallback: position !== undefined,
          ...(position !== undefined ? { fallbackOrder: position } : {}),
        };
      }),
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    applyProgramme(result.data);
    toast.success('Rotation updated.');
  };

  const moveRotationItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rotation.length) {
      return;
    }
    const next = [...rotation];
    const [moved] = next.splice(index, 1);
    if (!moved) {
      return;
    }
    next.splice(target, 0, moved);
    void saveRotation(next, 'ordered');
  };

  const createInline = async () => {
    if (!newName.trim()) {
      return;
    }
    setBusy(true);
    const created = await createStudioCollection({
      name: newName.trim(),
      style: 'PLAYLIST',
      isPublic: true,
    });
    setBusy(false);
    if (!created.ok) {
      toast.error(created.error);
      return;
    }
    setCreating(false);
    setNewName('');
    setPlaylists((current) => [created.data, ...current]);
    setSelectedSlug(created.data.slug);
    toast.success(`Created “${created.data.name}”.`);
  };

  return (
    <section className="border-border bg-background-secondary/40 overflow-hidden rounded-xl border shadow-sm">
      <header className="border-border flex flex-wrap items-center justify-between gap-4 border-b px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-primary/15 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <RadioIcon size={20} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-tight">
              24/7 &amp; offline programme
            </h2>
            <p className="text-foreground-secondary text-xs">
              One place for everything that plays between live broadcasts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-xs font-semibold uppercase ${
              fallbackEnabled
                ? 'text-accent-green'
                : 'text-foreground-secondary'
            }`}
          >
            {fallbackEnabled ? 'On' : 'Off'}
          </span>
          <Toggle
            checked={fallbackEnabled}
            disabled={busy || !programme}
            onChange={setFallbackEnabled}
            aria-label="24/7 channel"
          />
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-2 lg:p-5">
        <div className="border-border bg-background flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-bold">Playlist source</h3>
            <p className="text-foreground-secondary mt-0.5 text-xs">
              Choose a playlist, then publish its archive tracks to rotation.
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-foreground-secondary text-xs uppercase">
              Playlist
            </span>
            <select
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              className="border-border bg-background-secondary rounded-md border px-3 py-2"
            >
              {playlists.length === 0 ? (
                <option value="">No playlists yet</option>
              ) : null}
              {playlists.map((playlist) => (
                <option key={playlist.slug} value={playlist.slug}>
                  {playlist.name} ·{' '}
                  {playlist.itemCount ?? playlist.items?.length ?? 0} tracks
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={busy || !selectedSlug}
              onClick={() => void applySelected()}
            >
              Use playlist
            </Button>
            {selectedPlaylist ? (
              <Link
                to="/studio/playlists/$slug"
                params={{ slug: selectedPlaylist.slug }}
              >
                <Button size="sm" variant="secondary">
                  <ListMusicIcon size={14} aria-hidden className="mr-1.5" />
                  Edit tracks
                </Button>
              </Link>
            ) : null}
            <Button
              size="icon-sm"
              variant="text"
              onClick={() => setCreating((current) => !current)}
              aria-label="Create playlist"
              title="Create playlist"
              aria-pressed={creating}
            >
              <PlusIcon size={16} aria-hidden />
            </Button>
          </div>

          {creating ? (
            <div className="border-border bg-background-secondary flex flex-col gap-2 rounded-lg border p-3">
              <Input
                label="Playlist name"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                autoFocus
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={busy || !newName.trim()}
                  onClick={() => void createInline()}
                >
                  Create
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-border bg-background flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-bold">Offline programme settings</h3>
            <p className="text-foreground-secondary mt-0.5 text-xs">
              Keep the rotation predictable or let Tahti balance it.
            </p>
          </div>

          <div
            className="border-border grid grid-cols-2 rounded-md border p-1"
            role="group"
            aria-label="Rotation mode"
          >
            {(
              [
                ['shuffle', 'Shuffle'] as const,
                ['ordered', 'In order'] as const,
              ] as const
            ).map(([mode, label]) => (
              <Button
                key={mode}
                type="button"
                variant="text"
                className={`rounded px-3 py-2 text-xs font-semibold uppercase transition-colors ${
                  fallbackMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
                onClick={() => setFallbackMode(mode)}
                aria-pressed={fallbackMode === mode}
              >
                {label}
              </Button>
            ))}
          </div>

          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              Auto-add uploads
              <span className="text-foreground-secondary block text-xs">
                Until the {MAX_RADIO_PLAYLIST_ITEMS}-track limit
              </span>
            </span>
            <Toggle
              checked={fallbackAutoEnroll}
              disabled={busy || !programme}
              onChange={setFallbackAutoEnroll}
              aria-label="Auto-add uploads"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              Artist announcements
              <span className="text-foreground-secondary block text-xs">
                Include your station IDs and clips
              </span>
            </span>
            <Toggle
              checked={announcementsEnabled}
              disabled={busy || !programme}
              onChange={setAnnouncementsEnabled}
              aria-label="Artist announcements"
            />
          </label>

          <div className="flex justify-end">
            <SaveButton
              disabled={!programme || !settingsDirty}
              saving={busy}
              label="Save settings"
              onClick={() => void saveSettings()}
            />
          </div>
        </div>
      </div>

      <div className="border-border border-t px-4 py-4 sm:px-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold">
              Active rotation · {rotation.length}/{MAX_RADIO_PLAYLIST_ITEMS}
            </h3>
            <p className="text-foreground-secondary text-xs">
              Reordering switches playback to In order.
            </p>
          </div>
          {availableItems.length > 0 &&
          rotation.length < MAX_RADIO_PLAYLIST_ITEMS ? (
            <label className="flex items-center gap-2 text-xs">
              <span className="text-foreground-secondary uppercase">
                Quick add
              </span>
              <select
                value=""
                disabled={busy}
                onChange={(event) => {
                  const item = availableItems.find(
                    (candidate) => candidate.id === event.target.value,
                  );
                  if (item) {
                    void saveRotation([...rotation, item]);
                  }
                }}
                className="border-border bg-background rounded-md border px-2 py-1.5"
                aria-label="Quick add archive track"
              >
                <option value="">Choose track…</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {rotation.length === 0 ? (
          <div className="border-border rounded-lg border border-dashed px-4 py-8 text-center">
            <ListMusicIcon
              size={28}
              className="text-foreground-secondary mx-auto opacity-50"
              aria-hidden
            />
            <p className="mt-2 text-sm font-medium">Rotation is empty</p>
            <p className="text-foreground-secondary mt-1 text-xs">
              Choose a playlist above or add a ready archive track.
            </p>
          </div>
        ) : (
          <ol className="border-border divide-border divide-y overflow-hidden rounded-lg border">
            {rotation.map((item, index) => {
              const duration = formatDuration(item.durationSec);
              return (
                <li
                  key={item.id}
                  className="bg-background flex items-center gap-3 px-3 py-2.5"
                >
                  <span className="text-foreground-secondary w-5 shrink-0 text-center font-mono text-xs">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {item.title}
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {duration ?? item.status}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon-sm"
                      variant="text"
                      disabled={busy || index === 0}
                      onClick={() => moveRotationItem(index, -1)}
                      aria-label={`Move ${item.title} up`}
                      title="Move up"
                    >
                      <ArrowUpIcon size={14} aria-hidden />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="text"
                      disabled={busy || index === rotation.length - 1}
                      onClick={() => moveRotationItem(index, 1)}
                      aria-label={`Move ${item.title} down`}
                      title="Move down"
                    >
                      <ArrowDownIcon size={14} aria-hidden />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="text"
                      disabled={busy}
                      onClick={() =>
                        void saveRotation(
                          rotation.filter(
                            (candidate) => candidate.id !== item.id,
                          ),
                        )
                      }
                      aria-label={`Remove ${item.title} from rotation`}
                      title="Remove"
                    >
                      <Trash2Icon size={14} aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
};
