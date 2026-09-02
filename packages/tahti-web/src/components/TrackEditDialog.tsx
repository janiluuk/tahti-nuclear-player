import { Link } from '@tanstack/react-router';
import {
  ArrowUpFromLineIcon,
  AudioLinesIcon,
  DownloadIcon,
  GaugeIcon,
  ListMusicIcon,
  PauseIcon,
  PlayIcon,
  ScissorsIcon,
  Settings2Icon,
  Share2Icon,
  TagsIcon,
  Wand2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  CreatableCombobox,
  Dialog,
  Input,
  SaveButton,
  Select,
  Tabs,
  Toggle,
} from '@tahti-player/ui';

import {
  activateArchiveVersion,
  fetchArchiveVersions,
  type ArchiveVersion,
} from '../api/archive-versions';
import { parseCredits } from '../api/distribution';
import { fetchHearthisTrackById } from '../api/sources';
import {
  fetchEditorDraft,
  fetchEditorSource,
  fetchMyRadioSubmissions,
  fetchStudioArchiveItem,
  patchStudioArchiveItem,
  renderEditorDraft,
  submitTrackToRadioRotation,
  uploadArchiveBanner,
  type RadioSubmission,
} from '../api/studio';
import type {
  EditList,
  StudioArchiveItem,
  StudioArchivePatch,
  TracklistEntry,
  TracklistOverlaySettings,
} from '../api/studio-types';
import { createDefaultEditList } from '../api/studio-types';
import { autoTrimCuts } from '../lib/autoTrimCuts';
import { capitalizeGenre, PRESET_GENRES } from '../lib/genres';
import { useMasteringFeatureStore } from '../plugins/mastering/store';
import { usePlayerStore } from '../stores/playerStore';
import { AddToPlaylistPanel } from './AddToPlaylistPanel';
import {
  AudienceVisibilitySection,
  type TrackVisibility,
} from './AudienceVisibilitySection';
import { BackdropUploadButton } from './BackdropUploadButton';
import { MentionTextarea } from './MentionTextarea';
import { MusicBrainzSubmissionAssistant } from './MusicBrainzSubmissionAssistant';
import { PageLoading } from './PageStates';
import { RoundImageUploadButton } from './RoundImageUploadButton';
import { SubgenreTagInput } from './SubgenreTagInput';
import { WaveformSeekbar } from './tahti/WaveformSeekbar';
import { TrackCreditsEditor } from './TrackCreditsEditor';
import { TrackExportConnections } from './TrackExportConnections';
import { TrackExportPanel } from './TrackExportPanel';
import { TracklistEditor } from './TracklistEditor';

function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) {
    return '0:00';
  }
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Tab = 'basics' | 'tracklist' | 'audio' | 'sharing' | 'export' | 'advanced';

type Props = {
  archiveItemId: string | null;
  onClose: () => void;
  onSaved?: (item: StudioArchiveItem) => void;
};

const CONTENT_TYPES = [
  ['TRACK', 'Track'],
  ['DJ_SET', 'DJ Set'],
  ['PODCAST', 'Podcast'],
  ['REMIX', 'Remix'],
  ['SHOW', 'Radio show'],
  ['EPISODE', 'Episode'],
  ['CLIP', 'Audio clip'],
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
  'sharing',
  'export',
  'advanced',
];

