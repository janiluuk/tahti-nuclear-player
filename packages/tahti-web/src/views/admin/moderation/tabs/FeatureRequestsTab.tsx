import {
  BanIcon,
  CheckCircle2Icon,
  Clock3Icon,
  CopyIcon,
  ListFilterIcon,
  LoaderCircleIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge, Button } from '@tahti-player/ui';

import {
  fetchAdminFeatureRequests,
  updateFeatureRequestStatus,
  type AdminFeatureRequestRow,
  type AdminFeatureRequestStatus,
} from '../../../../api/admin';
import { PageLoading } from '../../../../components/PageStates';
import { StudioPanel } from '../../../../components/StudioPanel';
import { ModerationTabs } from '../ModerationTabs';

const FILTERS: { id: AdminFeatureRequestStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'PLANNED', label: 'Planned' },
  { id: 'IN_PROGRESS', label: 'In progress' },
  { id: 'DONE', label: 'Done' },
  { id: 'DECLINED', label: 'Declined' },
];

const FILTER_TAB_ICONS = {
  all: ListFilterIcon,
  OPEN: Clock3Icon,
  PLANNED: Clock3Icon,
  IN_PROGRESS: LoaderCircleIcon,
  DONE: CheckCircle2Icon,
  DECLINED: BanIcon,
  DUPLICATE: CopyIcon,
};

function statusBadge(status: AdminFeatureRequestStatus): {
  label: string;
  color: 'orange' | 'cyan' | 'green' | 'secondary';
} {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', color: 'orange' };
    case 'PLANNED':
      return { label: 'Planned', color: 'cyan' };
    case 'IN_PROGRESS':
      return { label: 'In progress', color: 'cyan' };
    case 'DONE':
      return { label: 'Done', color: 'green' };
    default:
      return { label: 'Declined', color: 'secondary' };
  }
}

function RowActions({
  row,
  onDone,
}: {
  row: AdminFeatureRequestRow;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const terminal = row.status === 'DONE' || row.status === 'DECLINED';

  const apply = (status: AdminFeatureRequestStatus) => {
    setPending(true);
    void updateFeatureRequestStatus(row.id, status).then(() => {
      setPending(false);
      onDone();
    });
  };

  if (terminal) {
    return (
      <Button
        size="sm"
        variant="text"
        disabled={pending}
        onClick={() => apply('OPEN')}
      >
        <Clock3Icon size={14} aria-hidden />
        Reopen
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => apply('PLANNED')}
      >
        <Clock3Icon size={14} aria-hidden />
        Plan
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => apply('IN_PROGRESS')}
      >
        <LoaderCircleIcon size={14} aria-hidden />
        In progress
      </Button>
      <Button size="sm" disabled={pending} onClick={() => apply('DONE')}>
        <CheckCircle2Icon size={14} aria-hidden />
        Done
      </Button>
      <Button
        size="sm"
        variant="text"
        disabled={pending}
        onClick={() => apply('DECLINED')}
      >
        <BanIcon size={14} aria-hidden />
        Decline
      </Button>
    </div>
  );
}

/** Feature requests tab — ported as-is from the standalone admin route (see
 * AdminModerationView). Member-suggested features, ranked by votes. */
export function FeatureRequestsTab() {
  const [filter, setFilter] = useState<AdminFeatureRequestStatus | 'all'>(
    'OPEN',
  );
  const [rows, setRows] = useState<AdminFeatureRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    void fetchAdminFeatureRequests(filter === 'all' ? undefined : filter).then(
      (res) => {
        setRows([...res.data].sort((a, b) => b.voteCount - a.voteCount));
        setLoading(false);
      },
    );
  };

  useEffect(reload, [filter]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-foreground-secondary text-sm">
        Member-suggested features, ranked by votes. Review quarterly.
      </p>

      <ModerationTabs
        activeId={filter}
        items={FILTERS.map((item) => ({
          ...item,
          icon: FILTER_TAB_ICONS[item.id],
        }))}
        ariaLabel="Feature request status"
        onChange={(id) => setFilter(id as AdminFeatureRequestStatus | 'all')}
      />

      <StudioPanel>
        {loading ? (
          <PageLoading label="Loading feature requests…" />
        ) : rows.length === 0 ? (
          <p className="text-foreground-secondary py-4 text-center text-sm">
            No feature requests in this view.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((r) => {
              const badge = statusBadge(r.status);
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-medium">
                      {r.title}
                      <Badge variant="pill" color={badge.color}>
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {r.voteCount} votes · by @{r.proposerUsername}
                      {r.reviewNote ? ` · ${r.reviewNote}` : ''}
                    </div>
                  </div>
                  <RowActions row={r} onDone={reload} />
                </li>
              );
            })}
          </ul>
        )}
      </StudioPanel>
    </div>
  );
}
