import { Link } from '@tanstack/react-router';
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Clock3Icon,
  ListMusicIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SquareIcon,
  TimerIcon,
  TrendingUpIcon,
  UsersIcon,
  WifiIcon,
  WifiOffIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Dialog, FilePicker, Input, Select } from '@nuclearplayer/ui';

import {
  fetchChannelManageStats,
  fetchRtmpTargets,
  fetchSignalStatus,
  fetchStreamOverlay,
  patchStreamOverlay,
  pauseChannelRotation,
  postEndBroadcast,
  previousChannelRotation,
  resumeChannelRotation,
  skipChannelRotation,
  type ChannelManageStats,
  type RtmpTarget,
  type SignalStatus,
} from '../api/broadcast';
import { fetchChannel } from '../api/client';
import {
  fetchStudioCollection,
  fetchStudioCollections,
  patchStudioArchiveItem,
} from '../api/studio';
import {
  fetchProgramme,
  MAX_RADIO_PLAYLIST_ITEMS,
  patchProgramme,
  type ProgrammeItem,
  type ProgrammeView,
} from '../api/studio-extras';
import type { StudioCollection } from '../api/studio-types';
import { uploadUserMediaFile } from '../api/user-media';
import { multicastProviderLabel } from '../plugins/multicast';
import { ChannelRotationEditor } from './ChannelRotationEditor';

const STATS_POLL_MS = 5000;
const STREAM_POLL_MS = 15000;
const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

type RotationPlayback = {
  title: string;
  artistName: string;
  observedAt: number;
  item: ProgrammeItem | null;
};

