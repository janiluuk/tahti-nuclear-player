import { Link } from '@tanstack/react-router';
import {
  ActivityIcon,
  ListMusicIcon,
  RadioIcon,
  SquareIcon,
  UsersIcon,
  WifiIcon,
  WifiOffIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchRtmpTargets,
  fetchSignalStatus,
  postEndBroadcast,
  type RtmpTarget,
  type SignalStatus,
} from '../api/broadcast';
import { fetchProgramme, type ProgrammeView } from '../api/studio-extras';

const STATS_POLL_MS = 5000;
const MULTISTREAM_POLL_MS = 15000;

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
    <div className="flex flex-col items-center gap-1 text-center">
      {icon}
      <span className="text-foreground-secondary text-[10px] tracking-wide uppercase">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

/**
 * Status + listeners + end-stream, no modal chrome of its own — the shared
 * body for both the channel page's owner/board live view and the Go Live
 * wizard's "you're on air" step, so "what's happening on my stream right
 * now" looks and behaves the same wherever it's opened from.
 */
export function StreamManagerPanel({
  slug,
  channelState,
  onEnded,
}: {
  slug: string;
  channelState: string;
  /** Called after a successful end-stream. */
  onEnded?: () => void;
}) {
  const [signal, setSignal] = useState<SignalStatus | null>(null);
  const [signalError, setSignalError] = useState(false);
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const { data, meta } = await fetchSignalStatus();
      if (!cancelled) {
        setSignal(data);
        setSignalError(meta.source === 'api' && Boolean(meta.reason));
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), STATS_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const [targetResult, programmeResult] = await Promise.all([
        fetchRtmpTargets(),
        fetchProgramme(),
      ]);
      if (!cancelled) {
        setTargets(targetResult.data.filter((target) => target.enabled));
        setProgramme(programmeResult.data);
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), MULTISTREAM_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [slug]);

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

  const hasRotation = Boolean(
    programme?.fallbackEnabled &&
    programme.items.some(
      (item) => item.isFallback && item.status.toUpperCase() === 'READY',
    ),
  );
  const rotationPlaying =
    channelState === 'LIVE' &&
    signal?.connected === false &&
    !signalError &&
    hasRotation;
  const outputLabel = signal?.connected
    ? 'Live broadcast'
    : rotationPlaying
      ? 'Track rotation'
      : channelState === 'LIVE'
        ? 'Live output'
        : 'Offline';

  return (
    <div className="border-primary bg-primary/10 flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display flex items-center gap-2 text-lg font-bold">
            <RadioIcon size={18} className="text-primary" aria-hidden />
            Stream manager
          </div>
          <Link
            to="/channel/$slug"
            params={{ slug }}
            className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
          >
            View public channel →
          </Link>
        </div>
        <Button
          size="sm"
          variant="text"
          disabled={ending}
          onClick={() => void handleEnd()}
        >
          <SquareIcon size={14} className="mr-1.5 fill-current" aria-hidden />
          {ending ? 'Ending…' : 'End stream'}
        </Button>
      </div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="group"
        aria-label="Live stream status"
      >
        <StatCell
          icon={
            rotationPlaying ? (
              <ListMusicIcon size={16} className="text-primary" aria-hidden />
            ) : (
              <RadioIcon size={16} className="text-primary" aria-hidden />
            )
          }
          label="Output"
          value={outputLabel}
        />
        <StatCell
          icon={
            signal?.connected ? (
              <WifiIcon size={16} className="text-primary" aria-hidden />
            ) : (
              <WifiOffIcon
                size={16}
                className="text-foreground-secondary"
                aria-hidden
              />
            )
          }
          label="Signal"
          value={
            signal == null
              ? '—'
              : signal.connected
                ? 'Connected'
                : signalError
                  ? 'Unavailable'
                  : 'No encoder'
          }
        />
        <StatCell
          icon={<ActivityIcon size={16} aria-hidden />}
          label="Bitrate"
          value={
            signal?.bitrateKbps != null ? `${signal.bitrateKbps} kbps` : '—'
          }
        />
        <StatCell
          icon={<UsersIcon size={16} aria-hidden />}
          label="Listeners"
          value={signal?.listeners ?? '—'}
        />
      </div>

      {targets.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {targets.map((t) => (
            <li
              key={t.id}
              className="border-border flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm"
            >
              <span>{t.label || t.provider}</span>
              <span className="text-foreground-secondary text-xs uppercase">
                Mirroring
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-accent-red text-xs">{error}</p>}
    </div>
  );
}
