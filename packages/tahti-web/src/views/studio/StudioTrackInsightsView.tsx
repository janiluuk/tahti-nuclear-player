import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchTrackInsights,
  type InsightsKind,
  type InsightsPeriod,
  type TrackInsights,
} from '../../api/track-insights';
import { ListenerWorldMap } from '../../components/ListenerWorldMap';
import { PageLoading } from '../../components/PageStates';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { StatNumber } from '../../components/tahti/StatNumber';

const PERIODS: InsightsPeriod[] = ['7d', '30d', 'all'];

export function StudioTrackInsightsView({
  kind,
  id,
}: {
  kind: InsightsKind;
  id: string;
}) {
  const [period, setPeriod] = useState<InsightsPeriod>('30d');
  const [insights, setInsights] = useState<TrackInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchTrackInsights(kind, id, period).then((r) => {
      setInsights(r.data);
      setLoading(false);
    });
  }, [kind, id, period]);

  const maxDaily = insights
    ? Math.max(1, ...insights.daily.map((d) => d.downloads))
    : 1;
  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/stats" />
        <Link
          to={kind === 'archive' ? '/studio/archive' : '/studio/releases'}
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← {kind === 'archive' ? 'Music' : 'Releases'}
        </Link>

        <StudioPageHeader
          title="Track insights"
          subtitle={insights?.title}
          action={
            <div className="flex gap-1.5">
              {PERIODS.map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === period ? undefined : 'text'}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'all' ? 'All time' : p}
                </Button>
              ))}
            </div>
          }
        />

        {loading ? (
          <PageLoading label="Loading…" />
        ) : !insights ? (
          <p className="text-foreground-secondary text-sm">
            No insights available for this track.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="border-border rounded-lg border p-4">
                <Eyebrow>Plays</Eyebrow>
                <StatNumber className="mt-1 block text-2xl">
                  {insights.totalPlays.toLocaleString()}
                </StatNumber>
              </div>
              <div className="border-border rounded-lg border p-4">
                <Eyebrow>Downloads</Eyebrow>
                <StatNumber className="mt-1 block text-2xl">
                  {insights.totalDownloads.toLocaleString()}
                </StatNumber>
              </div>
            </div>

            <StudioPanel title="Listener map">
              <p className="text-foreground-secondary mb-4 text-sm">
                Anonymized countries for this track's counted plays and
                downloads.
              </p>
              <ListenerWorldMap data={insights.countries} countLabel="plays" />
            </StudioPanel>

            <StudioPanel title="Downloads by day">
              <h2>
                <span className="sr-only">Downloads by day</span>
              </h2>
              {insights.daily.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No downloads in this period.
                </p>
              ) : (
                <div className="flex h-32 items-end gap-1">
                  {insights.daily.map((d) => (
                    <div
                      key={d.date}
                      className="group relative flex h-full flex-1 items-end"
                      title={`${d.date}: ${d.downloads}`}
                    >
                      <div
                        className="bg-primary hover:bg-accent-cyan w-full rounded-t transition-colors"
                        style={{
                          height: `${Math.max(4, (d.downloads / maxDaily) * 100)}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </StudioPanel>
          </>
        )}
      </div>
    </StudioGate>
  );
}
