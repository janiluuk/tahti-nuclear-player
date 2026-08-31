import { Link } from '@tanstack/react-router';
import {
  ExternalLinkIcon,
  FilterIcon,
  FingerprintIcon,
  GripVerticalIcon,
  LayoutDashboardIcon,
  Link2Icon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  Share2Icon,
  Trash2Icon,
  UploadCloudIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Dialog,
  EmptyState,
  FilePicker,
  Input,
  SaveButton,
  Tabs,
  Textarea,
} from '@nuclearplayer/ui';

import {
  addStudioReleaseTrack,
  fetchEditorSource,
  fetchStudioArchive,
  fetchStudioArchiveItem,
  fetchStudioReleases,
  patchStudioRelease,
  removeStudioReleaseTrack,
  reorderStudioReleaseTracks,
  uploadReleaseArtwork,
} from '../../api/studio';
import type {
  FingerprintMatch,
  StudioArchiveItem,
  StudioRelease,
} from '../../api/studio-types';
import { EmbedTrackRow } from '../../components/EmbedTrackRow';
import { FingerprintTrackPanel } from '../../components/FingerprintTrackPanel';
import { MusicBrainzSubmissionAssistant } from '../../components/MusicBrainzSubmissionAssistant';
import { SourceServiceIcon } from '../../components/SourceServiceIcon';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { useAuthStore } from '../../stores/authStore';
import { usePlayerStore } from '../../stores/playerStore';

const SMART_LINK_TARGETS = [
  {
    key: 'spotify',
    label: 'Spotify',
    placeholder: 'https://open.spotify.com/...',
  },
  {
    key: 'apple',
    label: 'Apple Music',
    placeholder: 'https://music.apple.com/...',
  },
  {
    key: 'bandcamp',
    label: 'Bandcamp',
    placeholder: 'https://artist.bandcamp.com/...',
  },
  {
    key: 'soundcloud',
    label: 'SoundCloud',
    placeholder: 'https://soundcloud.com/...',
  },
  {
    key: 'youtube',
    label: 'YouTube Music',
    placeholder: 'https://music.youtube.com/...',
  },
  { key: 'tidal', label: 'Tidal', placeholder: 'https://listen.tidal.com/...' },
] as const;

