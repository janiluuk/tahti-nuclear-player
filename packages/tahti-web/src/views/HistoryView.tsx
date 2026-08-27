import { Button, Tabs } from '@nuclearplayer/ui';

import { HistoryListSection } from '../components/history/HistoryListSection';
import { HistoryStatsSection } from '../components/history/HistoryStatsSection';
import { PageHeader } from '../components/PageHeader';
import { PageEmpty } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { useLibraryStore } from '../stores/libraryStore';

const RECENTLY_PLAYED_PREVIEW = 5;

/** Ported from Nuclear desktop's History view (packages/player/src/views/
 * History) — same two-tab layout (Stats / Listening history) and the same
 * `@nuclearplayer/ui` chart/list components. Nuclear's version reads a
 * local SQLite play log with per-play listening duration; this reads
 * Tahti's lighter localStorage `history` (a play-event timestamp, deduped
 * to one row per track) — see src/lib/historyStats.ts for how listening
 * time is approximated from that. */
export function HistoryView() {
  const history = useLibraryStore((s) => s.history);
  const clearHistory = useLibraryStore((s) => s.clearHistory);
  const recentHistory = history.slice(0, RECENTLY_PLAYED_PREVIEW);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PageHeader
        title="History"
        actions={
          <Button
            variant="text"
            size="sm"
            disabled={history.length === 0}
            onClick={clearHistory}
          >
            Clear all
          </Button>
        }
      />
      <Tabs
        className="flex flex-1 flex-col overflow-hidden"
        panelsClassName="flex-1 overflow-hidden"
        panelClassName="flex flex-1 overflow-hidden"
        items={[
          {
            id: 'recently-played',
            label: 'Recently played',
            content: (
              <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
                {recentHistory.length === 0 ? (
                  <PageEmpty
                    title="Nothing played yet"
                    description="Tracks you play show up here, most recent first."
                  />
                ) : (
                  <PlayableTrackTable
                    items={recentHistory.map((entry) => entry.playable)}
                    emptyMessage="Nothing played yet."
                  />
                )}
              </section>
            ),
          },
          {
            id: 'stats',
            label: 'Stats',
            content: <HistoryStatsSection history={history} />,
          },
          {
            id: 'listening-history',
            label: 'Listening history',
            content: <HistoryListSection history={history} />,
          },
        ]}
      />
    </div>
  );
}
