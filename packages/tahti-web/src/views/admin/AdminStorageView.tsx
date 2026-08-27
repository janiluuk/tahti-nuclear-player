import { Link, useSearch } from '@tanstack/react-router';
import {
  CloudIcon,
  ExternalLinkIcon,
  HardDriveIcon,
  PencilIcon,
  PlayIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge, Button, Input, SaveButton, Tabs } from '@nuclearplayer/ui';

import {
  deleteAdminFile,
  fetchAdminFileAudio,
  fetchAdminFiles,
  fetchAdminStorage,
  setUserStorageQuota,
  type AdminFileRow,
  type AdminStorageDiskSpace,
  type AdminStorageOverview,
  type AdminStorageUserRow,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import {
  bytesToMb,
  formatBytes,
  formatFileDate,
  formatQuota,
  groupFilesByUser,
  usagePercent,
} from '../../lib/storageFormat';
import { usePlayerStore } from '../../stores/playerStore';

function QuotaEditor({
  userId,
  quotaBytes,
  displayName,
  onSaved,
}: {
  userId: string;
  quotaBytes: number;
  displayName: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(bytesToMb(quotaBytes)));
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <Button
        size="icon-sm"
        variant="text"
        aria-label={`Edit quota for ${displayName}`}
        title="Edit quota"
        onClick={() => {
          setValue(String(bytesToMb(quotaBytes)));
          setEditing(true);
        }}
      >
        <PencilIcon size={14} aria-hidden />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border-border bg-background h-8 w-20 rounded-md border px-2 text-xs"
        disabled={saving}
        aria-label={`Quota in MB for ${displayName}`}
      />
      <span className="text-foreground-secondary text-xs">MB</span>
      <SaveButton
        size="sm"
        saving={saving}
        title="Save quota"
        onClick={() => {
          const mb = Number(value);
          if (!Number.isFinite(mb) || mb <= 0) {
            return;
          }
          setSaving(true);
          void setUserStorageQuota(userId, Math.round(mb * 1024 * 1024)).then(
            () => {
              setSaving(false);
              setEditing(false);
              onSaved();
            },
          );
        }}
      />
      <Button
        size="icon-sm"
        variant="text"
        aria-label="Cancel editing quota"
        title="Cancel"
        onClick={() => setEditing(false)}
      >
        <XIcon size={14} aria-hidden />
      </Button>
    </div>
  );
}

function DiskSpaceCard({
  icon: Icon,
  title,
  space,
}: {
  icon: typeof HardDriveIcon;
  title: string;
  space: AdminStorageDiskSpace;
}) {
  const pctUsed =
    space.totalBytes != null && space.totalBytes > 0 && space.usedBytes != null
      ? (space.usedBytes / space.totalBytes) * 100
      : null;

  return (
    <StudioPanel>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} aria-hidden className="text-primary" />
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-foreground-secondary text-xs uppercase">Used</dt>
          <dd className="font-semibold">{formatBytes(space.usedBytes)}</dd>
        </div>
        <div>
          <dt className="text-foreground-secondary text-xs uppercase">Free</dt>
          <dd className="font-semibold">{formatBytes(space.freeBytes)}</dd>
        </div>
        <div>
          <dt className="text-foreground-secondary text-xs uppercase">Total</dt>
          <dd className="font-semibold">{formatBytes(space.totalBytes)}</dd>
        </div>
      </dl>
      {pctUsed != null ? (
        <div className="bg-background-secondary mt-3 h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${Math.min(100, pctUsed)}%` }}
          />
        </div>
      ) : null}
      {space.note ? (
        <p className="text-foreground-secondary mt-3 text-xs">{space.note}</p>
      ) : null}
    </StudioPanel>
  );
}

