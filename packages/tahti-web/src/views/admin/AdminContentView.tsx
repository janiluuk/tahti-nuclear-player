import { Link } from '@tanstack/react-router';
import {
  Clock3Icon,
  FileAudioIcon,
  ListMusicIcon,
  RadioTowerIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@tahti-player/ui';

import {
  fetchAdminContentOverview,
  type AdminContentOverview,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { StatNumber } from '../../components/tahti/StatNumber';

function formatDuration(durationSec: number | null | undefined): string {
  if (durationSec == null) {
    return '—';
  }
  const minutes = Math.floor(durationSec / 60);
  return `${minutes}:${String(durationSec % 60).padStart(2, '0')}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function AdminContentView() {
  const [data, setData] = useState<AdminContentOverview | null>(null);

  useEffect(() => {
    void fetchAdminContentOverview().then((result) => setData(result.data));
  }, []);

  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/content">
          <div className="flex max-w-5xl flex-col gap-6">
            <StudioPageHeader
              title="Content"
              subtitle="A quick view of the catalog, activity, and latest recorded broadcasts across Tahti."
              action={
                <Link to="/admin/top-lists">
                  <Button size="sm" variant="secondary">
                    <ListMusicIcon size={15} aria-hidden /> Top lists
                  </Button>
                </Link>
              }
            />
            {!data ? (
              <StudioPanel>
                <PageLoading label="Loading content overview…" />
              </StudioPanel>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-4">
                  {(
                    [
                      ['Tracks', data.counts.tracks, FileAudioIcon],
                      ['Shows', data.counts.shows, RadioTowerIcon],
                      ['Uploads', data.counts.uploads, FileAudioIcon],
                      ['Listens', data.counts.listens, Clock3Icon],
                    ] as const
                  ).map(([label, value, Icon]) => (
                    <StudioPanel key={label} className="!p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Eyebrow>{label}</Eyebrow>
                        <Icon
                          size={17}
                          className="text-foreground-secondary"
                          aria-hidden
                        />
                      </div>
                      <StatNumber className="mt-1 block text-2xl">
                        {value.toLocaleString()}
                      </StatNumber>
                    </StudioPanel>
                  ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <StudioPanel
                    title="Latest content"
                    description="The newest tracks, shows, releases, and other catalog items."
                  >
                    {data.latestContent.length === 0 ? (
                      <p className="text-foreground-secondary text-sm">
                        No content has been added yet.
                      </p>
                    ) : (
                      <ul className="divide-border divide-y">
                        {data.latestContent.map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <FileAudioIcon
                              size={18}
                              className="text-foreground-secondary shrink-0"
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {item.title}
                              </p>
                              <p className="text-foreground-secondary text-xs">
                                {item.type}
                                {item.artistName ? ` · ${item.artistName}` : ''}
                              </p>
                            </div>
                            <time
                              className="text-foreground-secondary text-xs"
                              dateTime={item.createdAt}
                            >
                              {formatDate(item.createdAt)}
                            </time>
                          </li>
                        ))}
                      </ul>
                    )}
                  </StudioPanel>
                  <StudioPanel
                    title="Latest recorded broadcasts"
                    description="Recent broadcasts captured by the platform recorder."
                  >
                    {data.latestBroadcasts.length === 0 ? (
                      <p className="text-foreground-secondary text-sm">
                        No recorded broadcasts yet.
                      </p>
                    ) : (
                      <ul className="divide-border divide-y">
                        {data.latestBroadcasts.map((broadcast) => (
                          <li
                            key={broadcast.id}
                            className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <RadioTowerIcon
                              size={18}
                              className="text-foreground-secondary shrink-0"
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {broadcast.title}
                              </p>
                              <p className="text-foreground-secondary text-xs">
                                {broadcast.artistName ?? 'Unknown artist'} ·{' '}
                                {formatDuration(broadcast.durationSec)}
                              </p>
                            </div>
                            <time
                              className="text-foreground-secondary text-xs"
                              dateTime={broadcast.recordedAt}
                            >
                              {formatDate(broadcast.recordedAt)}
                            </time>
                          </li>
                        ))}
                      </ul>
                    )}
                  </StudioPanel>
                </div>
              </>
            )}
          </div>
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
