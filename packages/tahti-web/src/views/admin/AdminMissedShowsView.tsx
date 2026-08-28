import {
  AlertTriangleIcon,
  CheckIcon,
  EyeIcon,
  ListFilterIcon,
  XIcon,
} from 'lucide-react';
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
import { ModerationTabs } from './moderation/ModerationTabs';

const FILTERS: Array<{ id: AdminMissedShowStatus | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'REVIEWING', label: 'Reviewing' },
  { id: 'ACTIONED', label: 'Actioned' },
  { id: 'DISMISSED', label: 'Dismissed' },
];

const FILTER_TAB_ICONS = {
  ALL: ListFilterIcon,
  OPEN: AlertTriangleIcon,
  REVIEWING: EyeIcon,
  ACTIONED: CheckIcon,
  DISMISSED: XIcon,
};

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export function AdminMissedShowsPanel() {
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
    <div className="flex flex-col gap-6">
      <StudioPanel>
        <ModerationTabs
          activeId={filter}
          items={FILTERS.map((item) => ({
            ...item,
            icon: FILTER_TAB_ICONS[item.id],
          }))}
          ariaLabel="Missed show status"
          onChange={(id) => {
            const nextFilter = id as (typeof FILTERS)[number]['id'];
            setFilter(nextFilter);
            load(nextFilter);
          }}
        />
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
                      size="icon-sm"
                      variant="secondary"
                      aria-label={`Mark ${flag.scheduledLiveShow.title} as reviewing`}
                      title="Mark reviewing"
                      disabled={busyId === flag.id}
                      onClick={() => void setStatus(flag, 'REVIEWING')}
                    >
                      <EyeIcon size={14} aria-hidden />
                    </Button>
                  )}
                  {flag.status !== 'ACTIONED' && (
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      aria-label={`Mark ${flag.scheduledLiveShow.title} as actioned`}
                      title="Mark actioned"
                      disabled={busyId === flag.id}
                      onClick={() => void setStatus(flag, 'ACTIONED')}
                    >
                      <CheckIcon size={14} aria-hidden />
                    </Button>
                  )}
                  {flag.status !== 'DISMISSED' && (
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      aria-label={`Dismiss ${flag.scheduledLiveShow.title}`}
                      title="Dismiss missed show"
                      disabled={busyId === flag.id}
                      onClick={() => void setStatus(flag, 'DISMISSED')}
                    >
                      <XIcon size={14} aria-hidden />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </StudioPanel>
    </div>
  );
}

export function AdminMissedShowsView() {
  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/missed-shows" />
        <StudioPageHeader
          title="Missed shows"
          subtitle="Review scheduled broadcasts that passed their start time without a live signal."
        />
        <AdminMissedShowsPanel />
      </div>
    </AdminGate>
  );
}
