import { Link } from '@tanstack/react-router';
import {
  ActivityIcon,
  Clock3Icon,
  ListMusicIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  SquareIcon,
  UsersIcon,
  Volume2Icon,
  VolumeXIcon,
  WifiIcon,
  WifiOffIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchChannelManageStats,
  fetchRtmpTargets,
  fetchSignalStatus,
  postEndBroadcast,
  type ChannelManageStats,
  type RtmpTarget,
  type SignalStatus,
} from '../api/broadcast';
import { fetchChannel } from '../api/client';
import { fetchProgramme, type ProgrammeItem } from '../api/studio-extras';

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
  isMuted = false,
  onPlaybackToggle,
  onMuteToggle,
  onEnded,
  onRotationChange,
}: {
  slug: string;
  channelState: string;
  isPlaying?: boolean;
  isMuted?: boolean;
  onPlaybackToggle?: () => void;
  onMuteToggle?: () => void;
  onEnded?: () => void;
  onRotationChange?: (playing: boolean) => void;
}) {
  const [signal, setSignal] = useState<SignalStatus | null>(null);
  const [stats, setStats] = useState<ChannelManageStats | null>(null);
  const [signalError, setSignalError] = useState(false);
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [rotation, setRotation] = useState<RotationPlayback | null>(null);
  const [now, setNow] = useState(Date.now());
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const nowPlaying = channel?.nowPlaying;
      if (!nowPlaying) {
        setRotation(null);
        return;
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
  const rotationPlaying = Boolean(rotation) && !signalConnected;

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
    <section className="border-primary bg-primary/10 flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
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
        <div className="flex items-center gap-2">
          {onPlaybackToggle && (
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
          {onMuteToggle && (
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={onMuteToggle}
              aria-label={isMuted ? 'Unmute stream' : 'Mute stream'}
              title={isMuted ? 'Unmute stream' : 'Mute stream'}
            >
              {isMuted ? <VolumeXIcon size={15} /> : <Volume2Icon size={15} />}
            </Button>
          )}
          {signalConnected && (
            <Button
              size="sm"
              variant="text"
              disabled={ending}
              onClick={() => void handleEnd()}
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

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
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
          value={bitrate != null ? `${bitrate} kbps` : '—'}
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
      </div>

      {rotationPlaying && durationSec != null && (
        <p className="text-foreground-secondary text-xs">
          Remaining time is an upper bound until Tahti reports track position;
          it resets when the next title starts.
        </p>
      )}

      {targets.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {targets.map((target) => (
            <li
              key={target.id}
              className="border-border flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm"
            >
              <span>{target.label || target.provider}</span>
              <span className="text-foreground-secondary text-xs uppercase">
                Mirroring
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-accent-red text-xs">{error}</p>}
    </section>
  );
}
