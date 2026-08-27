import { Link } from '@tanstack/react-router';
import { HardDriveIcon, HeadphonesIcon, Music2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fetchStudioArchive } from '../api/studio';
import {
  fetchStatsTopTracks,
  fetchStorageUsage,
  type StatsTopTrack,
  type StorageUsage,
} from '../api/studio-extras';
import { StudioNav } from '../components/StudioNav';
import { StudioPanel } from '../components/StudioPanel';
import { FavoritesView } from './FavoritesView';
import { HistoryView } from './HistoryView';
import { MyCollectionsView } from './MyCollectionsView';
import { MyDiscographyView } from './MyDiscographyView';
import { StudioRecordingsView } from './studio/StudioRecordingsView';
import { StudioReleasesView } from './studio/StudioReleasesView';

type Tab =
  | 'discography'
  | 'collections'
  | 'releases'
  | 'recordings'
  | 'favorites'
  | 'history';

const LIBRARY_ROUTE_BY_TAB: Record<Tab, string> = {
  discography: '/library',
  releases: '/library/releases',
  collections: '/library/collections',
  recordings: '/library/recordings',
  favorites: '/library/favorites',
  history: '/library/history',
};

export function LibraryView({ tab = 'discography' }: { tab?: Tab }) {
  return (
    <div className="studio-page-layout flex w-full flex-col gap-6">
      <StudioNav current={LIBRARY_ROUTE_BY_TAB[tab]} />
      <div className="min-w-0 flex-1">
        {tab === 'discography' && (
          <>
            <LibraryStats />
            <MyDiscographyView />
          </>
        )}
        {tab === 'collections' && <MyCollectionsView />}
        {tab === 'releases' && <StudioReleasesView embedded />}
        {tab === 'recordings' && <StudioRecordingsView embedded />}
        {tab === 'favorites' && <FavoritesView />}
        {tab === 'history' && <HistoryView />}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 * 100 ? 0 : 1)} MB`;
}

function LibraryStats() {
  const [topTracks, setTopTracks] = useState<StatsTopTrack[]>([]);
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [soundCount, setSoundCount] = useState(0);

  useEffect(() => {
    void Promise.all([fetchStatsTopTracks('all'), fetchStorageUsage()]).then(
      ([tracks, usage]) => {
        setTopTracks(tracks.data.slice(0, 3));
        setStorage(usage.data);
      },
    );
  }, []);

  useEffect(() => {
    void fetchStudioArchive().then((result) =>
      setSoundCount(result.data.length),
    );
  }, []);

  return (
    <StudioPanel
      title="Library overview"
      description="Your catalog at a glance."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-border bg-background-secondary/40 rounded-lg border p-3">
          <Music2Icon size={18} className="text-primary" aria-hidden />
          <p className="text-foreground-secondary mt-2 text-xs uppercase">
            Total sounds
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{soundCount}</p>
        </div>
        <div className="border-border bg-background-secondary/40 rounded-lg border p-3">
          <HardDriveIcon size={18} className="text-primary" aria-hidden />
          <p className="text-foreground-secondary mt-2 text-xs uppercase">
            Storage used
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {storage ? formatBytes(storage.usedBytes) : '—'}
          </p>
          <p className="text-foreground-secondary text-xs">
            {storage?.unlimited
              ? 'Unlimited plan'
              : storage?.quotaBytes
                ? `of ${formatBytes(storage.quotaBytes)}`
                : 'Audio and files'}
          </p>
        </div>
        <div className="border-border bg-background-secondary/40 rounded-lg border p-3">
          <HeadphonesIcon size={18} className="text-primary" aria-hidden />
          <p className="text-foreground-secondary mt-2 text-xs uppercase">
            Top sound
          </p>
          <p className="mt-1 truncate text-sm font-bold">
            {topTracks[0]?.title ?? '—'}
          </p>
          <p className="text-foreground-secondary text-xs">
            {topTracks[0]
              ? `${topTracks[0].plays.toLocaleString()} plays`
              : 'No plays yet'}
          </p>
        </div>
      </div>
      {topTracks.length > 0 ? (
        <div className="mt-4">
          <p className="text-foreground-secondary mb-2 text-xs font-semibold uppercase">
            Top sounds · all time
          </p>
          <ol className="divide-border divide-y">
            {topTracks.map((track, index) => (
              <li
                key={track.archiveItemId}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <span className="text-foreground-secondary w-5 text-center text-xs">
                  {index + 1}
                </span>
                <Link
                  to="/studio/archive/$id"
                  params={{ id: track.archiveItemId }}
                  className="min-w-0 flex-1 truncate hover:underline"
                >
                  {track.title}
                </Link>
                <span className="text-foreground-secondary text-xs">
                  {track.plays.toLocaleString()} plays
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </StudioPanel>
  );
}
