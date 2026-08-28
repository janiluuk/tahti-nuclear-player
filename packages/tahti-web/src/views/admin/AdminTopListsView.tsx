import { Link } from '@tanstack/react-router';
import { ListFilterIcon, PlayIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchAdminTopLists,
  type AdminTopListBucket,
  type AdminTopListDimension,
  type AdminTopListPeriod,
  type AdminTopListSort,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { usePlayerStore } from '../../stores/playerStore';

const PERIODS: { id: AdminTopListPeriod; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'half_year', label: 'Half year' },
  { id: 'all_time', label: 'All time' },
];

const DIMENSIONS: { id: AdminTopListDimension; label: string }[] = [
  { id: 'type', label: 'By type' },
  { id: 'genre', label: 'By genre' },
];

const SORTS: { id: AdminTopListSort; label: string }[] = [
  { id: 'desc', label: 'Most listened' },
  { id: 'asc', label: 'Least listened' },
];

function FilterRow<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      className="border-border flex gap-1 rounded-lg border p-1"
      role="group"
      aria-label={label}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            value === o.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground-secondary hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AdminTopListsView() {
  const play = usePlayerStore((s) => s.play);
  const [period, setPeriod] = useState<AdminTopListPeriod>('month');
  const [dimension, setDimension] = useState<AdminTopListDimension>('type');
  const [sort, setSort] = useState<AdminTopListSort>('desc');
  const [query, setQuery] = useState('');
  const [buckets, setBuckets] = useState<AdminTopListBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminTopLists(period, dimension, sort).then((res) => {
      setBuckets(res.data);
      setLoading(false);
    });
  }, [period, dimension, sort]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleBuckets = buckets
    .map((bucket) => ({
      ...bucket,
      entries: bucket.entries.filter((entry) => {
        if (!normalizedQuery) {
          return true;
        }
        return [entry.title, entry.artistName, entry.channelSlug].some(
          (value) => value.toLowerCase().includes(normalizedQuery),
        );
      }),
    }))
    .filter((bucket) => bucket.entries.length > 0);

  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/top-lists" />
        <StudioPageHeader
          title="Top lists"
          subtitle="Listens are counted once per track per listener per day — a genuine play, not a raw click."
        />

        <div className="flex flex-col gap-3">
          <div className="relative max-w-xl">
            <SearchIcon
              size={16}
              aria-hidden
              className="text-foreground-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, artist, or channel…"
              aria-label="Search top lists"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ListFilterIcon
              size={15}
              aria-hidden
              className="text-foreground-secondary"
            />
            <FilterRow
              options={PERIODS}
              value={period}
              onChange={setPeriod}
              label="Top list period"
            />
            <FilterRow
              options={DIMENSIONS}
              value={dimension}
              onChange={setDimension}
              label="Top list grouping"
            />
            <FilterRow
              options={SORTS}
              value={sort}
              onChange={setSort}
              label="Top list order"
            />
          </div>
        </div>

        {loading ? (
          <StudioPanel>
            <PageLoading label="Loading top lists…" />
          </StudioPanel>
        ) : visibleBuckets.length === 0 ? (
          <StudioPanel>
            <p className="text-foreground-secondary py-4 text-center text-sm">
              {normalizedQuery
                ? 'No matching top-list entries.'
                : 'No listens recorded for this period yet.'}
            </p>
          </StudioPanel>
        ) : (
          visibleBuckets.map((bucket) => {
            const max = Math.max(...bucket.entries.map((e) => e.listens), 1);
            return (
              <StudioPanel key={bucket.bucket}>
                <h2 className="mb-3 text-sm font-semibold capitalize">
                  {bucket.bucket.toLowerCase().replaceAll('_', ' ')}
                </h2>
                <div className="flex flex-col gap-3">
                  {bucket.entries.map((entry, i) => (
                    <div key={entry.archiveItemId} className="text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          {entry.audioUrl && (
                            <Button
                              size="icon-sm"
                              variant="text"
                              aria-label={`Preview ${entry.title}`}
                              title="Preview"
                              onClick={() => {
                                play({
                                  id: `archive:${entry.archiveItemId}`,
                                  kind: 'archive',
                                  title: entry.title,
                                  artist: entry.artistName,
                                  streamUrl: entry.audioUrl!,
                                  protocol: 'https',
                                  channelSlug: entry.channelSlug,
                                });
                              }}
                            >
                              <PlayIcon size={14} aria-hidden />
                            </Button>
                          )}
                          <Link
                            to="/studio/archive/$id"
                            params={{ id: entry.archiveItemId }}
                            className="min-w-0 truncate hover:underline"
                          >
                            #{i + 1} {entry.title} — {entry.artistName}
                          </Link>
                        </span>
                        <span className="text-foreground-secondary shrink-0 text-xs">
                          {entry.listens}{' '}
                          {entry.listens === 1 ? 'listen' : 'listens'}
                        </span>
                      </div>
                      <div className="bg-background-secondary mt-1 h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${(entry.listens / max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </StudioPanel>
            );
          })
        )}
      </div>
    </AdminGate>
  );
}
