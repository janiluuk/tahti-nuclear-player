import { useCallback, useEffect, useState } from 'react';

import { LogViewer, Tabs, type LogEntryData } from '@nuclearplayer/ui';

import { fetchAdminContainerLogs, type AdminLogEntry } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { AdminActivityView } from './AdminActivityView';

const REFRESH_INTERVAL_MS = 15_000;

// Container names carry the compose project prefix ("tahti-stack-api-1")
// — group by the middle segment so the ScopeFilter reads as service names
// instead of every entry being its own scope.
function scopeFor(service: string): string {
  const match = /^tahti-stack-([a-z0-9-]+?)(-\d+)?$/.exec(service);
  return match?.[1] ?? service;
}

function toLogEntry(entry: AdminLogEntry, index: number): LogEntryData {
  return {
    id: `${entry.timestampMs}-${index}`,
    timestamp: new Date(entry.timestampMs),
    level: 'info',
    target: entry.service,
    source: { type: 'core', scope: scopeFor(entry.service) },
    message: entry.line,
  };
}

export function AdminLogsView() {
  const [entries, setEntries] = useState<AdminLogEntry[]>([]);
  const [lokiReachable, setLokiReachable] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetchAdminContainerLogs({ limit: 500 });
    setEntries(res.entries);
    setLokiReachable(res.lokiReachable);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const logs = entries.map(toLogEntry);
  const scopes = [...new Set(logs.map((l) => l.source.scope))].sort();

  const containerLogs = (
    <StudioPanel>
      {!lokiReachable && (
        <p
          className="border-accent-red/40 bg-accent-red/10 text-accent-red mb-3 rounded-lg border px-4 py-3 text-sm"
          role="alert"
        >
          Could not reach the logging backend. It may be down, or this
          environment can&apos;t reach it on the LAN.
        </p>
      )}
      {loading ? (
        <p className="text-foreground-secondary text-sm">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="text-foreground-secondary py-4 text-center text-sm">
          No log lines in the last hour.
        </p>
      ) : (
        <div className="h-[70vh]">
          <LogViewer.Root
            logs={logs}
            scopes={scopes}
            onClear={() => {}}
            onExport={() => {}}
            onOpenLogFolder={() => {}}
          >
            <div className="flex flex-wrap items-center gap-4">
              <LogViewer.SearchInput />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <LogViewer.ScopeFilter />
              <LogViewer.EntryCount />
            </div>
            <LogViewer.VirtualizedList />
          </LogViewer.Root>
        </div>
      )}
    </StudioPanel>
  );

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/logs" />
        <StudioPageHeader
          title="Logs"
          subtitle="Review platform activity and live container output in separate tabs."
        />
        <Tabs
          items={[
            {
              id: 'activity',
              label: 'Activity',
              content: <AdminActivityView embedded />,
            },
            {
              id: 'containers',
              label: 'Container logs',
              content: containerLogs,
            },
          ]}
        />
      </div>
    </AdminGate>
  );
}
