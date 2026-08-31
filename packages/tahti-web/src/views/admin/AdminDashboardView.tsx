import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Badge, Button, Dialog } from '@nuclearplayer/ui';

import { fetchAdminDashboard, type AdminDashboard } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { AdminStreamManagerPanel } from '../../components/AdminStreamManagerPanel';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { StatNumber } from '../../components/tahti/StatNumber';

function euros(cents: number): string {
  return `€${(cents / 100).toLocaleString('fi-FI', { minimumFractionDigits: 0 })}`;
}

function healthChip(ok: boolean): { label: string; color: 'green' | 'orange' } {
  return ok
    ? { label: 'OK', color: 'green' }
    : { label: 'Down', color: 'orange' };
}

export function AdminDashboardView() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    AdminDashboard['actionRows'][number] | null
  >(null);

  useEffect(() => {
    void fetchAdminDashboard().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin" />
        <StudioPageHeader
          title="Admin"
          subtitle="Operations dashboard — members, live streams, and system health."
        />

        {loading || !data ? (
          <StudioPanel>
            <PageLoading label="Loading dashboard…" />
          </StudioPanel>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              {(
                [
                  ['Active members', data.kpis.activeMembers],
                  ['Live now', data.kpis.liveNow],
                  ['Beta queue', data.kpis.betaQueue],
                  ['Open tickets', data.kpis.openTickets],
                ] as const
              ).map(([label, value]) => (
                <StudioPanel key={label} className="!p-4 sm:!p-5">
                  <Eyebrow>{label}</Eyebrow>
                  <StatNumber className="mt-1 block text-2xl">
                    {value.toLocaleString()}
                  </StatNumber>
                </StudioPanel>
              ))}
            </div>

            <StudioPanel title="Needs action">
              {data.actionRows.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  Nothing needs action right now.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {data.actionRows.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{row.title}</div>
                        <div className="text-foreground-secondary text-xs">
                          {row.meta}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link to={row.href}>
                          <Button
                            size="sm"
                            variant={
                              row.actionTone === 'amber'
                                ? 'secondary'
                                : 'default'
                            }
                          >
                            {row.actionLabel}
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="text"
                          onClick={() => setSelectedAction(row)}
                        >
                          View details
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>

            <Dialog.Root
              isOpen={selectedAction !== null}
              onClose={() => setSelectedAction(null)}
              className="max-w-lg"
            >
              {selectedAction ? (
                <>
                  <Dialog.Title>{selectedAction.title}</Dialog.Title>
                  <Dialog.Description>{selectedAction.meta}</Dialog.Description>
                  <div className="border-border bg-background-secondary/40 mt-4 rounded-lg border p-3 text-sm">
                    This item is waiting for an admin action. Open its queue to
                    inspect the full record before completing “
                    {selectedAction.actionLabel}”.
                  </div>
                  <Dialog.Actions>
                    <Dialog.Close>Close</Dialog.Close>
                    <Link to={selectedAction.href}>
                      <Button>{selectedAction.actionLabel}</Button>
                    </Link>
                  </Dialog.Actions>
                </>
              ) : null}
            </Dialog.Root>

            <StudioPanel title="System health">
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['Icecast / Liquidsoap', data.health.icecast === 'up'],
                    ['MinIO storage', data.health.minio === 'up'],
                    [
                      'Postgres backup',
                      data.health.postgresBackupAgeHours != null &&
                        data.health.postgresBackupAgeHours <= 26,
                    ],
                    ['Fan-sub payouts', data.health.failedFanSubPayouts === 0],
                  ] as const
                ).map(([label, ok]) => {
                  const chip = healthChip(ok);
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{label}</span>
                      <Badge variant="pill" color={chip.color}>
                        {chip.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </StudioPanel>

            <div>
              <Button
                type="button"
                variant="text"
                className="text-foreground-secondary hover:text-foreground text-xs tracking-wide uppercase"
                onClick={() => setMoreOpen((v) => !v)}
              >
                {moreOpen ? 'Hide more' : 'Finance, queues & audit'}
              </Button>
            </div>

            {moreOpen && (
              <>
                <StudioPanel title="Finance YTD">
                  <div className="font-display text-2xl font-bold tracking-tight">
                    {euros(data.financeYtdCents.surplus)}
                  </div>
                  <p className="text-foreground-secondary mt-1 text-sm">
                    Revenue {euros(data.financeYtdCents.revenue)} · Costs{' '}
                    {euros(data.financeYtdCents.costs)}
                  </p>
                </StudioPanel>
              </>
            )}
            <AdminStreamManagerPanel />
          </>
        )}
      </div>
    </AdminGate>
  );
}
