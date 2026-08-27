import { AlertTriangleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchAdminMissedShows,
  updateAdminMissedShow,
  type AdminMissedShow,
  type AdminMissedShowStatus,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const FILTERS: Array<{ id: AdminMissedShowStatus | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'REVIEWING', label: 'Reviewing' },
  { id: 'ACTIONED', label: 'Actioned' },
  { id: 'DISMISSED', label: 'Dismissed' },
];

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export function AdminMissedShowsView() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('ALL');
  const [flags, setFlags] = useState<AdminMissedShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = (nextFilter: (typeof FILTERS)[number]['id']) => {
    setLoading(true);
    setError(null);
    void fetchAdminMissedShows(
      nextFilter === 'ALL' ? undefined : nextFilter,
    ).then((result) => {
      setFlags(result.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load('ALL');
  }, []);

  const setStatus = async (
    flag: AdminMissedShow,
    status: AdminMissedShowStatus,
  ) => {
    setBusyId(flag.id);
    const result = await updateAdminMissedShow(flag.id, status);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFlags((current) =>
      current.map((item) => (item.id === flag.id ? { ...item, status } : item)),
    );
  };

  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/missed-shows" />
        <StudioPageHeader
          title="Missed shows"
          subtitle="Review scheduled broadcasts that passed their start time without a live signal."
        />

        <StudioPanel>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Missed show status"
          >
            {FILTERS.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={filter === item.id ? 'default' : 'secondary'}
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => {
                  setFilter(item.id);
                  load(item.id);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </StudioPanel>

        <StudioPanel title={`Queue · ${flags.length}`}>
          {loading ? (
            <PageLoading label="Loading missed shows…" />
          ) : error ? (
            <p className="text-accent-red text-sm">{error}</p>
          ) : flags.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No missed shows in this view.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {flags.map((flag) => (
                <li
                  key={flag.id}
                  className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <AlertTriangleIcon
                    size={17}
                    aria-hidden
                    className="text-accent-orange mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {flag.scheduledLiveShow.title}
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {flag.channel.displayName} · @{flag.channel.username}
                    </div>
                    <div className="text-foreground-secondary mt-1 text-xs">
                      Scheduled {formatDate(flag.scheduledLiveShow.startAt)} ·
                      detected {formatDate(flag.detectedAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {flag.status !== 'REVIEWING' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === flag.id}
                        onClick={() => void setStatus(flag, 'REVIEWING')}
                      >
                        Reviewing
                      </Button>
                    )}
                    {flag.status !== 'ACTIONED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === flag.id}
                        onClick={() => void setStatus(flag, 'ACTIONED')}
                      >
                        Actioned
                      </Button>
                    )}
                    {flag.status !== 'DISMISSED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === flag.id}
                        onClick={() => void setStatus(flag, 'DISMISSED')}
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