export function TrackEditDialog({ archiveItemId, onClose, onSaved }: Props) {
  const masteringEnabled = useMasteringFeatureStore((state) => state.enabled);
  const play = usePlayerStore((state) => state.play);
  const setPlayerStatus = usePlayerStore((state) => state.setStatus);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const currentId = usePlayerStore((state) => state.currentId);
  const playerStatus = usePlayerStore((state) => state.status);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);
  const isOpen = Boolean(archiveItemId);
  const [tab, setTab] = useState<Tab>('basics');
  const [item, setItem] = useState<StudioArchiveItem | null>(null);
  const [form, setForm] = useState<StudioArchivePatch>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  // Only the initial load failure stays inline — it can leave the dialog
  // with nothing else to show. Save/upload/submit results go to a toast
  // instead of a message left sitting in the form (see save() and the
  // radio-submission handler below).
  const [loadError, setLoadError] = useState<string | null>(null);
  const [radioSubmission, setRadioSubmission] =
    useState<RadioSubmission | null>(null);
  const [submittingToRadio, setSubmittingToRadio] = useState(false);
  const [downloadingEmbed, setDownloadingEmbed] = useState(false);
  const [editList, setEditList] = useState<EditList | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [versions, setVersions] = useState<ArchiveVersion[]>([]);
  const [versionBusy, setVersionBusy] = useState<string | null>(null);
  const [quickBusy, setQuickBusy] = useState<'normalize' | 'trim' | null>(null);
  const [playBusy, setPlayBusy] = useState(false);
  const isDjMix = form.contentType === 'DJ_SET';
  const isAudioClip = form.contentType === 'CLIP';
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
    setLoadError(null);
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
          subGenres: res.data.subGenres ?? [],
          credits: parseCredits(res.data.credits ?? []),
          contentType: res.data.contentType ?? 'TRACK',
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
          backgroundUrl: res.data.backgroundUrl ?? '',
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
          setLoadError(
            err instanceof Error ? err.message : 'Track load failed',
          );
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

  const reloadVersions = () => {
    if (!archiveItemId) {
      return;
    }
    void fetchArchiveVersions(archiveItemId).then((r) => setVersions(r.data));
  };

  useEffect(() => {
    if (!archiveItemId) {
      setEditList(null);
      setPeaks([]);
      setVersions([]);
      return;
    }
    let cancelled = false;
    void fetchEditorDraft(archiveItemId).then((res) => {
      if (cancelled) {
        return;
      }
      setEditList(res.data.editList);
      const level = res.data.editorPeaks?.levels?.[0];
      setPeaks(level && level.length > 0 ? level : []);
    });
    void fetchArchiveVersions(archiveItemId).then((r) => {
      if (!cancelled) {
        setVersions(r.data);
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

  const downloadHearthisEmbed = async () => {
    if (
      !item ||
      item.embedProvider !== 'HEARTHIS' ||
      !item.embedUri ||
      !form.downloadsEnabled
    ) {
      return;
    }
    setDownloadingEmbed(true);
    const track = await fetchHearthisTrackById(item.embedUri);
    setDownloadingEmbed(false);
    if (!track?.streamUrl) {
      toast.error('This HearThis track is not available for download.');
      return;
    }
    const link = document.createElement('a');
    link.href = track.streamUrl;
    link.download = `${item.title || 'hearthis-track'}.audio`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isCurrentPlayable = currentId === `archive:${archiveItemId}`;
  const isPlaying =
    isCurrentPlayable &&
    (playerStatus === 'playing' || playerStatus === 'loading');

  const startPlayback = async (startAt?: number) => {
    if (!item || !archiveItemId) {
      return;
    }
    const playableId = `archive:${archiveItemId}`;
    if (currentId === playableId) {
      if (startAt !== undefined) {
        seekTo(startAt);
      }
      setPlayerStatus('playing');
      return;
    }
    setPlayBusy(true);
    const { data } = await fetchEditorSource(archiveItemId);
    setPlayBusy(false);
    play({
      id: playableId,
      kind: 'archive',
      title: item.title,
      artist: item.artistName || '',
      coverUrl: item.bannerUrl ?? undefined,
      streamUrl: data.url,
      protocol: data.url.includes('.m3u8') ? 'hls' : 'https',
    });
    if (startAt !== undefined) {
      seekTo(startAt);
    }
  };

  const runQuickEdit = async (
    kind: 'normalize' | 'trim',
    next: EditList,
    label: string,
  ) => {
    if (!archiveItemId) {
      return;
    }
    setQuickBusy(kind);
    const result = await renderEditorDraft(archiveItemId, next, label);
    setQuickBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setEditList(next);
    toast.success('Queued as a new version — activate it below when ready.');
    reloadVersions();
  };

  const onNormalize = () => {
    const base = editList ?? createDefaultEditList(item?.durationSec ?? 180);
    void runQuickEdit(
      'normalize',
      { ...base, loudnorm: { ...base.loudnorm, enabled: true } },
      'Quick normalize',
    );
  };

  const onAutoTrim = () => {
    const base = editList ?? createDefaultEditList(item?.durationSec ?? 180);
    const cuts = autoTrimCuts(peaks, base.sourceDuration);
    if (cuts.length === 0) {
      toast.info('No leading/trailing silence detected.');
      return;
    }
    void runQuickEdit(
      'trim',
      { ...base, cuts: [...base.cuts, ...cuts] },
      'Quick auto-trim',
    );
  };

  const onActivateVersion = (versionId: string) => {
    if (!archiveItemId) {
      return;
    }
    setVersionBusy(versionId);
    void activateArchiveVersion(archiveItemId, versionId).then((result) => {
      setVersionBusy(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setVersions(result.data);
      toast.success('Switched to that version.');
    });
  };

  const save = async () => {
    if (!archiveItemId || !item || !form.title?.trim()) {
      return;
    }
    setSaving(true);
    const { license, ...metadata } = form;
    const trimmedCredits = (form.credits ?? [])
      .map((credit) => {
        const handle = credit.artistUsername
          ?.trim()
          .replace(/^@/, '')
          .toLowerCase();
        return {
          role: credit.role,
          name: credit.name.trim(),
          ...(handle && /^[a-z0-9_-]{2,32}$/.test(handle)
            ? { artistUsername: handle }
            : {}),
        };
      })
      .filter((credit) => credit.name.length > 0);
    const result = await patchStudioArchiveItem(archiveItemId, {
      ...metadata,
      ...(license ? { license } : {}),
      title: form.title.trim(),
      artistName: form.artistName?.trim() || null,
      credits: trimmedCredits,
      genre: form.genre?.trim() || null,
      isPublic: form.visibility === 'PUBLIC',
      releaseDate: form.releaseDate || null,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setItem(result.data);
    setForm((current) => ({
      ...current,
      title: result.data.title,
      description: result.data.description ?? '',
      artistName: result.data.artistName ?? '',
      genre: result.data.genre ?? '',
      subGenres: result.data.subGenres ?? [],
      credits: parseCredits(result.data.credits ?? []),
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
      backgroundUrl: result.data.backgroundUrl ?? '',
      tracklist: result.data.tracklist ?? [],
      fanTierIds: result.data.fanTierIds ?? current.fanTierIds ?? [],
      tracklistOverlay: result.data.tracklistOverlay ?? {
        enabled: false,
        preset: 'cards',
      },
    }));
    toast.success('Track details saved.');
    onSaved?.(result.data);
  };

  return (
    <>
      <Dialog.Root isOpen={isOpen} onClose={onClose} className="max-w-4xl">
        <Dialog.Title>Edit track</Dialog.Title>
        <Dialog.Description>
          {item ? `Manage “${item.title}”` : 'Loading track…'}
        </Dialog.Description>

        {loading ? (
          <PageLoading label="Loading track…" />
        ) : item ? (
          <Tabs
            className="mt-3"
            listClassName="border-border border-b pb-3"
            panelClassName="pt-3"
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
                    <div className="sm:col-span-2">
                      <BackdropUploadButton
                        label="Backdrop"
                        value={form.backgroundUrl}
                        onChange={(backgroundUrl) =>
                          setForm({ ...form, backgroundUrl })
                        }
                      />
                      <div className="-mt-10 ml-3 flex">
                        <RoundImageUploadButton
                          label="Cover art"
                          value={form.bannerUrl}
                          sizeClassName="h-20 w-20"
                          className="ring-background ring-4"
                          upload={(file) =>
                            uploadArchiveBanner(archiveItemId!, file).then(
                              (r) =>
                                r.ok
                                  ? { ok: true as const, data: { url: r.url } }
                                  : r,
                            )
                          }
                          onChange={updateArtwork}
                        />
                      </div>
                    </div>
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
                        <Input
                          type="date"
                          label="Release date"
                          value={form.releaseDate ?? ''}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              releaseDate: event.target.value,
                            })
                          }
                        />
                        <div className="sm:col-span-2">
                          <SubgenreTagInput
                            value={form.subGenres ?? []}
                            onChange={(subGenres) =>
                              setForm({ ...form, subGenres })
                            }
                          />
                        </div>
                      </>
                    ) : null}
                    <Select
                      label="Content type"
                      value={form.contentType ?? 'TRACK'}
                      onValueChange={(value) =>
                        setForm({ ...form, contentType: value })
                      }
                      options={CONTENT_TYPES.map(([value, label]) => ({
                        id: value,
                        label,
                      }))}
                    />
                    <div className="border-border bg-background-secondary/30 flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                      <span className="font-medium">Allow downloads</span>
                      <Toggle
                        label="Allow downloads"
                        checked={form.downloadsEnabled ?? false}
                        onChange={(downloadsEnabled) =>
                          setForm({ ...form, downloadsEnabled })
                        }
                      />
                    </div>
                    {item.embedProvider === 'HEARTHIS' &&
                    form.downloadsEnabled ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={downloadingEmbed}
                        onClick={() => void downloadHearthisEmbed()}
                      >
                        <DownloadIcon
                          size={15}
                          aria-hidden
                          className="mr-1.5"
                        />
                        {downloadingEmbed
                          ? 'Preparing download…'
                          : 'Download from HearThis'}
                      </Button>
                    ) : null}
                    <div className="border-border bg-background-secondary/30 flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                      <span className="font-medium">Allow comments</span>
                      <Toggle
                        label="Allow comments"
                        checked={form.commentsEnabled ?? true}
                        onChange={(commentsEnabled) =>
                          setForm({ ...form, commentsEnabled })
                        }
                      />
                    </div>
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
                      {!item.embedUri && item.status === 'READY' && (
                        <div className="border-border mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 text-xs sm:grid-cols-3">
                          <div>
                            <span className="text-foreground-secondary block">
                              Format
                            </span>
                            <span className="font-medium">
                              {item.sourceFormat?.toUpperCase() ?? '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground-secondary block">
                              Sample rate
                            </span>
                            <span className="font-medium">
                              {item.sourceSampleRateHz
                                ? `${(item.sourceSampleRateHz / 1000).toLocaleString('en-US')} kHz`
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground-secondary block">
                              Bit depth
                            </span>
                            <span className="font-medium">
                              {item.sourceBitDepth
                                ? `${item.sourceBitDepth}-bit`
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground-secondary block">
                              Channels
                            </span>
                            <span className="font-medium">
                              {item.sourceChannels === 1
                                ? 'Mono'
                                : item.sourceChannels === 2
                                  ? 'Stereo'
                                  : item.sourceChannels
                                    ? `${item.sourceChannels} channels`
                                    : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground-secondary block">
                              Bitrate
                            </span>
                            <span className="font-medium">
                              {item.sourceBitrateKbps
                                ? `${item.sourceBitrateKbps} kbps`
                                : item.sourceFormat?.toUpperCase() === 'FLAC'
                                  ? 'Lossless'
                                  : '—'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {!item.embedUri && (
                      <>
                        <div className="flex flex-col gap-2">
                          <WaveformSeekbar
                            trackId={item.id}
                            peaks={peaks}
                            progress={
                              isCurrentPlayable && playerDuration > 0
                                ? currentTime / playerDuration
                                : 0
                            }
                            className="h-16"
                            onSeek={(fraction) =>
                              void startPlayback(
                                fraction *
                                  (editList?.sourceDuration ??
                                    item.durationSec ??
                                    0),
                              )
                            }
                          />
                          <div className="text-foreground-secondary flex justify-between text-xs tabular-nums">
                            <span>
                              {isCurrentPlayable
                                ? formatTime(currentTime)
                                : '0:00'}
                            </span>
                            <span>
                              {formatTime(
                                editList?.sourceDuration ??
                                  item.durationSec ??
                                  0,
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            size="icon-sm"
                            disabled={playBusy}
                            onClick={() =>
                              void (isPlaying
                                ? setPlayerStatus('paused')
                                : startPlayback())
                            }
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            title={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying ? (
                              <PauseIcon size={16} aria-hidden />
                            ) : (
                              <PlayIcon size={16} aria-hidden />
                            )}
                          </Button>
                          <span
                            className="bg-border mx-1 h-6 w-px"
                            aria-hidden
                          />
                          <Button
                            size="icon-sm"
                            variant="secondary"
                            disabled={quickBusy !== null}
                            onClick={onNormalize}
                            aria-label="Normalize audio"
                            title={
                              quickBusy === 'normalize'
                                ? 'Normalizing…'
                                : 'Normalize audio'
                            }
                          >
                            <GaugeIcon size={16} aria-hidden />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="secondary"
                            disabled={quickBusy !== null}
                            onClick={onAutoTrim}
                            aria-label="Trim silence"
                            title={
                              quickBusy === 'trim'
                                ? 'Trimming silence…'
                                : 'Trim silence'
                            }
                          >
                            <ScissorsIcon size={16} aria-hidden />
                          </Button>
                          <span
                            className="bg-border mx-1 h-6 w-px"
                            aria-hidden
                          />
                          <Link
                            to="/studio/archive/$id/editor"
                            params={{ id: item.id }}
                          >
                            <Button
                              size="icon-sm"
                              variant="text"
                              aria-label="Open full audio editor"
                              title="Open full audio editor"
                            >
                              <AudioLinesIcon size={16} aria-hidden />
                            </Button>
                          </Link>
                          {masteringEnabled && (
                            <Link
                              to="/studio/mastering/$id"
                              params={{ id: item.id }}
                            >
                              <Button
                                size="icon-sm"
                                variant="text"
                                aria-label="Match to a reference track"
                                title="Match to a reference track"
                              >
                                <Wand2Icon size={16} aria-hidden />
                              </Button>
                            </Link>
                          )}
                        </div>

                        {versions.length > 1 && (
                          <div className="flex flex-col gap-2">
                            <p className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
                              Revisions
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {versions
                                .slice()
                                .reverse()
                                .map((v) => (
                                  <li
                                    key={v.id}
                                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        v{v.versionNumber} — {v.versionLabel}
                                        {v.isActive && (
                                          <span className="text-primary ml-2 text-xs uppercase">
                                            Active
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-foreground-secondary text-xs">
                                        {v.status}
                                        {v.durationSec
                                          ? ` · ${formatTime(v.durationSec)}`
                                          : ''}
                                        {v.sourceFormat
                                          ? ` · ${v.sourceFormat.toUpperCase()}`
                                          : ''}
                                        {v.sourceBitDepth
                                          ? ` · ${v.sourceBitDepth}-bit`
                                          : ''}
                                        {v.sourceSampleRateHz
                                          ? ` · ${(v.sourceSampleRateHz / 1000).toLocaleString('en-US')} kHz`
                                          : ''}
                                        {' · '}
                                        {new Date(v.createdAt).toLocaleString()}
                                      </div>
                                    </div>
                                    {!v.isActive && v.status === 'READY' && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={versionBusy === v.id}
                                        onClick={() => onActivateVersion(v.id)}
                                      >
                                        {versionBusy === v.id
                                          ? 'Switching…'
                                          : 'Use this version'}
                                      </Button>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ),
              },
              {
                id: 'sharing',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Share2Icon size={15} aria-hidden />
                    Sharing
                  </span>
                ),
                content: (
                  <div className="flex flex-col gap-4">
                    <p className="text-foreground-secondary text-sm">
                      Choose where this track can appear and whether it can be
                      selected for shared programming.
                    </p>
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
                    {!isAudioClip ? (
                      <div className="border-border bg-background-secondary/40 flex flex-col gap-3 rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-3 text-sm">
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
                          <Toggle
                            label="Add to my channel's rotation"
                            checked={form.isFallback ?? false}
                            onChange={(isFallback) =>
                              setForm({ ...form, isFallback })
                            }
                          />
                        </div>

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
                                    toast.success(
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
                                    toast.error(result.error);
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
                    <div className="border-border flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                      <span>
                        <span className="block font-medium">
                          Allow discovery analytics and top lists
                        </span>
                        <span className="text-foreground-secondary block text-xs">
                          Allow eligible listener activity to contribute to
                          discovery lists.
                        </span>
                      </span>
                      <Toggle
                        label="Allow discovery analytics and top lists"
                        checked={form.topListsEligible ?? true}
                        onChange={(topListsEligible) =>
                          setForm({ ...form, topListsEligible })
                        }
                      />
                    </div>
                    <div className="border-border flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                      <span>
                        <span className="block font-medium">
                          Allow Tahti Selects
                        </span>
                        <span className="text-foreground-secondary block text-xs">
                          Let the Tahti team consider this track for curated
                          Tahti Selects programming.
                        </span>
                      </span>
                      <Toggle
                        label="Allow Tahti Selects"
                        checked={form.selectsOptIn ?? false}
                        onChange={(selectsOptIn) =>
                          setForm({ ...form, selectsOptIn })
                        }
                      />
                    </div>
                    <SaveButton
                      saving={saving}
                      disabled={!form.title?.trim()}
                      onClick={() => void save()}
                    />
                  </div>
                ),
              },
              {
                id: 'export',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowUpFromLineIcon size={15} aria-hidden />
                    Export
                  </span>
                ),
                content: (
                  <div className="flex flex-col gap-4">
                    <TrackExportPanel archiveItemId={item.id} />
                    <TrackExportConnections />
                  </div>
                ),
              },
              {
                id: 'advanced',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Settings2Icon size={15} aria-hidden />
                    Advanced
                  </span>
                ),
                content: (
                  <div className="flex flex-col gap-4">
                    <Select
                      label="License (optional)"
                      value={form.license ?? ''}
                      onValueChange={(value) =>
                        setForm({ ...form, license: value })
                      }
                      options={LICENSES.map(([value, label]) => ({
                        id: value,
                        label,
                      }))}
                    />
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
                    <TrackCreditsEditor
                      value={form.credits ?? []}
                      onChange={(credits) => setForm({ ...form, credits })}
                    />
                  </div>
                ),
              },
            ]}
          />
        ) : null}

        {loadError && (
          <p className="text-accent-red mt-3 text-sm" role="alert">
            {loadError}
          </p>
        )}

        <Dialog.Actions>
          <Dialog.Close>Close</Dialog.Close>
          {item ? (
            <SaveButton
              disabled={!form.title?.trim()}
              saving={saving}
              label="Save changes"
              onClick={() => void save()}
            />
          ) : null}
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
