import { Link } from '@tanstack/react-router';
import { CheckIcon, RadioIcon, SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchRecentBroadcasts,
  type RecentBroadcast,
} from '../../api/broadcast';
import { PageLoading } from '../../components/PageStates';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) {
    return '';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function RecordingRow({
  show,
  index,
}: {
  show: RecentBroadcast;
  index: number;
}) {
  const title =
    show.title || show.archiveItemTitle || `Show ${formatDate(show.startedAt)}`;
  const published = show.archiveItemStatus === 'READY';

  return (
    <li
      className={`flex items-center gap-3 border-l-4 p-3 transition-colors ${
        published
          ? 'border-l-primary bg-primary/10'
          : `border-l-transparent ${index % 2 === 0 ? 'bg-background-secondary/55' : 'bg-background'}`
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-foreground-secondary truncate text-xs">
          {formatDate(show.startedAt)}
          {show.durationSec ? ` · ${formatDuration(show.durationSec)}` : ''}
          {show.source
            ? ` · ${show.source.toLowerCase().replace('_', ' ')}`
            : ''}
        </div>
      </div>
      <span
        className={`flex shrink-0 items-center gap-1 text-xs font-medium ${
          published ? 'text-accent-green' : 'text-foreground-secondary'
        }`}
      >
        {published && <CheckIcon size={12} aria-hidden />}
        {published ? 'Published' : 'Recorded'}
      </span>
      {show.archiveItemId ? (
        <Link to="/studio/archive/$id" params={{ id: show.archiveItemId }}>
          <Button size="sm" variant="secondary">
            Open
          </Button>
        </Link>
      ) : (
        <Link to="/studio/archive">
          <Button size="sm" variant="secondary">
            Publish
          </Button>
        </Link>
      )}
    </li>
  );
}

export function StudioRecordingsView({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [shows, setShows] = useState<RecentBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest');

  useEffect(() => {
    void fetchRecentBroadcasts(500).then((res) => {
      setShows(res.data);
      setLoading(false);
    });
  }, []);

  const visibleShows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return shows
      .filter((show) => {
        if (!needle) {
          return true;
        }
        return [show.title, show.archiveItemTitle, show.source]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle);
      })
      .sort((left, right) => {
        if (sort === 'title') {
          return (left.title || left.archiveItemTitle || '').localeCompare(
            right.title || right.archiveItemTitle || '',
          );
        }
        const leftTime = new Date(left.startedAt).getTime();
        const rightTime = new Date(right.startedAt).getTime();
        return sort === 'newest' ? rightTime - leftTime : leftTime - rightTime;
      });
  }, [query, shows, sort]);

  const content = (
    <div
      className={`${embedded ? 'flex' : 'studio-page-layout'} mx-auto w-full max-w-3xl flex-col gap-6 px-1 py-2`}
    >
      {!embedded ? <StudioNav current="/studio/recordings" /> : null}
      {!embedded ? <StudioPageHeader title="Recordings" /> : null}

      <StudioPanel
        title={`Recorded shows (${shows.length})`}
        description="Every completed show recording, newest first."
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recordings…"
            aria-label="Search recordings"
            endAddon={<SearchIcon size={16} aria-hidden />}
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            aria-label="Sort recordings"
            className="border-border bg-background h-10 rounded-md border px-3 text-sm sm:w-44"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        {loading ? (
          <PageLoading label="Loading…" />
        ) : visibleShows.length === 0 ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-foreground-secondary text-sm">
              {shows.length === 0
                ? 'No recorded shows yet.'
                : 'No recordings match your search.'}
            </p>
            {shows.length === 0 ? (
              <>
                <p className="text-foreground-secondary text-xs">
                  Enable recording when you go live and completed shows will
                  appear here.
                </p>
                <Link to="/studio/go-live">
                  <Button size="sm" variant="secondary">
                    <RadioIcon size={14} aria-hidden className="mr-1" />
                    Open broadcast studio
                  </Button>
                </Link>
              </>
            ) : null}
          </div>
        ) : (
          <ul className="border-border divide-border divide-y overflow-hidden rounded-xl border">
            {visibleShows.map((show, index) => (
              <RecordingRow key={show.id} show={show} index={index} />
            ))}
          </ul>
        )}
      </StudioPanel>
    </div>
  );

  return embedded ? content : <StudioGate>{content}</StudioGate>;
}
