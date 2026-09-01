import { Link } from '@tanstack/react-router';
import { CalendarDaysIcon, CalendarPlusIcon, Clock3Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog } from '@tahti-player/ui';

import {
  fetchPublicRadioShow,
  fetchShowBookings,
  type PublicRadioShow,
  type StudioShowBooking,
} from '../api/shows';
import { PageLoading } from './PageStates';

const DAYS_VISIBLE = 14;

export function ScheduleDialog({
  isOpen,
  onClose,
  onBook,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBook?: () => void;
}) {
  const [bookings, setBookings] = useState<StudioShowBooking[]>([]);
  const [shows, setShows] = useState<Record<string, PublicRadioShow>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const from = new Date();
    const to = new Date(from.getTime() + DAYS_VISIBLE * 24 * 60 * 60 * 1000);
    setLoading(true);
    void fetchShowBookings(from.toISOString(), to.toISOString()).then(
      (result) => {
        setBookings(
          result.data
            .filter((booking) => new Date(booking.endAt).getTime() > Date.now())
            .sort((left, right) => left.startAt.localeCompare(right.startAt)),
        );
        const channels = [
          ...new Set(result.data.map((booking) => booking.channelSlug)),
        ];
        void Promise.all(
          channels.map(async (channelSlug) => {
            const show = await fetchPublicRadioShow(channelSlug);
            return show.data ? ([channelSlug, show.data] as const) : null;
          }),
        ).then((entries) => {
          setShows(
            Object.fromEntries(
              entries.filter(Boolean) as Array<
                readonly [string, PublicRadioShow]
              >,
            ),
          );
        });
        setLoading(false);
      },
    );
  }, [isOpen]);

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose} className="max-w-md">
      <Dialog.Title>Schedule</Dialog.Title>
      <Dialog.Description>Upcoming shows on Tahti Radio.</Dialog.Description>
      <div className="mt-3">
        {loading ? (
          <PageLoading label="Loading schedule…" />
        ) : bookings.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            Nothing scheduled in the next two weeks.
          </p>
        ) : (
          <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="border-border flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs"
              >
                {(() => {
                  const show = shows[booking.channelSlug];
                  const episode = [
                    ...(show?.upcomingEpisodes ?? []),
                    ...(show?.pastEpisodes ?? []),
                  ].find((candidate) => candidate.startAt === booking.startAt);
                  const image =
                    episode?.coverUrl ??
                    show?.artist.coverUrl ??
                    show?.artist.avatarUrl;
                  return (
                    <>
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="size-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <CalendarDaysIcon
                          size={14}
                          className="text-primary shrink-0"
                          aria-hidden
                        />
                      )}
                      <Link
                        to="/radio/show/$channelSlug"
                        params={{ channelSlug: booking.channelSlug }}
                        onClick={onClose}
                        className="min-w-0 flex-1 hover:underline"
                      >
                        <span className="block truncate font-medium">
                          {episode?.title ??
                            booking.note ??
                            booking.displayName}
                        </span>
                        <span className="text-foreground-secondary block truncate">
                          {booking.displayName} ·{' '}
                          {new Date(booking.startAt).toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          <Clock3Icon
                            size={12}
                            aria-hidden
                            className="inline"
                          />{' '}
                          {new Date(booking.startAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </Link>
                    </>
                  );
                })()}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dialog.Actions>
        <Dialog.Close>Close</Dialog.Close>
        {onBook ? (
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={onBook}
            aria-label="Book a slot"
            title="Book a slot"
          >
            <CalendarPlusIcon size={15} aria-hidden />
          </Button>
        ) : null}
        <Link to="/schedule" onClick={onClose}>
          <Button size="sm">Open full schedule</Button>
        </Link>
      </Dialog.Actions>
    </Dialog.Root>
  );
}
