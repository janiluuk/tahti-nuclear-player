import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchBroadcastPreflight,
  fetchRtmpTargets,
  patchBroadcastPreflight,
  patchRtmpTarget,
  type BroadcastPreflight,
  type RtmpTarget,
} from '../api/broadcast';
import { fetchShowSeries } from '../api/shows';

export function BroadcastPreflightPanel() {
  const [preflight, setPreflight] = useState<BroadcastPreflight | null>(null);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [series, setSeries] = useState<
    Array<{ id: string; title: string; nextEpisodeNumber: number }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchBroadcastPreflight(),
      fetchRtmpTargets(),
      fetchShowSeries(),
    ]).then(([preflightResult, targetsResult, seriesResult]) => {
      if (cancelled) {
        return;
      }
      if (preflightResult.data) {
        setPreflight(preflightResult.data);
        setTitle(preflightResult.data.title ?? '');
        setTagline(
          preflightResult.data.tagline ??
            preflightResult.data.plannedRadioShow?.tagline ??
            '',
        );
      }
      setTargets(targetsResult.data);
      setSeries(
        seriesResult.data.map((show) => ({
          id: show.id,
          title: show.title,
          nextEpisodeNumber: show.nextEpisodeNumber,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!preflight) {
    return null;
  }

  const episodeNumber =
    preflight.episodeNumber ??
    preflight.plannedRadioShow?.episodeNumber ??
    null;
  const update = (
    patch: Partial<BroadcastPreflight> & { seriesId?: string },
  ) => {
    void patchBroadcastPreflight(patch).then((result) => {
      if ('data' in result) {
        setPreflight(result.data);
        setTitle(result.data.title ?? '');
        setTagline(result.data.tagline ?? '');
      }
    });
  };

  return (
    <div className="border-border bg-background-secondary/30 rounded-xl border p-4">
      <div className="mb-4">
        <p className="border-primary mb-1 border-l-2 pl-2 text-sm font-semibold">
          Pre-flight
        </p>
        <p className="text-foreground-secondary text-sm">
          Listen to your own stream at full quality, then double-check the
          details before going live.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Show name
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => title.trim() && update({ title: title.trim() })}
            placeholder={episodeNumber ? `Show #${episodeNumber}` : 'Show name'}
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
          />
        </label>
        <div className="flex flex-col gap-1 text-sm">
          Show type
          <div className="flex gap-2" role="radiogroup" aria-label="Show type">
            {(['LIVE_SET', 'TALK'] as const).map((showType) => (
              <label
                key={showType}
                className={`border-border flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 ${preflight.showType === showType ? 'border-primary bg-primary/15' : ''}`}
              >
                <input
                  type="radio"
                  name="broadcast-show-type"
                  className="sr-only"
                  checked={preflight.showType === showType}
                  onChange={() => update({ showType })}
                />
                {showType === 'LIVE_SET' ? 'Live set' : 'Talk'}
              </label>
            ))}
          </div>
        </div>
      </div>

      {series.length > 0 && (
        <label className="mt-4 flex flex-col gap-1 text-sm">
          Series episode
          <select
            value={preflight.plannedLiveShow?.seriesId ?? ''}
            disabled={Boolean(preflight.plannedLiveShow)}
            onChange={(event) =>
              event.target.value && update({ seriesId: event.target.value })
            }
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
          >
            <option value="">One-off broadcast</option>
            {series.map((show) => (
              <option key={show.id} value={show.id}>
                {show.title} — next #{show.nextEpisodeNumber}
              </option>
            ))}
          </select>
          <span className="text-foreground-secondary text-xs">
            Selecting a series fills its next episode number and saved show
            details.
          </span>
        </label>
      )}

      {episodeNumber !== null && (
        <label className="mt-4 flex flex-col gap-1 text-sm">
          Tagline
          <input
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            onBlur={() => update({ tagline: tagline.trim() || null })}
            placeholder="What is this broadcast about?"
            maxLength={200}
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
          />
        </label>
      )}

      <details className="border-border mt-4 border-t pt-3">
        <summary className="cursor-pointer text-sm font-medium">
          More options
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Visibility
            <select
              value={preflight.visibility}
              onChange={(event) =>
                update({
                  visibility: event.target
                    .value as BroadcastPreflight['visibility'],
                })
              }
              className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            >
              <option value="PUBLIC">Public — anyone can listen</option>
              <option value="FAN_ONLY">Fan-subscribers only</option>
            </select>
          </label>
          <div className="flex flex-col gap-2 text-sm">
            Simulcast
            {targets.length === 0 ? (
              <span className="text-foreground-secondary text-xs">
                No simulcast targets configured.
              </span>
            ) : (
              targets.map((target) => (
                <label
                  key={target.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={target.enabled}
                    onChange={(event) => {
                      const enabled = event.target.checked;
                      setTargets((current) =>
                        current.map((entry) =>
                          entry.id === target.id
                            ? { ...entry, enabled }
                            : entry,
                        ),
                      );
                      void patchRtmpTarget(target.id, { enabled });
                    }}
                  />
                  {target.label || target.provider}
                </label>
              ))
            )}
          </div>
        </div>
        <p className="text-foreground-secondary mt-4 text-xs">
          {preflight.autoArchive
            ? 'This broadcast will be recorded automatically.'
            : 'Recording is disabled for this broadcast.'}
        </p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => update({ autoArchive: !preflight.autoArchive })}
        >
          {preflight.autoArchive ? 'Disable auto-record' : 'Enable auto-record'}
        </Button>
      </details>
    </div>
  );
}
