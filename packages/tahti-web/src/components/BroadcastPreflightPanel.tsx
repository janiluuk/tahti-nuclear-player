import { useEffect, useState } from 'react';

import {
  fetchBroadcastPreflight,
  patchBroadcastPreflight,
  type BroadcastPreflight,
} from '../api/broadcast';
import { fetchShowSeries } from '../api/shows';
import { PageLoading } from './PageStates';

export function BroadcastPreflightPanel() {
  const [preflight, setPreflight] = useState<BroadcastPreflight | null>(null);
  const [loaded, setLoaded] = useState(false);
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
        setLoaded(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return <PageLoading label="Loading show info…" />;
  }

  if (!preflight) {
    return (
      <p className="text-foreground-secondary text-sm">
        Show details could not be loaded.
      </p>
    );
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
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <label className="flex flex-col gap-1 text-sm">
            Show name
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => title.trim() && update({ title: title.trim() })}
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
                if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
                  return;
                }
                const baseTitle = title.replace(/\s+#\d+$/, '').trim();
                if (baseTitle) {
                  setTitle(`${baseTitle} #${parsedNumber}`);
                }
              }}
              onBlur={() => title.trim() && update({ title: title.trim() })}
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

        <div className="flex flex-col gap-1 text-sm">
          Visibility
          <div
            className="flex gap-2"
            role="radiogroup"
            aria-label="Show visibility"
          >
            {(
              [
                ['PUBLIC', 'Public'],
                ['PRIVATE', 'Private'],
                ['FAN_ONLY', 'Fans only'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`border-border flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 ${preflight.visibility === value ? 'border-primary bg-primary/15' : ''}`}
              >
                <input
                  type="radio"
                  name="broadcast-visibility"
                  className="sr-only"
                  checked={preflight.visibility === value}
                  onChange={() => update({ visibility: value })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {series.length > 0 && (
          <label className="flex flex-col gap-1 text-sm">
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
          <label className="flex flex-col gap-1 text-sm">
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
      </div>
    </div>
  );
}
