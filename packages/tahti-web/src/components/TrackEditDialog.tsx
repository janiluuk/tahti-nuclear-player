import { Link } from '@tanstack/react-router';
import {
  AudioLinesIcon,
  ImageIcon,
  ListMusicIcon,
  TagsIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Button,
  CreatableCombobox,
  Dialog,
  FilePicker,
  Input,
  SaveButton,
  Tabs,
} from '@nuclearplayer/ui';

import {
  fetchMyRadioSubmissions,
  fetchStudioArchive,
  fetchStudioArchiveItem,
  patchStudioArchiveItem,
  submitTrackToRadioRotation,
  uploadArchiveBanner,
  type RadioSubmission,
} from '../api/studio';
import type {
  StudioArchiveItem,
  StudioArchivePatch,
  TracklistEntry,
  TracklistOverlaySettings,
} from '../api/studio-types';
import { capitalizeGenre, PRESET_GENRES } from '../lib/genres';
import { AddToPlaylistPanel } from './AddToPlaylistPanel';
import {
  AudienceVisibilitySection,
  type TrackVisibility,
} from './AudienceVisibilitySection';
import { ImageUploadField } from './ImageUploadField';
import { MentionTextarea } from './MentionTextarea';
import { MusicBrainzSubmissionAssistant } from './MusicBrainzSubmissionAssistant';
import { PageLoading } from './PageStates';
import { TrackExportPanel } from './TrackExportPanel';
import { TracklistEditor } from './TracklistEditor';

type Tab =
  | 'basics'
  | 'tracklist'
  | 'audio'
  | 'visuals'
  | 'sharing'
  | 'advanced';

type Props = {
  archiveItemId: string | null;
  onClose: () => void;
  onSaved?: (item: StudioArchiveItem) => void;
};

const CONTENT_TYPES = [
  ['STUDIO', 'Studio track'],
  ['LIVE', 'Live recording'],
  ['DJ_MIX', 'DJ set'],
  ['PODCAST', 'Podcast'],
  ['ORIGINAL', 'Original'],
  ['REMIX', 'Remix'],
  ['RADIO_SHOW', 'Radio show'],
  ['AUDIOCLIPS', 'Audio clip'],
] as const;

const LICENSES = [
  ['', 'No license (default)'],
  ['ALL_RIGHTS_RESERVED', 'All rights reserved'],
  ['CC0', 'No rights reserved (CC0)'],
  ['CC_BY', 'Creative Commons Attribution (CC BY)'],
  ['CC_BY_SA', 'Creative Commons Attribution-ShareAlike (CC BY-SA)'],
  ['CC_BY_NC', 'Creative Commons Attribution-NonCommercial (CC BY-NC)'],
  [
    'CC_BY_NC_SA',
    'Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)',
  ],
  [
    'CC_BY_NC_ND',
    'Creative Commons Attribution-NonCommercial-NoDerivatives (CC BY-NC-ND)',
  ],
] as const;

const TAB_ORDER: Tab[] = [
  'basics',
  'tracklist',
  'audio',
  'visuals',
  'sharing',
  'advanced',
];