export function StudioReleaseDetailView({ id }: { id: string }) {
  const user = useAuthStore((state) => state.user);
  const [release, setRelease] = useState<StudioRelease | null>(null);
  const [description, setDescription] = useState('');
  const [spotify, setSpotify] = useState('');
  const [bandcamp, setBandcamp] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkPickerOpen, setArtworkPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchStudioReleases().then((res) => {
      const found = res.data.releases.find((r) => r.id === id) ?? null;
      setRelease(found);
      setDescription(found?.description ?? '');
      setSpotify(found?.smartLinkTargets?.spotify ?? '');
      setBandcamp(found?.smartLinkTargets?.bandcamp ?? '');
      setArtworkPreview(found?.artworkUrl ?? null);
    });
  }, [id]);

  const save = async () => {
    setMessage(null);
    setSaving(true);
    const result = await patchStudioRelease(id, {
      description,
      smartLinkTargets: {
        ...(release?.smartLinkTargets ?? {}),
        spotify,
        bandcamp,
      },
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRelease(result.data);
    setMessage('Saved.');
  };

  const updateTrackFingerprint = (
    trackId: string,
    match: FingerprintMatch | null,
  ) => {
    setRelease((prev) =>
      prev
        ? {
            ...prev,
            tracks: prev.tracks?.map((t) =>
              t.id === trackId ? { ...t, fingerprintMatch: match } : t,
            ),
          }
        : prev,
    );
  };

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-2xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/releases" />
        <Link
          to="/studio/releases"
          className="text-foreground-secondary -mt-2 text-xs hover:underline"
        >
          ← Releases
        </Link>
        {!release ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">
              Release not found in list.
            </p>
          </StudioPanel>
        ) : (
          <>
            <StudioPageHeader
              title={release.title}
              subtitle={`${release.state} — /r/${release.smartLinkSlug}`}
              action={
                <div className="flex flex-wrap justify-end gap-2">
                  <SaveButton saving={saving} onClick={() => void save()} />
                </div>
              }
            />

            <Tabs
              listClassName="border-border border-b pb-3"
              panelClassName="flex flex-col gap-6 pt-2"
              items={[
                {
                  id: 'overview',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <LayoutDashboardIcon size={14} aria-hidden /> Overview
                    </span>
                  ),
                  content: (
                    <>
                      <StudioPanel title="Artwork">
                        <div className="group relative inline-flex">
                          {artworkPreview ? (
                            <img
                              src={artworkPreview}
                              alt=""
                              className="border-border h-28 w-28 rounded-lg border object-cover shadow-sm"
                            />
                          ) : (
                            <div className="border-border bg-background text-foreground-secondary flex h-28 w-28 items-center justify-center rounded-lg border text-xs">
                              No art
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setArtworkPickerOpen(true)}
                            aria-label="Change release artwork"
                            title="Change release artwork"
                            className="bg-background/80 text-foreground absolute inset-0 flex items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <UploadCloudIcon size={22} aria-hidden />
                          </button>
                        </div>
                      </StudioPanel>

                      <Dialog.Root
                        isOpen={artworkPickerOpen}
                        onClose={() => setArtworkPickerOpen(false)}
                        className="max-w-lg"
                      >
                        <Dialog.Title>Release artwork</Dialog.Title>
                        <div className="mt-4">
                          <FilePicker
                            labels={{
                              title: 'Release artwork',
                              description: 'JPEG, PNG, or WebP',
                              browse: 'Choose image',
                            }}
                            accept="image/jpeg,image/png,image/webp"
                            onFiles={(files) => {
                              const file = files[0];
                              if (!file) {
                                return;
                              }
                              void uploadReleaseArtwork(id, file).then((r) => {
                                if (!r.ok) {
                                  setMessage(r.error);
                                } else {
                                  setArtworkPreview(r.artworkUrl);
                                  setMessage('Artwork uploaded.');
                                }
                                setArtworkPickerOpen(false);
                              });
                            }}
                          />
                        </div>
                      </Dialog.Root>

                      <StudioPanel title="Details">
                        <div className="flex flex-col gap-3">
                          <label className="flex flex-col gap-1 text-sm">
                            <span className="text-foreground-secondary text-xs uppercase">
                              Description
                            </span>
                            <Textarea
                              tone="secondary"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                            />
                          </label>
                        </div>
                      </StudioPanel>

                      {release.tracks && release.tracks.length > 0 && (
                        <StudioPanel title="Tracks">
                          <ol className="text-foreground-secondary list-decimal space-y-2 pl-5 text-sm">
                            {release.tracks.map((t) => (
                              <ReleaseTrackRow
                                key={t.id}
                                track={t}
                                shopUrl={release.smartLinkTargets?.bandcamp}
                              />
                            ))}
                          </ol>
                        </StudioPanel>
                      )}

                      {message && <p className="text-sm">{message}</p>}

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            void patchStudioRelease(id, {
                              state: 'PUBLISHED',
                            }).then((r) => {
                              if (!r.ok) {
                                setMessage(r.error);
                              } else {
                                setRelease(r.data);
                                setMessage('Published.');
                              }
                            });
                          }}
                        >
                          Publish
                        </Button>
                        <Link
                          to="/r/$slug"
                          params={{ slug: release.smartLinkSlug }}
                        >
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label="Open smart link"
                            title="Open smart link"
                          >
                            <ExternalLinkIcon size={16} aria-hidden />
                          </Button>
                        </Link>
                        <Link to="/studio/distribution">
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label="Distribution"
                            title="Distribution"
                          >
                            <Share2Icon size={16} aria-hidden />
                          </Button>
                        </Link>
                      </div>
                    </>
                  ),
                },
                {
                  id: 'smart-links',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Link2Icon size={14} aria-hidden /> Smart links
                    </span>
                  ),
                  content: (
                    <ReleaseSmartLinksPanel
                      release={release}
                      spotify={spotify}
                      bandcamp={bandcamp}
                      onSpotifyChange={setSpotify}
                      onBandcampChange={setBandcamp}
                      onTargetsSaved={(targets) =>
                        setRelease((current) =>
                          current
                            ? { ...current, smartLinkTargets: targets }
                            : current,
                        )
                      }
                      onMessage={setMessage}
                      onReleaseChange={setRelease}
                    />
                  ),
                },
                {
                  id: 'fingerprinting',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <FingerprintIcon size={14} aria-hidden /> Fingerprinting
                    </span>
                  ),
                  content: (
                    <StudioPanel
                      title="Fingerprinting"
                      description="Optional. Checks each track against AcoustID's public database of released music, so you get a heads-up if it matches something already out there — nothing is blocked either way. Every upload is checked automatically; use the buttons below only to re-check a track you just replaced, or to check one on demand."
                    >
                      {(() => {
                        const fingerprintable = (release.tracks ?? []).filter(
                          (t) => t.sourceKey,
                        );
                        if (fingerprintable.length === 0) {
                          return (
                            <EmptyState
                              size="sm"
                              title="No tracks have audio uploaded yet"
                              description="Fingerprinting needs a track's audio file on file first."
                            />
                          );
                        }
                        return (
                          <div className="flex flex-col gap-3">
                            {fingerprintable.map((t) => (
                              <FingerprintTrackPanel
                                key={t.id}
                                releaseId={id}
                                track={t}
                                onUpdated={(match) =>
                                  updateTrackFingerprint(t.id, match)
                                }
                              />
                            ))}
                          </div>
                        );
                      })()}
                    </StudioPanel>
                  ),
                },
                {
                  id: 'export',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Share2Icon size={15} aria-hidden />
                      Export
                    </span>
                  ),
                  content: (
                    <StudioPanel
                      title="Export release"
                      description="Prepare this release for MusicBrainz and manage its distribution metadata."
                    >
                      <MusicBrainzSubmissionAssistant
                        mode="release"
                        title={release.title}
                        artistName={user?.displayName ?? ''}
                        releaseDate={release.releaseDate}
                        barcode={release.upc}
                        tracks={release.tracks}
                      />
                    </StudioPanel>
                  ),
                },
              ]}
            />
          </>
        )}
      </div>
    </StudioGate>
  );
}

