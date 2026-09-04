import { BarChart3Icon, Clock3Icon, HistoryIcon } from 'lucide-react';

import { Button, Tabs, ViewShell } from '@tahti-player/ui';

import { HistoryListSection } from '../components/history/HistoryListSection';
import { HistoryStatsSection } from '../components/history/HistoryStatsSection';
import { PageEmpty } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { useLibraryStore } from '../stores/libraryStore';

const RECENTLY_PLAYED_PREVIEW = 5;

/** Ported from Nuclear desktop's History view (packages/player/src/views/
 * History) — same two-tab layout (Stats / Listening history) and the same
 * `@tahti-player/ui` chart/list components. Nuclear's version reads a
 * local SQLite play log with per-play listening duration; this reads
 * Tahti's lighter localStorage `history` (a play-event timestamp, deduped
 * to one row per track) — see src/lib/historyStats.ts for how listening
 * time is approximated from that. */
export function HistoryView({ embedded = false }: { embedded?: boolean }) {
  const history = useLibraryStore((s) => s.history);
  const clearHistory = useLibraryStore((s) => s.clearHistory);
  const recentHistory = history.slice(0, RECENTLY_PLAYED_PREVIEW);

  const clearButton = (
    <Button
      variant="text"
      size="sm"
      disabled={history.length === 0}
      onClick={clearHistory}
    >
      Clear all
    </Button>
  );

  const body = (
    <>
      <div className="mb-4 flex justify-end">{clearButton}</div>
      <Tabs
        className="flex flex-1 flex-col overflow-hidden"
        panelsClassName="flex-1 overflow-hidden"
        panelClassName="flex flex-1 overflow-hidden"
        items={[
          {
            id: 'recently-played',
            label: 'Recently played',
            icon: <Clock3Icon size={14} />,
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
            icon: <BarChart3Icon size={14} />,
            content: <HistoryStatsSection history={history} />,
          },
          {
            id: 'listening-history',
            label: 'Listening history',
            icon: <HistoryIcon size={14} />,
            content: <HistoryListSection history={history} />,
          },
        ]}
      />
    </>
  );

  if (embedded) {
    return <div className="flex min-h-0 flex-1 flex-col gap-4">{body}</div>;
  }

  return (
    <ViewShell
      title="History"
      subtitle="Recently played and stats."
      classes={{ root: 'px-0 pt-0 flex min-h-0 flex-1 flex-col' }}
    >
      {body}
    </ViewShell>
  );
}