export function TrackEditDialog({ archiveItemId, onClose, onSaved }: Props) {
  const isOpen = Boolean(archiveItemId);
  const [tab, setTab] = useState<Tab>('basics');
  const [item, setItem] = useState<StudioArchiveItem | null>(null);
  const [form, setForm] = useState<StudioArchivePatch>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [artworkBusy, setArtworkBusy] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [radioSubmission, setRadioSubmission] =
    useState<RadioSubmission | null>(null);
  const [submittingToRadio, setSubmittingToRadio] = useState(false);
  const [rotationReplacement, setRotationReplacement] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const isDjMix =
    form.contentType === 'DJ_MIX' || form.contentType === 'DJ_SET';
  const isAudioClip = form.contentType === 'AUDIOCLIPS';
  const visibleTabOrder = isDjMix
    ? TAB_ORDER
    : TAB_ORDER.filter((tabId) => tabId !== 'tracklist');

  useEffect(() => {
    if (!archiveItemId) {
      setRadioSubmission(null);
      return;
    }
    void fetchMyRadioSubmissions().then(({ data }) => {
      const latest = data.find((s) => s.archiveItem.id === archiveItemId);
      setRadioSubmission(latest ?? null);
    });
  }, [archiveItemId]);

  useEffect(() => {
    if (!isDjMix && tab === 'tracklist') {
      setTab('basics');
    }
  }, [isDjMix, tab]);

  useEffect(() => {
    if (!archiveItemId) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNote(null);
    setTab('basics');
    void fetchStudioArchiveItem(archiveItemId)
      .then((res) => {
        if (cancelled) {
          return;
        }
        setItem(res.data);
        setForm({
          title: res.data.title,
          description: res.data.description ?? '',
          artistName: res.data.artistName ?? '',
          genre: res.data.genre ? capitalizeGenre(res.data.genre) : '',
          contentType: res.data.contentType ?? 'STUDIO',
          license: res.data.license ?? '',
          isPublic: res.data.isPublic ?? true,
          visibility:
            res.data.visibility ??
            (res.data.isPublic === false ? 'PRIVATE' : 'PUBLIC'),
          releaseDate: res.data.releaseDate ?? '',
          downloadsEnabled: res.data.downloadsEnabled ?? false,
          isFallback: res.data.isFallback ?? false,
          commentsEnabled: res.data.commentsEnabled ?? true,
          selectsOptIn: res.data.selectsOptIn ?? false,
          topListsEligible: res.data.topListsEligible ?? true,
          bannerUrl: res.data.bannerUrl ?? '',
          backdropUrl: res.data.backdropUrl ?? '',
          tracklist: res.data.tracklist ?? [],
          fanTierIds: res.data.fanTierIds ?? [],
          tracklistOverlay: res.data.tracklistOverlay ?? {
            enabled: false,
            preset: 'cards',
          },
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Track load failed');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [archiveItemId]);

  const updateArtwork = (url: string) => {
    setForm((current) => ({ ...current, bannerUrl: url }));
    setItem((current) => (current ? { ...current, bannerUrl: url } : current));
    if (item) {
      onSaved?.({ ...item, bannerUrl: url });
    }
  };

  const uploadArtwork = async (file: File) => {
    if (!archiveItemId) {
      return;
    }
    setArtworkBusy(true);
    setError(null);
    setNote(null);
    const result = await uploadArchiveBanner(archiveItemId, file);
    setArtworkBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    updateArtwork(result.url);
    setNote('Cover art uploaded.');
  };

  const save = async (confirmedRotationReplacement = false) => {
    if (!archiveItemId || !item || !form.title?.trim()) {
      return;
    }
    setSaving(true);
    setError(null);
    setNote(null);
    if (form.isFallback && !item.isFallback && !confirmedRotationReplacement) {
      const archive = await fetchStudioArchive();
      const rotation = archive.data
        .filter((candidate) => candidate.isFallback && candidate.id !== item.id)
        .sort(
          (left, right) =>
            new Date(left.createdAt ?? 0).getTime() -
            new Date(right.createdAt ?? 0).getTime(),
        );
      if (rotation.length >= 5 && rotation[0]) {
        setSaving(false);
        setRotationReplacement({
          id: rotation[0].id,
          title: rotation[0].title,
        });
        return;
      }
    }
    const { license, ...metadata } = form;
    const result = await patchStudioArchiveItem(archiveItemId, {
      ...metadata,
      ...(license ? { license } : {}),
      title: form.title.trim(),
      artistName: form.artistName?.trim() || null,
      genre: form.genre?.trim() || null,
      isPublic: form.visibility === 'PUBLIC',
      releaseDate: form.releaseDate || null,
      ...(rotationReplacement
        ? { replaceFallbackItemId: rotationReplacement.id }
        : {}),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setItem(result.data);
    setForm((current) => ({
      ...current,
      title: result.data.title,
      description: result.data.description ?? '',
      artistName: result.data.artistName ?? '',
      genre: result.data.genre ?? '',
      contentType: result.data.contentType ?? current.contentType,
      license: result.data.license ?? '',
      isPublic: result.data.isPublic ?? true,
      visibility:
        result.data.visibility ??
        (result.data.isPublic === false ? 'PRIVATE' : 'PUBLIC'),
      releaseDate: result.data.releaseDate ?? '',
      downloadsEnabled: result.data.downloadsEnabled ?? false,
      isFallback: result.data.isFallback ?? false,
      commentsEnabled: result.data.commentsEnabled ?? true,
      bannerUrl: result.data.bannerUrl ?? '',
      backdropUrl: result.data.backdropUrl ?? '',
      tracklist: result.data.tracklist ?? [],
      fanTierIds: result.data.fanTierIds ?? current.fanTierIds ?? [],
      tracklistOverlay: result.data.tracklistOverlay ?? {
        enabled: false,
        preset: 'cards',
      },
    }));
    setNote('Track details saved.');
    setRotationReplacement(null);
    onSaved?.(result.data);
  };

  return (
    <>
      <Dialog.Root isOpen={isOpen} onClose={onClose} className="max-w-2xl">
        <Dialog.Title>Edit track</Dialog.Title>
        <Dialog.Description>
          {item ? `Manage “${item.title}”` : 'Loading track…'}
        </Dialog.Description>

        {loading ? (
          <PageLoading label="Loading track…" />
        ) : item ? (
          <Tabs
            className="mt-3"
            selectedIndex={visibleTabOrder.indexOf(tab)}
            onChange={(index) => setTab(visibleTabOrder[index]!)}
            items={[
              {
                id: 'basics',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <TagsIcon size={15} aria-hidden />
                    Basics
                  </span>
                ),
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Title"
                      value={form.title ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                    />
                    <Input
                      label="Artist credit"
                      value={form.artistName ?? ''}
                      placeholder="Use channel artist name"
                      onChange={(event) =>
                        setForm({ ...form, artistName: event.target.value })
                      }
                    />
                    <div className="sm:col-span-2">
                      <MentionTextarea
                        label="Description"
                        rows={4}
                        value={form.description ?? ''}
                        onChange={(description) =>
                          setForm({ ...form, description })
                        }
                      />
                    </div>
                    {!isAudioClip ? (
                      <>
                        <CreatableCombobox
                          label="Genre"
                          options={[...PRESET_GENRES]}
                          value={form.genre ?? ''}
                          onValueChange={(genre) => setForm({ ...form, genre })}
                          normalize={capitalizeGenre}
                        />
                        <label className="flex flex-col gap-1 text-sm">
                          Release date
                          <input
                            type="date"
                            value={form.releaseDate ?? ''}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                releaseDate: event.target.value,
                              })
                            }
                            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                          />
                        </label>
                      </>
                    ) : null}
                    <label className="flex flex-col gap-1 text-sm">
                      Content type
                      <select
                        value={form.contentType ?? 'STUDIO'}
                        onChange={(event) =>
                          setForm({ ...form, contentType: event.target.value })
                        }
                        className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                      >
                        {CONTENT_TYPES.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      License (optional)
                      <select
                        value={form.license ?? ''}
                        onChange={(event) =>
                          setForm({ ...form, license: event.target.value })
                        }
                        className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                      >
                        {LICENSES.map(([value, label]) => (
                          <option key={value || 'none'} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <AudienceVisibilitySection
                      visibility={
                        (form.visibility ?? 'PUBLIC') as TrackVisibility
                      }
                      onVisibilityChange={(visibility) =>
                        setForm({
                          ...form,
                          visibility,
                          isPublic: visibility === 'PUBLIC',
                        })
                      }
                      tierIds={form.fanTierIds ?? []}
                      onTierIdsChange={(fanTierIds) =>
                        setForm({ ...form, fanTierIds })
                      }
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.downloadsEnabled ?? false}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            downloadsEnabled: event.target.checked,
                          })
                        }
                      />
                      Allow downloads
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.commentsEnabled ?? true}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            commentsEnabled: event.target.checked,
                          })
                        }
                      />
                      Allow comments
                    </label>

                    {!isAudioClip ? (
                      <div className="border-border bg-background-secondary/40 flex flex-col gap-3 rounded-xl border p-3 sm:col-span-2">
                        <label className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.isFallback ?? false}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                isFallback: event.target.checked,
                              })
                            }
                            className="mt-0.5"
                          />
                          <span>
                            <span className="block font-medium">
                              Add to my channel&apos;s rotation
                            </span>
                            <span className="text-foreground-secondary block text-xs">
                              Plays automatically on your channel when you
                              aren&apos;t live, so listeners always hear
                              something instead of dead air.
                            </span>
                          </span>
                        </label>

                        <div className="border-border/60 flex items-center gap-3 border-t pt-3">
                          <div className="min-w-0 flex-1 text-sm">
                            <span className="block font-medium">
                              Tahti Radio rotation
                            </span>
                            <span className="text-foreground-secondary block text-xs">
                              {radioSubmission?.status === 'PENDING'
                                ? 'Submitted — waiting on board review.'
                                : radioSubmission?.status === 'APPROVED'
                                  ? 'Approved — in the Tahti Radio rotation.'
                                  : radioSubmission?.status === 'REJECTED'
                                    ? (radioSubmission.rejectionNote ??
                                      'Not accepted this time — you can resubmit.')
                                    : 'Submit for board review to be considered for the shared 24/7 station.'}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={
                              submittingToRadio ||
                              radioSubmission?.status === 'PENDING' ||
                              radioSubmission?.status === 'APPROVED'
                            }
                            onClick={() => {
                              if (!archiveItemId) {
                                return;
                              }
                              setSubmittingToRadio(true);
                              void submitTrackToRadioRotation(archiveItemId)
                                .then((result) => {
                                  if (result.ok) {
                                    setNote(
                                      'Submitted to Tahti Radio for review.',
                                    );
                                    setRadioSubmission({
                                      id: 'pending-local',
                                      status: 'PENDING',
                                      rejectionNote: null,
                                      createdAt: new Date().toISOString(),
                                      archiveItem: {
                                        id: archiveItemId,
                                        title: form.title ?? '',
                                      },
                                    });
                                  } else {
                                    setError(result.error);
                                  }
                                })
                                .finally(() => setSubmittingToRadio(false));
                            }}
                          >
                            {submittingToRadio
                              ? 'Submitting…'
                              : radioSubmission?.status === 'PENDING'
                                ? 'Pending'
                                : radioSubmission?.status === 'APPROVED'
                                  ? 'In rotation'
                                  : radioSubmission?.status === 'REJECTED'
                                    ? 'Resubmit'
                                    : 'Submit'}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ),
              },
              ...(isDjMix
                ? [
                    {
                      id: 'tracklist' as const,
                      label: (
                        <span className="inline-flex items-center gap-1.5">
                          <ListMusicIcon size={15} aria-hidden />
                          Tracklist
                        </span>
                      ),
                      content: (
                        <TracklistEditor
                          durationSec={item.durationSec ?? 0}
                          peaks={item.peaks ?? []}
                          value={
                            (form.tracklist as TracklistEntry[] | undefined) ??
                            []
                          }
                          overlay={
                            (form.tracklistOverlay as
                              | TracklistOverlaySettings
                              | undefined) ?? {
                              enabled: false,
                              preset: 'cards',
                            }
                          }
                          onChange={(tracklist) =>
                            setForm({ ...form, tracklist })
                          }
                          onOverlayChange={(tracklistOverlay) =>
                            setForm({ ...form, tracklistOverlay })
                          }
                        />
                      ),
                    },
                  ]
                : []),
              {
                id: 'audio',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <AudioLinesIcon size={15} aria-hidden />
                    Audio
                  </span>
                ),
                content: (
                  <div className="flex flex-col gap-4">
                    <div className="border-border bg-background-secondary/40 rounded-xl border p-4">
                      <p className="font-medium">Audio source</p>
                      <p className="text-foreground-secondary mt-1 text-sm">
                        {item.embedUri
                          ? 'This track is embedded from its original source.'
                          : 'This track is stored as Tahti audio.'}
                      </p>
                      <p className="text-foreground-secondary mt-3 text-xs">
                        {item.durationSec != null
                          ? `${Math.round(item.durationSec / 60)} min · ${item.status}`
                          : 'Source details are available after processing.'}
                      </p>
                    </div>
                    {!item.embedUri && (
                      <Link
                        to="/studio/archive/$id/editor"
                        params={{ id: item.id }}
                        className="text-primary text-sm hover:underline"
                      >
                        Open audio editor →
                      </Link>
                    )}
                  </div>
                ),
              },
              {
                id: 'visuals',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ImageIcon size={15} aria-hidden />
                    Cover &amp; visuals
                  </span>
                ),
                content: (
                  <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
                    <div className="border-border bg-background-secondary flex aspect-square items-center justify-center overflow-hidden rounded-xl border">
                      {form.bannerUrl ? (
                        <img
                          src={form.bannerUrl}
                          alt="Current cover art"
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon
                          size={36}
                          className="text-foreground-secondary"
                          aria-label="No cover art"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <FilePicker
                        labels={{
                          title: 'Upload cover art',
                          description: 'JPEG, PNG, or WebP',
                          browse: 'Choose image',
                        }}
                        accept="image/jpeg,image/png,image/webp"
                        disabled={artworkBusy}
                        onFiles={(files) => {
                          const file = files[0];
                          if (file) {
                            void uploadArtwork(file);
                          }
                        }}
                      />
                      <p className="text-foreground-secondary text-xs">
                        JPEG, PNG, or WebP. Uploaded images are stored with the
                        track so the artwork stays available.
                      </p>
                      <ImageUploadField
                        label="Upload backdrop"
                        description="Wide JPEG, PNG, WebP, or GIF"
                        value={form.backdropUrl ?? ''}
                        onChange={(backdropUrl) =>
                          setForm({ ...form, backdropUrl })
                        }
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: 'sharing',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <TagsIcon size={15} aria-hidden />
                    Sharing
                  </span>
                ),
                content: (
                  <div className="flex flex-col gap-4">
                    <p className="text-foreground-secondary text-sm">
                      Choose where this track can appear and whether it can be
                      selected for shared programming.
                    </p>
                    <label className="border-border flex items-start gap-3 rounded-lg border p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={form.topListsEligible ?? true}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            topListsEligible: event.target.checked,
                          })
                        }
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-medium">
                          Allow discovery analytics and top lists
                        </span>
                        <span className="text-foreground-secondary block text-xs">
                          Allow eligible listener activity to contribute to
                          discovery lists.
                        </span>
                      </span>
                    </label>
                    <label className="border-border flex items-start gap-3 rounded-lg border p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={form.selectsOptIn ?? false}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            selectsOptIn: event.target.checked,
                          })
                        }
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-medium">
                          Allow Tahti Selects
                        </span>
                        <span className="text-foreground-secondary block text-xs">
                          Let the Tahti team consider this track for curated
                          Tahti Selects programming.
                        </span>
                      </span>
                    </label>
                    <Button
                      size="sm"
                      variant={form.isFallback ? 'secondary' : undefined}
                      className="self-start"
                      onClick={() =>
                        setForm({ ...form, isFallback: !form.isFallback })
                      }
                    >
                      {form.isFallback
                        ? 'Remove from rotation'
                        : 'Add to rotation'}
                    </Button>
                    <SaveButton
                      saving={saving}
                      disabled={!form.title?.trim()}
                      onClick={() => void save()}
                    />
                  </div>
                ),
              },
              {
                id: 'advanced',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <TagsIcon size={15} aria-hidden />
                    Advanced
                  </span>
                ),
                content: (
                  <div className="flex flex-col gap-4">
                    {!isAudioClip ? (
                      <div className="border-border flex items-center gap-4 rounded-xl border p-4">
                        <ListMusicIcon
                          size={28}
                          className="text-primary shrink-0"
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            Add this track to playlists
                          </p>
                          <p className="text-foreground-secondary text-sm">
                            Choose one or more existing playlists, or create a
                            new one.
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setPlaylistOpen(true)}>
                          <ListMusicIcon size={15} aria-hidden />
                          Choose playlists
                        </Button>
                      </div>
                    ) : null}
                    {!isAudioClip ? (
                      <MusicBrainzSubmissionAssistant
                        mode="track"
                        title={item.title}
                        artistName={item.artistName ?? ''}
                        releaseDate={item.releaseDate}
                      />
                    ) : null}
                    <TrackExportPanel archiveItemId={item.id} />
                  </div>
                ),
              },
            ]}
          />
        ) : null}

        {error && (
          <p className="text-accent-red mt-3 text-sm" role="alert">
            {error}
          </p>
        )}
        {note && (
          <p className="text-foreground-secondary mt-3 text-sm" role="status">
            {note}
          </p>
        )}

        <Dialog.Actions>
          <Dialog.Close>Close</Dialog.Close>
          {item ? (
            <SaveButton
              disabled={artworkBusy || !form.title?.trim()}
              saving={saving}
              label="Save changes"
              onClick={() => void save()}
            />
          ) : null}
        </Dialog.Actions>
      </Dialog.Root>

      <Dialog.Root
        isOpen={Boolean(rotationReplacement)}
        onClose={() => {
          setRotationReplacement(null);
          setSaving(false);
        }}
      >
        <Dialog.Title>Replace the oldest rotation track?</Dialog.Title>
        <Dialog.Description>
          Your channel rotation is full. Adding “{item?.title}” will remove “
          {rotationReplacement?.title}”, the oldest track currently in the
          rotation.
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close>Cancel</Dialog.Close>
          <Button
            onClick={() => {
              void save(true);
            }}
            disabled={saving}
          >
            {saving ? 'Replacing…' : 'Replace and add'}
          </Button>
        </Dialog.Actions>
      </Dialog.Root>

      {archiveItemId && (
        <AddToPlaylistPanel
          isOpen={playlistOpen}
          archiveItemId={archiveItemId}
          trackTitle={item?.title ?? ''}
          onClose={() => setPlaylistOpen(false)}
        />
      )}
    </>
  );
}