function ReleaseTrackRow({
  track,
  shopUrl,
}: {
  track: NonNullable<StudioRelease['tracks']>[number];
  shopUrl?: string;
}) {
  const play = usePlayerStore((state) => state.play);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [embed, setEmbed] = useState<{
    provider: 'HEARTHIS' | 'MIXCLOUD' | 'SPOTIFY' | 'BANDCAMP';
    uri: string;
  } | null>(null);

  useEffect(() => {
    if (!track.archiveItemId) {
      return;
    }
    const archiveId = track.archiveItemId;
    void fetchStudioArchiveItem(archiveId).then((result) => {
      if (result.data.embedProvider && result.data.embedUri) {
        setEmbed({
          provider: result.data.embedProvider,
          uri: result.data.embedUri,
        });
        return;
      }
      void fetchEditorSource(archiveId).then((source) =>
        setSourceUrl(source.data.url),
      );
    });
  }, [track.archiveItemId]);

  if (embed) {
    return (
      <EmbedTrackRow
        title={track.title}
        provider={embed.provider}
        embedUri={embed.uri}
      />
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-2">
      <span className="min-w-0 flex-1 truncate">{track.title}</span>
      {sourceUrl ? (
        <Button
          size="icon-sm"
          variant="secondary"
          aria-label={`Play ${track.title}`}
          title={`Play ${track.title}`}
          onClick={() =>
            play({
              id: `archive:${track.archiveItemId}`,
              kind: 'archive',
              title: track.title,
              artist: 'You',
              streamUrl: sourceUrl,
              protocol: sourceUrl.includes('.m3u8') ? 'hls' : 'https',
            })
          }
        >
          <PlayIcon size={15} aria-hidden />
        </Button>
      ) : null}
      {track.archiveItemId ? (
        <Link
          to="/studio/archive/$id/editor"
          params={{ id: track.archiveItemId }}
          className="text-primary text-xs underline"
        >
          editor
        </Link>
      ) : null}
      {shopUrl ? (
        <a
          href={shopUrl}
          target="_blank"
          rel="noreferrer"
          className="border-border inline-flex size-7 items-center justify-center overflow-hidden rounded border"
          aria-label={`Open ${track.title} on Bandcamp`}
          title="Open on Bandcamp"
        >
          <SourceServiceIcon id="bandcamp" size="detail" />
        </a>
      ) : null}
    </li>
  );
}

function ReleaseSmartLinksPanel({
  release,
  spotify,
  bandcamp,
  onSpotifyChange,
  onBandcampChange,
  onTargetsSaved,
  onMessage,
  onReleaseChange,
}: {
  release: StudioRelease;
  spotify: string;
  bandcamp: string;
  onSpotifyChange: (value: string) => void;
  onBandcampChange: (value: string) => void;
  onTargetsSaved: (targets: Record<string, string>) => void;
  onMessage: (message: string) => void;
  onReleaseChange: (release: StudioRelease) => void;
}) {
  const [targets, setTargets] = useState<Record<string, string>>(
    release.smartLinkTargets ?? {},
  );
  const [tracks, setTracks] = useState(release.tracks ?? []);
  const [archive, setArchive] = useState<StudioArchiveItem[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [contentType, setContentType] = useState('ALL');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setTargets(release.smartLinkTargets ?? {});
    setTracks(release.tracks ?? []);
  }, [release]);

  useEffect(() => {
    void fetchStudioArchive().then((result) => setArchive(result.data));
  }, []);

  const filteredArchive = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return archive.filter((item) => {
      const matchesType =
        contentType === 'ALL' || item.contentType === contentType;
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.artistName, item.genre, item.contentType]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [archive, contentType, query]);

  const saveTargets = async () => {
    const cleaned = Object.fromEntries(
      Object.entries(targets).filter(([, value]) => value.trim()),
    );
    const result = await patchStudioRelease(release.id, {
      smartLinkTargets: cleaned,
    });
    if (!result.ok) {
      onMessage(result.error);
      return;
    }
    onTargetsSaved(cleaned);
    onMessage('Smart-link targets saved.');
  };

  const moveTrack = async (trackId: string, targetId: string) => {
    if (trackId === targetId) {
      return;
    }
    const from = tracks.findIndex((track) => track.id === trackId);
    const to = tracks.findIndex((track) => track.id === targetId);
    if (from < 0 || to < 0) {
      return;
    }
    const next = [...tracks];
    const [moved] = next.splice(from, 1);
    if (!moved) {
      return;
    }
    next.splice(to, 0, moved);
    const result = await reorderStudioReleaseTracks(
      release.id,
      next.map((track) => track.id),
    );
    if (!result.ok) {
      onMessage(result.error);
      return;
    }
    setTracks(next.map((track, index) => ({ ...track, position: index + 1 })));
    onReleaseChange({
      ...release,
      tracks: next.map((track, index) => ({ ...track, position: index + 1 })),
    });
  };

  const removeTrack = async (trackId: string) => {
    const result = await removeStudioReleaseTrack(release.id, trackId);
    if (!result.ok) {
      onMessage(result.error);
      return;
    }
    const next = tracks.filter((track) => track.id !== trackId);
    setTracks(next.map((track, index) => ({ ...track, position: index + 1 })));
    onReleaseChange({
      ...release,
      tracks: next.map((track, index) => ({ ...track, position: index + 1 })),
    });
    onMessage('Track removed from release.');
  };

  const addArchiveItem = async (item: StudioArchiveItem) => {
    if (tracks.some((track) => track.archiveItemId === item.id)) {
      return;
    }
    const result = await addStudioReleaseTrack(release.id, {
      title: item.title,
      archiveItemId: item.id,
      durationSec: item.durationSec,
    });
    if (!result.ok) {
      onMessage(result.error);
      return;
    }
    const next = [...tracks, result.data];
    setTracks(next);
    onReleaseChange({ ...release, tracks: next });
    onMessage(`${item.title} added to release.`);
  };

  const targetValue = (key: string) =>
    key === 'spotify'
      ? spotify
      : key === 'bandcamp'
        ? bandcamp
        : (targets[key] ?? '');
  const updateTarget = (key: string, value: string) => {
    if (key === 'spotify') {
      onSpotifyChange(value);
    }
    if (key === 'bandcamp') {
      onBandcampChange(value);
    }
    setTargets((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      <StudioPanel
        title="Smart-link destinations"
        description="Add the services where listeners can hear this release. Empty destinations stay hidden on the public smart-link page."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {SMART_LINK_TARGETS.map((target) => (
            <Input
              key={target.key}
              label={target.label}
              placeholder={target.placeholder}
              value={targetValue(target.key)}
              onChange={(event) => updateTarget(target.key, event.target.value)}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => void saveTargets()}>
            Save destinations
          </Button>
          <Link to="/r/$slug" params={{ slug: release.smartLinkSlug }}>
            <Button
              size="icon-sm"
              variant="text"
              aria-label="Open smart link"
              title="Open smart link"
            >
              <ExternalLinkIcon size={16} aria-hidden />
            </Button>
          </Link>
          <span className="text-foreground-secondary text-xs">
            {release.smartLinkViewCount ?? 0} views · /r/{release.smartLinkSlug}
          </span>
        </div>
      </StudioPanel>

      <StudioPanel
        title="Smart-link playlist"
        description="Arrange the release order, play a track, remove it, or add audio from your library."
      >
        {tracks.length === 0 ? (
          <EmptyState
            size="sm"
            title="No tracks yet"
            description="Add tracks from your library to build this release."
          />
        ) : (
          <ol className="flex flex-col gap-2">
            {tracks.map((track, index) => (
              <li
                key={track.id}
                draggable
                onDragStart={() => setDraggedId(track.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedId) {
                    void moveTrack(draggedId, track.id);
                  }
                  setDraggedId(null);
                }}
                className="border-border bg-background-secondary/30 flex items-center gap-2 rounded-md border px-2 py-2"
              >
                <GripVerticalIcon
                  size={16}
                  className="text-foreground-secondary shrink-0"
                  aria-label="Drag to reorder"
                />
                <span className="text-foreground-secondary w-5 text-xs">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {track.title}
                </span>
                <ReleaseTrackRow track={track} shopUrl={targets.bandcamp} />
                <Button
                  size="icon-sm"
                  variant="text"
                  aria-label={`Remove ${track.title}`}
                  title="Remove from release"
                  onClick={() => void removeTrack(track.id)}
                >
                  <Trash2Icon size={15} aria-hidden />
                </Button>
              </li>
            ))}
          </ol>
        )}
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => setLibraryOpen(true)}
        >
          <PlusIcon size={16} aria-hidden /> Add tracks from library
        </Button>
      </StudioPanel>

      <Dialog.Root isOpen={libraryOpen} onClose={() => setLibraryOpen(false)}>
        <Dialog.Title>Add tracks from library</Dialog.Title>
        <Dialog.Description>
          Search your sounds and add them to this release.
        </Dialog.Description>
        <div className="flex flex-wrap gap-2 py-3">
          <Input
            label="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label className="text-foreground-secondary flex flex-col gap-1 text-xs uppercase">
            <span>Type</span>
            <select
              value={contentType}
              onChange={(event) => setContentType(event.target.value)}
              className="border-border bg-background text-foreground h-10 rounded-md border px-2 text-sm normal-case"
            >
              <option value="ALL">All content</option>
              {[
                ...new Set(
                  archive.map((item) => item.contentType).filter(Boolean),
                ),
              ].map((type) => (
                <option key={type} value={type ?? ''}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <SearchIcon
            size={16}
            className="text-foreground-secondary mt-7"
            aria-hidden
          />
          <FilterIcon
            size={16}
            className="text-foreground-secondary mt-7"
            aria-hidden
          />
        </div>
        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {filteredArchive.map((item) => {
            const alreadyAdded = tracks.some(
              (track) => track.archiveItemId === item.id,
            );
            return (
              <button
                key={item.id}
                type="button"
                disabled={alreadyAdded}
                onClick={() => void addArchiveItem(item)}
                className="border-border hover:bg-background-secondary flex items-center gap-2 rounded border px-3 py-2 text-left text-sm disabled:opacity-50"
              >
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <span className="text-foreground-secondary text-xs">
                  {item.contentType ?? 'Sound'}
                </span>
                {alreadyAdded ? (
                  <span className="text-xs">Added</span>
                ) : (
                  <PlusIcon size={15} aria-hidden />
                )}
              </button>
            );
          })}
          {filteredArchive.length === 0 && (
            <p className="text-foreground-secondary py-6 text-sm">
              No library items match.
            </p>
          )}
        </div>
        <Dialog.Actions>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Root>
    </div>
  );
}
