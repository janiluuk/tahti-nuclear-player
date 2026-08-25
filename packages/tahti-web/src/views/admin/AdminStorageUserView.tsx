import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import {
  fetchAdminStorageUserFiles,
  type AdminStorageUserDetail,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import {
  formatBytes,
  formatFileDate,
  formatQuota,
  usagePercent,
} from '../../lib/storageFormat';
import { usePlayerStore } from '../../stores/playerStore';

function tierLabel(tier: AdminStorageUserDetail['tier']): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

export function AdminStorageUserView({ userId }: { userId: string }) {
  const play = usePlayerStore((s) => s.play);
  const [detail, setDetail] = useState<AdminStorageUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminStorageUserFiles(userId).then((res) => {
      setDetail(res.data);
      setLoading(false);
    });
  }, [userId]);

  const pct = detail
    ? usagePercent(detail.usedBytes, detail.quotaBytes, detail.unlimited)
    : null;

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <Link to="/admin/storage">
          <Button size="sm" variant="text">
            <ArrowLeftIcon size={14} aria-hidden className="mr-1.5" />
            Back to Storage
          </Button>
        </Link>

        {loading ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : !detail ? (
          <StudioPanel>
            <p className="text-foreground-secondary py-4 text-center text-sm">
              Could not load this user's storage.
            </p>
          </StudioPanel>
        ) : (
          <>
            <StudioPageHeader
              title={detail.displayName}
              subtitle={`@${detail.username} · ${tierLabel(detail.tier)} tier`}
            />

            <StudioPanel>
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-foreground-secondary text-xs uppercase">
                    Used
                  </div>
                  <div className="text-lg font-semibold">
                    {formatBytes(detail.usedBytes)}
                  </div>
                </div>
                <div>
                  <div className="text-foreground-secondary text-xs uppercase">
                    Quota
                  </div>
                  <div className="text-lg font-semibold">
                    {formatQuota(detail.quotaBytes, detail.unlimited)}
                  </div>
                </div>
                {pct != null ? (
                  <div>
                    <div className="text-foreground-secondary text-xs uppercase">
                      Used of quota
                    </div>
                    <div
                      className={`text-lg font-semibold ${pct > 100 ? 'text-accent-red' : ''}`}
                    >
                      {Math.round(pct)}%
                    </div>
                  </div>
                ) : null}
              </div>
            </StudioPanel>

            <StudioPanel
              title="Files"
              description="Oldest first, with a running total of storage used over time."
            >
              {detail.files.length === 0 ? (
                <p className="text-foreground-secondary py-4 text-center text-sm">
                  No files uploaded yet.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {detail.files.map((f) => (
                    <li
                      key={f.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{f.title}</div>
                        <div className="text-foreground-secondary text-xs">
                          {f.kind === 'stash' ? 'Stash' : 'Archive'} ·{' '}
                          {formatBytes(f.sizeBytes)} ·{' '}
                          {formatFileDate(f.createdAt)} · running total{' '}
                          {formatBytes(f.runningTotalBytes)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {f.isPublic != null ? (
                          <Badge
                            variant="pill"
                            color={f.isPublic ? 'green' : 'secondary'}
                          >
                            {f.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        ) : null}
                        {f.isAudio && f.previewUrl ? (
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label={`Preview ${f.title}`}
                            title="Preview"
                            onClick={() =>
                              play({
                                id: `admin-storage-file:${f.id}`,
                                kind: 'archive',
                                title: f.title,
                                artist: detail.displayName,
                                streamUrl: f.previewUrl!,
                                protocol: 'https',
                              })
                            }
                          >
                            <PlayIcon size={16} aria-hidden />
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>
          </>
        )}
      </div>
    </AdminGate>
  );
}