function formatRemaining(seconds: number): string {
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  return hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-border bg-background/40 flex min-h-20 flex-col justify-center gap-1 rounded-lg border p-3">
      <div className="text-foreground-secondary flex items-center gap-1.5 text-[10px] tracking-wide uppercase">
        {icon}
        {label}
      </div>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function StreamManagerPanel({
  slug,
  channelState,
  isPlaying = false,
  onPlaybackToggle,
  onEnded,
  onRotationChange,
  readOnly = false,
}: {
  slug: string;
  channelState: string;
  isPlaying?: boolean;
  onPlaybackToggle?: () => void;
  onEnded?: () => void;
  onRotationChange?: (playing: boolean) => void;
  readOnly?: boolean;
}) {
  const [signal, setSignal] = useState<SignalStatus | null>(null);
  const [stats, setStats] = useState<ChannelManageStats | null>(null);
  const [signalError, setSignalError] = useState(false);
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [rotation, setRotation] = useState<RotationPlayback | null>(null);
  const [rotationPaused, setRotationPaused] = useState(false);
  const rotationTitleRef = useRef<string | null>(null);
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [now, setNow] = useState(Date.now());
  const [ending, setEnding] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transportBusy, setTransportBusy] = useState<
    'skip' | 'previous' | 'pause' | 'resume' | null
  >(null);
  const [collections, setCollections] = useState<StudioCollection[]>([]);
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState('');
  const [rotationBusy, setRotationBusy] = useState(false);
  const [rotationMsg, setRotationMsg] = useState<string | null>(null);
  const [liveStartedAt, setLiveStartedAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'rotation' | 'stats' | 'overlay'>(
    'rotation',
  );
  // Collapsed by default while the fallback rotation is carrying the
  // station — most visits just want to see what's playing and skip/pause
  // it, not the full stats grid and playlist-add form.
  const [rotationExpanded, setRotationExpanded] = useState(false);
  const [overlay, setOverlay] = useState({
    streamOverlayTitle: '',
    streamOverlaySubtitle: '',
    streamOverlayCoverUrl: '',
  });
  const [overlaySaving, setOverlaySaving] = useState(false);
  const [overlayCoverFile, setOverlayCoverFile] = useState<File | null>(null);
  const [overlayCoverUploading, setOverlayCoverUploading] = useState(false);
  const [overlayError, setOverlayError] = useState<string | null>(null);
  const canControl = !readOnly;

  useEffect(() => {
    if (activeTab !== 'overlay') {
      return;
    }
    setOverlayError(null);
    void fetchStreamOverlay().then((result) => {
      setOverlay({
        streamOverlayTitle: result.data.streamOverlayTitle ?? '',
        streamOverlaySubtitle: result.data.streamOverlaySubtitle ?? '',
        streamOverlayCoverUrl: result.data.streamOverlayCoverUrl ?? '',
      });
      setOverlayCoverFile(null);
    });
  }, [activeTab]);

  const saveOverlay = () => {
    setOverlaySaving(true);
    setOverlayError(null);
    void patchStreamOverlay({
      streamOverlayTitle: overlay.streamOverlayTitle.trim(),
      streamOverlaySubtitle: overlay.streamOverlaySubtitle.trim(),
      streamOverlayCoverUrl: overlay.streamOverlayCoverUrl.trim(),
    }).then((result) => {
      setOverlaySaving(false);
      if (!result.ok) {
        setOverlayError(result.error);
        return;
      }
      setActiveTab('rotation');
    });
  };

  useEffect(() => {
    void fetchStudioCollections().then((r) => setCollections(r.data));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const [signalResult, statsResult] = await Promise.all([
        fetchSignalStatus(),
        fetchChannelManageStats(slug),
      ]);
      if (!cancelled) {
        setSignal(signalResult.data);
        setStats(statsResult.data);
        setSignalError(
          signalResult.meta.source === 'api' &&
            Boolean(signalResult.meta.reason) &&
            statsResult.data == null,
        );
      }
    };
    void tick();
    const intervalId = window.setInterval(() => void tick(), STATS_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const [targetResult, programmeResult, channel] = await Promise.all([
        fetchRtmpTargets(),
        fetchProgramme(),
        fetchChannel(slug)
          .then((result) => result.data)
          .catch(() => null),
      ]);
      if (cancelled) {
        return;
      }
      setTargets(targetResult.data.filter((target) => target.enabled));
      setProgramme(programmeResult.data);
      const nowPlaying = channel?.nowPlaying;
      if (!nowPlaying) {
        setRotation(null);
        setRotationPaused(false);
        rotationTitleRef.current = null;
        return;
      }
      if (rotationTitleRef.current !== nowPlaying.title) {
        setRotationPaused(false);
        rotationTitleRef.current = nowPlaying.title;
      }
      const item =
        programmeResult.data.items.find(
          (candidate) => candidate.title === nowPlaying.title,
        ) ?? null;
      setRotation((current) =>
        current?.title === nowPlaying.title
          ? { ...current, artistName: nowPlaying.artistName, item }
          : {
              title: nowPlaying.title,
              artistName: nowPlaying.artistName,
              observedAt: Date.now(),
              item,
            },
      );
    };
    void tick();
    const intervalId = window.setInterval(() => void tick(), STREAM_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [slug]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), SECOND_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const signalConnected = stats?.signalConnected ?? signal?.connected ?? false;
  const liveActive = channelState === 'LIVE' || signalConnected;

  useEffect(() => {
    if (liveActive) {
      setLiveStartedAt((startedAt) => startedAt ?? Date.now());
    } else {
      setLiveStartedAt(null);
    }
  }, [liveActive]);

  const liveDurationSec =
    stats?.liveDurationSec ??
    (liveActive && liveStartedAt !== null
      ? Math.max(0, Math.floor((now - liveStartedAt) / SECOND_MS))
      : null);
  const rotationPlaying =
    Boolean(rotation) && !signalConnected && !rotationPaused;

  useEffect(() => {
    onRotationChange?.(rotationPlaying);
  }, [onRotationChange, rotationPlaying]);

  const bitrate = stats?.audioBitrateKbps ?? signal?.bitrateKbps;
  const listeners = stats?.listeners ?? signal?.listeners;
  const outputLabel = signalConnected
    ? 'Live broadcast'
    : rotationPlaying
      ? 'Track rotation'
      : channelState === 'LIVE'
        ? 'Live output'
        : 'Offline';
  const durationSec = rotation?.item?.durationSec ?? null;
  const elapsedSinceObserved = rotation
    ? Math.floor((now - rotation.observedAt) / SECOND_MS)
    : 0;
  const remainingSec =
    durationSec == null
      ? null
      : Math.max(0, durationSec - elapsedSinceObserved);

  // Only meaningful in 'ordered' mode -- in 'shuffle' mode the server picks
  // the next track at random, so a client-predicted "next" would just be
  // wrong more often than not.
  const adjacentRotationItems = useMemo(() => {
    if (!programme || programme.fallbackMode !== 'ordered' || !rotation?.item) {
      return null;
    }
    const ordered = programme.items
      .filter((i) => i.isFallback)
      .sort((a, b) => (a.fallbackOrder ?? 0) - (b.fallbackOrder ?? 0));
    const currentIndex = ordered.findIndex((i) => i.id === rotation.item?.id);
    if (currentIndex === -1 || ordered.length < 2) {
      return null;
    }
    return {
      previous: ordered[(currentIndex - 1 + ordered.length) % ordered.length],
      next: ordered[(currentIndex + 1) % ordered.length],
    };
  }, [programme, rotation]);

  const editableRotation = useMemo(
    () =>
      (programme?.items ?? [])
        .filter((item) => item.isFallback)
        .sort(
          (left, right) =>
            (left.fallbackOrder ?? 0) - (right.fallbackOrder ?? 0),
        ),
    [programme],
  );
  const availableRotationItems = useMemo(
    () =>
      (programme?.items ?? []).filter(
        (item) => item.status === 'READY' && !item.isFallback,
      ),
    [programme],
  );

  const handleTransport = async (
    action: 'skip' | 'previous' | 'pause' | 'resume',
  ) => {
    setTransportBusy(action);
    setError(null);
    const fn = {
      skip: skipChannelRotation,
      previous: previousChannelRotation,
      pause: pauseChannelRotation,
      resume: resumeChannelRotation,
    }[action];
    const result = await fn(slug);
    setTransportBusy(null);
    if (!result.ok) {
      setError(result.error);
    } else if (action === 'pause' || action === 'resume') {
      setRotationPaused(action === 'pause');
    }
  };

  const handleAddCollectionToRotation = async () => {
    if (!selectedCollectionSlug) {
      return;
    }
    setRotationBusy(true);
    setRotationMsg(null);
    const { data: collection } = await fetchStudioCollection(
      selectedCollectionSlug,
    );
    const archiveItemIds = (collection.items ?? [])
      .map((item) => item.archiveItemId)
      .filter((id): id is string => Boolean(id));
    let added = 0;
    let full = false;
    for (const archiveItemId of archiveItemIds) {
      const result = await patchStudioArchiveItem(archiveItemId, {
        isFallback: true,
      });
      if (result.ok) {
        added++;
      } else {
        full = true;
        break;
      }
    }
    setRotationBusy(false);
    setRotationMsg(
      full
        ? `Added ${added} track${added === 1 ? '' : 's'} — rotation is full, so the rest were skipped.`
        : added === 0
          ? 'Nothing to add — that playlist has no tracks.'
          : `Added ${added} track${added === 1 ? '' : 's'} to the rotation.`,
    );
  };

  const saveEditableRotation = async (nextRotation: ProgrammeItem[]) => {
    if (!programme) {
      return;
    }
    if (nextRotation.length > MAX_RADIO_PLAYLIST_ITEMS) {
      setRotationMsg(
        `Your channel rotation is full. It can contain up to ${MAX_RADIO_PLAYLIST_ITEMS} tracks.`,
      );
      return;
    }
    setRotationBusy(true);
    setRotationMsg(null);
    const positions = new Map(
      nextRotation.map((item, index) => [item.id, index]),
    );
    const result = await patchProgramme({
      fallbackMode: programme.fallbackMode,
      fallbackEnabled: programme.fallbackEnabled,
      fallbackAutoEnroll: programme.fallbackAutoEnroll,
      announcementsEnabled: programme.announcementsEnabled,
      items: programme.items.map((item) => {
        const position = positions.get(item.id);
        return {
          archiveItemId: item.id,
          isFallback: position !== undefined,
          ...(position !== undefined ? { fallbackOrder: position } : {}),
        };
      }),
    });
    setRotationBusy(false);
    if (!result.ok) {
      setRotationMsg(result.error);
      return;
    }
    setProgramme(result.data);
    setRotationMsg('Rotation updated.');
  };

  const addRotationItem = async (item: ProgrammeItem) => {
    await saveEditableRotation([...editableRotation, item]);
  };

  const handleEnd = async () => {
    setEnding(true);
    setError(null);
    const result = await postEndBroadcast();
    setEnding(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onEnded?.();
  };

  return (
    <section className="border-primary bg-primary/10 flex flex-col gap-2 rounded-xl border p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="order-1 min-w-0 flex-1">
          <div className="font-display flex items-center gap-2 text-lg font-bold">
            {rotationPlaying ? (
              <ListMusicIcon size={18} className="text-primary" aria-hidden />
            ) : (
              <RadioIcon size={18} className="text-primary" aria-hidden />
            )}
            {rotationPlaying ? 'Rotation is playing' : 'Stream manager'}
          </div>
          {rotationPlaying && rotation ? (
            <div className="mt-1 min-w-0">
              <p className="truncate text-base font-semibold">
                {rotation.title}
              </p>
              <p className="text-foreground-secondary truncate text-sm">
                {rotation.artistName}
                {remainingSec != null
                  ? ` · up to ${formatRemaining(remainingSec)} left`
                  : ''}
              </p>
              {adjacentRotationItems && (
                <p className="text-foreground-secondary mt-0.5 truncate text-xs">
                  ← {adjacentRotationItems.previous.title} · next:{' '}
                  {adjacentRotationItems.next.title} →
                </p>
              )}
            </div>
          ) : (
            <Link
              to="/channel/$slug"
              params={{ slug }}
              className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
            >
              View public channel →
            </Link>
          )}
        </div>
        {canControl && !signalConnected && rotationPlaying && (
          <div
            className="order-3 flex w-full items-center justify-center gap-2 sm:order-2 sm:w-auto sm:flex-1"
            role="group"
            aria-label="Rotation controls"
          >
            <Button
              size="icon-sm"
              variant="secondary"
              disabled={transportBusy !== null}
              onClick={() => void handleTransport('previous')}
              aria-label="Previous track"
              title="Previous track"
            >
              <SkipBackIcon size={14} aria-hidden />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              intent="danger"
              disabled={transportBusy !== null}
              onClick={() => void handleTransport('pause')}
              aria-label="Stop rotation"
              title="Stop rotation"
            >
              <SquareIcon size={14} aria-hidden className="fill-current" />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              disabled={transportBusy !== null}
              onClick={() => void handleTransport('skip')}
              aria-label="Skip track"
              title="Skip track"
            >
              <SkipForwardIcon size={14} aria-hidden />
            </Button>
          </div>
        )}
        <div className="order-2 flex items-center gap-2 sm:order-3">
          {rotationPlaying && (
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={() => setRotationExpanded((v) => !v)}
              aria-label={rotationExpanded ? 'Show less' : 'Show more'}
              title={rotationExpanded ? 'Show less' : 'Show more'}
            >
              {rotationExpanded ? (
                <ChevronDownIcon size={15} aria-hidden />
              ) : (
                <ChevronRightIcon size={15} aria-hidden />
              )}
            </Button>
          )}
          {canControl && onPlaybackToggle && (
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={onPlaybackToggle}
              aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
              title={isPlaying ? 'Pause stream' : 'Play stream'}
            >
              {isPlaying ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
            </Button>
          )}
          {canControl && signalConnected && (
            <Button
              size="sm"
              variant="text"
              disabled={ending}
              onClick={() => setConfirmEndOpen(true)}
            >
              <SquareIcon
                size={14}
                className="mr-1.5 fill-current"
                aria-hidden
              />
              {ending ? 'Ending…' : 'End stream'}
            </Button>
          )}
        </div>
      </div>

      {(!rotationPlaying || rotationExpanded) && (
        <div
          className="border-border flex flex-wrap gap-1 border-b pb-2"
          role="tablist"
          aria-label="Stream manager sections"
        >
          {(
            [
              ['rotation', 'Active rotation'],
              ['stats', 'Stream stats'],
              ['overlay', 'Overlay'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (!rotationPlaying || rotationExpanded) && (
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="group"
          aria-label="Live stream status"
        >
          <StatCell
            icon={
              rotationPlaying ? (
                <ListMusicIcon size={14} aria-hidden />
              ) : (
                <RadioIcon size={14} aria-hidden />
              )
            }
            label="Output"
            value={outputLabel}
          />
          <StatCell
            icon={
              signalConnected ? (
                <WifiIcon size={14} className="text-primary" aria-hidden />
              ) : (
                <WifiOffIcon size={14} aria-hidden />
              )
            }
            label="Signal"
            value={
              signal == null && stats == null
                ? '—'
                : signalConnected
                  ? 'Connected'
                  : signalError
                    ? 'Unavailable'
                    : rotationPlaying
                      ? 'Rotation'
                      : 'No encoder'
            }
          />
          <StatCell
            icon={<ActivityIcon size={14} aria-hidden />}
            label="Bitrate"
            value={
              bitrate != null
                ? `${bitrate} kbps`
                : liveActive
                  ? 'Detecting…'
                  : '—'
            }
          />
          <StatCell
            icon={
              rotationPlaying ? (
                <Clock3Icon size={14} aria-hidden />
              ) : (
                <UsersIcon size={14} aria-hidden />
              )
            }
            label={rotationPlaying ? 'Time left' : 'Listeners'}
            value={
              rotationPlaying
                ? remainingSec != null
                  ? `≤ ${formatRemaining(remainingSec)}`
                  : 'Unknown'
                : (listeners ?? '—')
            }
          />
          <StatCell
            icon={<TrendingUpIcon size={14} aria-hidden />}
            label="Peak listeners"
            value={stats?.listenerPeak ?? '—'}
          />
          <StatCell
            icon={<TimerIcon size={14} aria-hidden />}
            label="Live for"
            value={
              liveDurationSec != null
                ? formatRemaining(liveDurationSec)
                : liveActive
                  ? 'Starting…'
                  : '—'
            }
          />
        </div>
      )}

      {activeTab === 'rotation' && (
        <>
          {canControl &&
            (signalConnected ? (
              // While actually live, the rotation transport controls below do
              // nothing (the disclaimer they used to carry said as much) -- the
              // one relevant action here is stopping the live broadcast itself.
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={ending}
                  onClick={() => setConfirmEndOpen(true)}
                  className="self-start"
                >
                  <SquareIcon
                    size={14}
                    className="mr-1.5 fill-current"
                    aria-hidden
                  />
                  {ending ? 'Ending…' : 'Stop stream'}
                </Button>
              </div>
            ) : (
              !rotationPlaying && (
                <div className="flex flex-col gap-2">
                  {(!rotationPlaying || rotationExpanded) && (
                    <p className="text-foreground-secondary text-[10px] tracking-wide uppercase">
                      Rotation transport
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      disabled={transportBusy !== null}
                      onClick={() => void handleTransport('previous')}
                      aria-label="Previous track"
                      title="Previous track"
                    >
                      <SkipBackIcon size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      intent="danger"
                      disabled={transportBusy !== null}
                      onClick={() =>
                        void handleTransport(
                          rotationPlaying ? 'pause' : 'resume',
                        )
                      }
                      aria-label={
                        rotationPlaying ? 'Stop rotation' : 'Start rotation'
                      }
                      title={
                        rotationPlaying ? 'Stop rotation' : 'Start rotation'
                      }
                    >
                      {rotationPlaying ? (
                        <>
                          <SquareIcon
                            size={14}
                            aria-hidden
                            className="fill-current"
                          />
                        </>
                      ) : (
                        <>
                          <PlayIcon size={14} aria-hidden />
                        </>
                      )}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      disabled={transportBusy !== null}
                      onClick={() => void handleTransport('skip')}
                      aria-label="Skip track"
                      title="Skip track"
                    >
                      <SkipForwardIcon size={14} />
                    </Button>
                  </div>
                  {(!rotationPlaying || rotationExpanded) && (
                    <p className="text-foreground-secondary text-xs">
                      These act on the 24/7 rotation only — a live broadcast
                      always takes priority.
                    </p>
                  )}
                </div>
              )
            ))}

          {canControl &&
            (!rotationPlaying || rotationExpanded) &&
            programme && (
              <ChannelRotationEditor
                items={editableRotation}
                availableItems={availableRotationItems}
                busy={rotationBusy}
                onAdd={(item) => void addRotationItem(item)}
                onReorder={(next) => void saveEditableRotation(next)}
                onRemove={(item) =>
                  void saveEditableRotation(
                    editableRotation.filter(
                      (candidate) => candidate.id !== item.id,
                    ),
                  )
                }
              />
            )}

          {canControl &&
            (!rotationPlaying || rotationExpanded) &&
            collections.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-foreground-secondary text-[10px] tracking-wide uppercase">
                  Add a playlist to the rotation
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    label="Playlist"
                    value={selectedCollectionSlug}
                    onValueChange={setSelectedCollectionSlug}
                    placeholder="Choose a playlist…"
                    options={collections.map((collection) => ({
                      id: collection.slug,
                      label: collection.name,
                    }))}
                    className="min-w-52"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!selectedCollectionSlug || rotationBusy}
                    onClick={() => void handleAddCollectionToRotation()}
                  >
                    {rotationBusy ? 'Adding…' : 'Add to rotation'}
                  </Button>
                </div>
                {rotationMsg && (
                  <p className="text-foreground-secondary text-xs">
                    {rotationMsg}
                  </p>
                )}
              </div>
            )}

          {(!rotationPlaying || rotationExpanded) && targets.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {targets.map((target) => (
                <li
                  key={target.id}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm"
                >
                  <span>
                    {target.label || multicastProviderLabel(target.provider)}
                  </span>
                  <span className="text-foreground-secondary text-xs uppercase">
                    Mirroring
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {activeTab === 'overlay' && canControl && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-display text-base font-bold">Stream overlay</h3>
          </div>
          {overlayError && (
            <p className="text-accent-red text-sm" role="alert">
              {overlayError}
            </p>
          )}
          <Input
            label="Overlay title"
            placeholder="Your display name"
            maxLength={80}
            value={overlay.streamOverlayTitle}
            onChange={(event) =>
              setOverlay({
                ...overlay,
                streamOverlayTitle: event.target.value,
              })
            }
          />
          <Input
            label="Overlay subtitle"
            placeholder="e.g. Every Friday, 8pm CET"
            maxLength={120}
            value={overlay.streamOverlaySubtitle}
            onChange={(event) =>
              setOverlay({
                ...overlay,
                streamOverlaySubtitle: event.target.value,
              })
            }
          />
          <FilePicker
            labels={{
              title: 'Overlay cover image',
              description: 'JPEG, PNG, or WebP',
              browse: overlayCoverFile
                ? 'Choose another image'
                : 'Choose image',
            }}
            accept="image/jpeg,image/png,image/webp"
            selectedFiles={overlayCoverFile ? [overlayCoverFile] : []}
            disabled={overlayCoverUploading}
            onFiles={(files) => {
              const file = files[0];
              if (!file) {
                return;
              }
              setOverlayCoverFile(file);
              setOverlayCoverUploading(true);
              setOverlayError(null);
              void uploadUserMediaFile(file).then((result) => {
                setOverlayCoverUploading(false);
                if (!result.ok) {
                  setOverlayError(result.error);
                  return;
                }
                setOverlay((current) => ({
                  ...current,
                  streamOverlayCoverUrl: result.data.url,
                }));
              });
            }}
          />
          <Button
            disabled={overlaySaving || overlayCoverUploading}
            onClick={saveOverlay}
            className="self-start"
          >
            {overlaySaving ? 'Saving…' : 'Save overlay'}
          </Button>
        </div>
      )}

      {error && <p className="text-accent-red text-xs">{error}</p>}

      {canControl ? (
        <Dialog.Root
          isOpen={confirmEndOpen}
          onClose={() => setConfirmEndOpen(false)}
        >
          <Dialog.Title>Stop your live stream?</Dialog.Title>
          <Dialog.Description>
            Listeners will hear the 24/7 rotation instead. You can go live again
            any time.
          </Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close>Cancel</Dialog.Close>
            <Button
              disabled={ending}
              onClick={() => {
                setConfirmEndOpen(false);
                void handleEnd();
              }}
            >
              {ending ? 'Ending…' : 'Stop stream'}
            </Button>
          </Dialog.Actions>
        </Dialog.Root>
      ) : null}
    </section>
  );
}
