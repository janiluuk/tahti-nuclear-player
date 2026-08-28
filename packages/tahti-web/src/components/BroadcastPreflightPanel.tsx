import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Tabs } from '@nuclearplayer/ui';

import {
  fetchBroadcastPreflight,
  patchBroadcastPreflight,
  type BroadcastPreflight,
} from '../api/broadcast';
import { fetchShowSeries } from '../api/shows';

export function BroadcastPreflightPanel() {
  const [preflight, setPreflight] = useState<BroadcastPreflight | null>(null);
  const [title, setTitle] = useState('');
  const [episodeNumberInput, setEpisodeNumberInput] = useState('');
  const [tagline, setTagline] = useState('');
  const [series, setSeries] = useState<
    Array<{ id: string; title: string; nextEpisodeNumber: number }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchBroadcastPreflight(), fetchShowSeries()]).then(
      ([preflightResult, seriesResult]) => {
        if (cancelled) {
          return;
        }
        if (preflightResult.data) {
          setPreflight(preflightResult.data);
          setTitle(preflightResult.data.title ?? '');
          setEpisodeNumberInput(
            String(
              preflightResult.data.episodeNumber ??
                preflightResult.data.plannedRadioShow?.episodeNumber ??
                '',
            ),
          );
          setTagline(
            preflightResult.data.tagline ??
              preflightResult.data.plannedRadioShow?.tagline ??
              '',
          );
        }
        setSeries(
          seriesResult.data.map((show) => ({
            id: show.id,
            title: show.title,
            nextEpisodeNumber: show.nextEpisodeNumber,
          })),
        );
      },
    );
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
        setEpisodeNumberInput(
          String(
            result.data.episodeNumber ??
              result.data.plannedRadioShow?.episodeNumber ??
              '',
          ),
        );
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
      <Tabs
        listClassName="border-border border-b pb-2"
        panelClassName="pt-3"
        items={[
          {
            id: 'info',
            label: (
              <span className="inline-flex items-center gap-1.5">
                <InfoIcon size={14} aria-hidden /> Info
              </span>
            ),
            content: (
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                  <label className="flex flex-col gap-1 text-sm">
                    Show name
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      onBlur={() =>
                        title.trim() && update({ title: title.trim() })
                      }
                      placeholder="Show name"
                      className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    Episode number
                    <input
                      type="number"
                      min={1}
                      value={episodeNumberInput}
                      disabled={Boolean(preflight.plannedLiveShow)}
                      onChange={(event) => {
                        const nextNumber = event.target.value;
                        setEpisodeNumberInput(nextNumber);
                        const parsedNumber = Number(nextNumber);
                        if (
                          !Number.isInteger(parsedNumber) ||
                          parsedNumber < 1
                        ) {
                          return;
                        }
                        const baseTitle = title.replace(/\s+#\d+$/, '').trim();
                        if (baseTitle) {
                          setTitle(`${baseTitle} #${parsedNumber}`);
                        }
                      }}
                      onBlur={() =>
                        title.trim() && update({ title: title.trim() })
                      }
                      className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                    />
                  </label>
                  <div className="flex flex-col gap-1 text-sm">
                    Show type
                    <div
                      className="flex gap-2"
                      role="radiogroup"
                      aria-label="Show type"
                    >
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
                        event.target.value &&
                        update({ seriesId: event.target.value })
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
                      Selecting a series fills its next episode number and saved
                      show details.
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

                <details className="border-border border-t pt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    More options
                  </summary>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1 text-sm">
                      Visibility
                      <div
                        className="border-border flex flex-wrap gap-1 rounded-lg border p-1"
                        role="radiogroup"
                        aria-label="Broadcast visibility"
                      >
                        {(
                          [
                            ['PUBLIC', 'Public'],
                            ['PRIVATE', 'Private'],
                            ['FAN_ONLY', 'Fans only'],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={preflight.visibility === value}
                            onClick={() => update({ visibility: value })}
                            className={`rounded-md px-3 py-2 text-xs font-semibold ${preflight.visibility === value ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:text-foreground'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
