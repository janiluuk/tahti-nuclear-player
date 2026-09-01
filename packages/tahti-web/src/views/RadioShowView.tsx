import { Link } from '@tanstack/react-router';
import { MessageCircleIcon, MicIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, SectionShell, Tabs } from '@tahti-player/ui';

import {
  fetchPublicRadioShow,
  type PublicRadioShow,
  type PublicRadioShowEpisode,
} from '../api/shows';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { isGreenRoomWindow } from '../lib/radioSchedule';

function formatDate(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${start.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} · ${start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}–${end.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function EpisodeList({
  episodes,
  emptyMessage,
}: {
  episodes: PublicRadioShowEpisode[];
  emptyMessage: string;
}) {
  if (episodes.length === 0) {
    return <p className="text-foreground-secondary text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
      {episodes.map((episode) => (
        <li key={episode.id} className="flex items-start gap-3 p-3">
          {episode.showType === 'TALK' ? (
            <MessageCircleIcon
              size={16}
              className="text-foreground-secondary mt-0.5 shrink-0"
              aria-hidden
            />
          ) : (
            <MicIcon
              size={16}
              className="text-foreground-secondary mt-0.5 shrink-0"
              aria-hidden
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium">
              {episode.title ?? episode.note ?? 'Tahti Radio show'}
            </div>
            <div className="text-foreground-secondary text-xs">
              {formatDate(episode.startAt, episode.endAt)}
            </div>
            {episode.description ? (
              <p className="mt-2 text-sm">{episode.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export const RadioShowView = ({ channelSlug }: { channelSlug: string }) => {
  const [show, setShow] = useState<PublicRadioShow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchPublicRadioShow(channelSlug).then((result) => {
      setShow(result.data);
      setLoading(false);
    });
  }, [channelSlug]);

  if (loading) {
    return <PageLoading label="Loading show…" />;
  }

  if (!show) {
    return (
      <PageEmpty
        title="Show not found"
        description="This Tahti Radio show is not available."
      />
    );
  }

  // Only the nearest upcoming slot and the most recent past one can
  // plausibly be imminent/live/just-wrapped — no need to scan the whole list.
  const greenRoomLive = [show.upcomingEpisodes[0], show.pastEpisodes[0]].some(
    (episode) => episode && isGreenRoomWindow(episode),
  );

  return (
    <PageFrame maxWidth="3xl">
      <PageHeader
        title={show.artist.displayName}
        subtitle="Show on Tahti Radio"
        back={
          <Link
            to="/radio"
            className="text-foreground-secondary text-xs hover:underline"
          >
            ← Tahti Radio
          </Link>
        }
        actions={
          <div className="flex items-center gap-3">
            {greenRoomLive ? (
              <Link
                to="/u/$username/green-room"
                params={{ username: show.artist.username }}
              >
                <Button
                  size="icon-sm"
                  variant="secondary"
                  aria-label="Open green room"
                  title="Green room"
                >
                  <MicIcon size={16} aria-hidden />
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      {show.artist.bio ? <p className="text-sm">{show.artist.bio}</p> : null}

      <SectionShell title="Episodes">
        <Tabs
          items={[
            {
              id: 'upcoming',
              label: 'Upcoming',
              content: (
                <EpisodeList
                  episodes={show.upcomingEpisodes}
                  emptyMessage="No upcoming slots booked right now."
                />
              ),
            },
            {
              id: 'past',
              label: 'Past episodes',
              content: (
                <EpisodeList
                  episodes={show.pastEpisodes}
                  emptyMessage="Nothing has aired yet."
                />
              ),
            },
          ]}
        />
      </SectionShell>
    </PageFrame>
  );
};
