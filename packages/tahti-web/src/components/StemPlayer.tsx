import {
  DownloadIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@tahti-player/ui';

type StemFile = { label: string; url: string };

/**
 * Small multitrack preview player for a set of stem files split from the
 * same source track. One transport plays every stem in sync; muting a
 * stem keeps it playing (silent) rather than pausing it, so isolating a
 * part doesn't drift the others out of sync when you unmute.
 *
 * Plain `<audio>` elements aren't sample-accurate, so the master stem's
 * `timeupdate` nudges any stem that's drifted more than 150ms back into
 * line — good enough for previewing a split, not a DAW-grade sync.
 */
export function StemPlayer({ files }: { files: StemFile[] }) {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState<Record<string, boolean>>({});

  const masterLabel = files[0]?.label;

  useEffect(() => {
    setPlaying(false);
  }, [files]);

  useEffect(() => {
    if (!masterLabel) {
      return;
    }
    const master = audioRefs.current[masterLabel];
    if (!master) {
      return;
    }
    const onTimeUpdate = () => {
      for (const f of files) {
        if (f.label === masterLabel) {
          continue;
        }
        const el = audioRefs.current[f.label];
        if (el && Math.abs(el.currentTime - master.currentTime) > 0.15) {
          el.currentTime = master.currentTime;
        }
      }
    };
    const onEnded = () => setPlaying(false);
    master.addEventListener('timeupdate', onTimeUpdate);
    master.addEventListener('ended', onEnded);
    return () => {
      master.removeEventListener('timeupdate', onTimeUpdate);
      master.removeEventListener('ended', onEnded);
    };
  }, [files, masterLabel]);

  if (files.length === 0) {
    return null;
  }

  const togglePlay = () => {
    const next = !playing;
    setPlaying(next);
    for (const f of files) {
      const el = audioRefs.current[f.label];
      if (!el) {
        continue;
      }
      if (next) {
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    }
  };

  const toggleMute = (label: string) => {
    setMuted((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      const el = audioRefs.current[label];
      if (el) {
        el.muted = Boolean(next[label]);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          aria-label={playing ? 'Pause all stems' : 'Play all stems'}
          aria-pressed={playing}
          onClick={togglePlay}
        >
          {playing ? (
            <PauseIcon size={14} aria-hidden />
          ) : (
            <PlayIcon size={14} aria-hidden />
          )}
        </Button>
        <span className="text-foreground-secondary text-xs">
          Plays in sync — mute a stem to isolate the rest.
        </span>
      </div>
      <ul className="divide-border divide-y">
        {files.map((f) => (
          <li
            key={f.label}
            className="flex items-center justify-between gap-2 py-1.5 text-sm"
          >
            <span className="min-w-0 truncate">{f.label}</span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="sm"
                variant="text"
                aria-label={
                  muted[f.label] ? `Unmute ${f.label}` : `Mute ${f.label}`
                }
                aria-pressed={Boolean(muted[f.label])}
                onClick={() => toggleMute(f.label)}
              >
                {muted[f.label] ? (
                  <VolumeXIcon size={14} aria-hidden />
                ) : (
                  <Volume2Icon size={14} aria-hidden />
                )}
              </Button>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Download ${f.label}`}
                className="text-foreground-secondary hover:text-foreground p-1.5"
              >
                <DownloadIcon size={14} aria-hidden />
              </a>
            </div>
            <audio
              ref={(el) => {
                audioRefs.current[f.label] = el;
              }}
              src={f.url}
              preload="none"
              className="hidden"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
