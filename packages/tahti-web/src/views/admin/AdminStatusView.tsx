import { useEffect, useState } from 'react';

import { Badge } from '@nuclearplayer/ui';

import {
  fetchAdminDashboard,
  fetchAdminStatus,
  type AdminDashboard,
  type AdminStatusData,
} from '../../api/admin';
import { fetchPlatformStatus } from '../../api/client';
import type { PlatformStatus } from '../../api/types';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function AdminStatusView() {
  const [data, setData] = useState<AdminStatusData | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [platform, setPlatform] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      fetchAdminStatus(),
      fetchAdminDashboard(),
      fetchPlatformStatus(),
    ]).then(([status, adminDashboard, platformStatus]) => {
      setData(status.data);
      setDashboard(adminDashboard.data);
      setPlatform(platformStatus.data);
      setLoading(false);
    });
  }, []);

  const mergedChecks = data
    ? Object.entries(platform?.checks ?? {}).reduce(
        (checks, [id, check]) => {
          if (!checks[id]) {
            checks[id] = {
              state: check.state === 'ok' ? 'up' : 'down',
              critical: Boolean(check.critical),
              latencyMs: check.latencyMs,
              detail: check.detail,
            };
          }
          return checks;
        },
        { ...data.checks },
      )
    : {};
  const overallStatus = platform?.status ?? data?.status ?? 'unknown';

  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/status" />
        <StudioPageHeader title="Service status" />

        <StudioPanel>
          {loading ? (
            <PageLoading label="Loading service status…" />
          ) : !data ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              Could not load status.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                <Badge
                  variant="pill"
                  color={
                    overallStatus === 'operational' || overallStatus === 'ok'
                      ? 'green'
                      : 'orange'
                  }
                >
                  {overallStatus}
                </Badge>
                <span className="text-foreground-secondary text-xs">
                  {platform?.version ? `Version ${platform.version} · ` : ''}
                  Uptime{' '}
                  {Math.floor((platform?.uptimeSec ?? data.uptimeSec) / 3600)}h
                  {' · checked '}
                  {new Date(platform?.ts ?? data.ts).toLocaleString()}
                </span>
              </div>
              <ul className="divide-border divide-y">
                {Object.entries(mergedChecks).map(([id, check]) => (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{id}</div>
                      {check.detail && (
                        <div className="text-foreground-secondary text-xs">
                          {check.detail}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {check.latencyMs != null && (
                        <span className="text-foreground-secondary text-xs">
                          {check.latencyMs} ms
                        </span>
                      )}
                      <Badge
                        variant="pill"
                        color={check.state === 'up' ? 'green' : 'orange'}
                      >
                        {check.state}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </StudioPanel>
        {dashboard && (
          <div className="grid gap-6 md:grid-cols-2">
            <StudioPanel title="Queue health">
              <ul className="divide-border divide-y">
                {dashboard.queues.map((queue) => (
                  <li
                    key={queue.name}
                    className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                  >
                    <span>{queue.name}</span>
                    <span className="text-foreground-secondary text-xs">
                      {queue.waiting} waiting
                      {queue.failed > 0 ? `, ${queue.failed} failed` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </StudioPanel>
            <StudioPanel title="Cron jobs">
              <ul className="divide-border divide-y">
                {dashboard.cronJobs.map((job) => (
                  <li
                    key={job.jobName}
                    className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                  >
                    <span title={job.description}>{job.jobName}</span>
                    <span className="text-foreground-secondary text-xs">
                      {job.lastRun?.outcome ?? '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </StudioPanel>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