function TopUsersChart({ users }: { users: AdminStorageUserRow[] }) {
  const top = useMemo(
    () => [...users].sort((a, b) => b.usedBytes - a.usedBytes).slice(0, 8),
    [users],
  );
  const max = Math.max(...top.map((u) => u.usedBytes), 1);

  if (top.length === 0) {
    return (
      <p className="text-foreground-secondary py-2 text-center text-sm">
        No usage recorded yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {top.map((u) => (
        <div key={u.userId} className="text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="min-w-0 truncate font-medium">
              {u.displayName}{' '}
              <span className="text-foreground-secondary font-normal">
                @{u.username}
              </span>
            </span>
            <span className="text-foreground-secondary shrink-0 text-xs">
              {formatBytes(u.usedBytes)}
              {u.unlimited ? ' · unlimited quota' : ''}
            </span>
          </div>
          <div className="bg-background-secondary mt-1 h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${(u.usedBytes / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StorageOverviewTab() {
  const [overview, setOverview] = useState<AdminStorageOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    void fetchAdminStorage().then((res) => {
      setOverview(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  if (loading) {
    return (
      <StudioPanel>
        <PageLoading label="Loading storage…" />
      </StudioPanel>
    );
  }

  if (!overview) {
    return (
      <StudioPanel>
        <p className="text-foreground-secondary py-4 text-center text-sm">
          Could not load storage usage.
        </p>
      </StudioPanel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <DiskSpaceCard
          icon={HardDriveIcon}
          title="Local server disk"
          space={overview.localDisk}
        />
        <DiskSpaceCard
          icon={CloudIcon}
          title="Object storage"
          space={overview.objectStorage}
        />
      </div>

      <StudioPanel
        title="Top users by storage usage"
        description="The heaviest storage accounts across the platform."
      >
        <TopUsersChart users={overview.users} />
      </StudioPanel>

      <StudioPanel
        title="All users"
        description="Quota vs. usage for every account with recorded storage."
      >
        <div className="mb-4 flex flex-wrap gap-6">
          <div>
            <div className="text-foreground-secondary text-xs">Total used</div>
            <div className="text-lg font-semibold">
              {formatBytes(overview.totalUsedBytes)}
            </div>
          </div>
          <div>
            <div className="text-foreground-secondary text-xs">Total quota</div>
            <div className="text-lg font-semibold">
              {formatBytes(overview.totalQuotaBytes)}
            </div>
          </div>
          <div>
            <div className="text-foreground-secondary text-xs">
              Users with usage
            </div>
            <div className="text-lg font-semibold">{overview.userCount}</div>
          </div>
        </div>

        {overview.users.length === 0 ? (
          <p className="text-foreground-secondary py-4 text-center text-sm">
            No usage recorded yet.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {overview.users.map((row) => {
              const pct = usagePercent(
                row.usedBytes,
                row.quotaBytes,
                row.unlimited,
              );
              return (
                <li
                  key={row.userId}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {row.displayName}{' '}
                      <span className="text-foreground-secondary font-normal">
                        @{row.username}
                      </span>
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {formatBytes(row.usedBytes)} of{' '}
                      {formatQuota(row.quotaBytes, row.unlimited)}
                      {pct != null ? (
                        <>
                          {' · '}
                          <span className={pct > 100 ? 'text-accent-red' : ''}>
                            {Math.round(pct)}%
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <QuotaEditor
                      userId={row.userId}
                      quotaBytes={row.quotaBytes}
                      displayName={row.displayName}
                      onSaved={reload}
                    />
                    <Link
                      to="/admin/storage/$userId"
                      params={{ userId: row.userId }}
                    >
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        aria-label={`View ${row.displayName}'s files`}
                        title="View files"
                      >
                        <ExternalLinkIcon size={14} aria-hidden />
                      </Button>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </StudioPanel>
    </div>
  );
}

function FilesBrowserTab() {
  const play = usePlayerStore((s) => s.play);
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<AdminFileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupByUser, setGroupByUser] = useState(false);
  const [pendingPlayId, setPendingPlayId] = useState<string | null>(null);

  const reload = (q?: string) => {
    setLoading(true);
    void fetchAdminFiles(q).then((res) => {
      setFiles(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    const handle = setTimeout(() => reload(query), 250);
    return () => clearTimeout(handle);
  }, [query]);

  const groups = useMemo(() => groupFilesByUser(files), [files]);

  const handlePlay = async (file: AdminFileRow) => {
    if (pendingPlayId) {
      return;
    }
    setPendingPlayId(file.id);
    const resolved = file.audioUrl
      ? {
          audioUrl: file.audioUrl,
          title: file.title,
          artistName: file.artistName,
          channelSlug: file.channelSlug,
          durationSec: file.durationSec,
        }
      : (await fetchAdminFileAudio(file.id)).data;
    setPendingPlayId(null);
    if (!resolved?.audioUrl) {
      return;
    }
    play({
      id: `admin-file:${file.id}`,
      kind: 'archive',
      title: resolved.title,
      artist: resolved.artistName,
      streamUrl: resolved.audioUrl,
      protocol: 'https',
      channelSlug: resolved.channelSlug,
      durationSec: resolved.durationSec,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <SearchIcon
            size={15}
            aria-hidden
            className="text-foreground-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            aria-label="Search files"
            placeholder="Search by title, artist, or username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          size="sm"
          variant={groupByUser ? 'secondary' : 'text'}
          aria-pressed={groupByUser}
          onClick={() => setGroupByUser((v) => !v)}
        >
          <UsersIcon size={14} aria-hidden className="mr-1.5" />
          Group by user
        </Button>
      </div>

      {groupByUser ? (
        <StudioPanel
          title="Totals by user"
          description="Sum of every matching file's size, grouped by uploader. Click a row for their full file list and running total."
        >
          {loading ? (
            <PageLoading label="Loading storage users…" />
          ) : groups.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No files match this search.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {groups.map((g) => (
                <li key={g.userId}>
                  <Link
                    to="/admin/storage/$userId"
                    params={{ userId: g.userId }}
                    className="hover:bg-background-secondary -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 text-sm transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium">
                        {g.displayName}{' '}
                        <span className="text-foreground-secondary font-normal">
                          @{g.username}
                        </span>
                      </div>
                      <div className="text-foreground-secondary text-xs">
                        {g.fileCount} {g.fileCount === 1 ? 'file' : 'files'}
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold">
                      {formatBytes(g.totalBytes)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      ) : (
        <StudioPanel>
          {loading ? (
            <PageLoading label="Loading files…" />
          ) : files.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No files match this search.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{f.title}</div>
                    <div className="text-foreground-secondary text-xs">
                      {f.artistName} · @{f.username} ·{' '}
                      {formatBytes(f.sizeBytes)} · {formatFileDate(f.createdAt)}
                      {f.genre ? ` · ${f.genre}` : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge
                      variant="pill"
                      color={f.isPublic ? 'green' : 'secondary'}
                    >
                      {f.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label={`Preview ${f.title}`}
                      title="Preview"
                      disabled={pendingPlayId === f.id}
                      onClick={() => void handlePlay(f)}
                    >
                      <PlayIcon size={16} aria-hidden />
                    </Button>
                    <Link
                      to="/admin/storage/$userId"
                      params={{ userId: f.userId }}
                    >
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label={`View ${f.displayName}'s storage`}
                        title="View uploader's storage"
                      >
                        <ExternalLinkIcon size={15} aria-hidden />
                      </Button>
                    </Link>
                    <Button
                      size="icon-sm"
                      variant="text"
                      className="text-accent-red hover:text-accent-red"
                      aria-label={`Delete ${f.title}`}
                      title="Delete"
                      onClick={() => {
                        if (
                          !window.confirm(`Delete "${f.title}" permanently?`)
                        ) {
                          return;
                        }
                        void deleteAdminFile(f.id).then(() => reload(query));
                      }}
                    >
                      <Trash2Icon size={15} aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      )}
    </div>
  );
}

export function AdminStorageView() {
  const search = useSearch({ strict: false }) as { tab?: string };
  const [tab, setTab] = useState<'storage' | 'files'>(
    search.tab === 'files' ? 'files' : 'storage',
  );

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/storage" />
        <StudioPageHeader
          title="Storage"
          subtitle="Disk and object storage space, per-user quotas, and every uploaded file across the platform."
        />

        <Tabs
          selectedIndex={tab === 'storage' ? 0 : 1}
          onChange={(index) => setTab(index === 0 ? 'storage' : 'files')}
          listClassName="border-border border-b pb-3"
          panelClassName="pt-2"
          items={[
            {
              id: 'storage',
              label: 'Storage',
              content: <StorageOverviewTab />,
            },
            {
              id: 'files',
              label: 'Files',
              content: <FilesBrowserTab />,
            },
          ]}
        />
      </div>
    </AdminGate>
  );
}
