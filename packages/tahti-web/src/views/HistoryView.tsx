import { Button, Tabs } from '@nuclearplayer/ui';

import { HistoryListSection } from '../components/history/HistoryListSection';
import { HistoryStatsSection } from '../components/history/HistoryStatsSection';
import { PageHeader } from '../components/PageHeader';
import { useLibraryStore } from '../stores/libraryStore';

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
