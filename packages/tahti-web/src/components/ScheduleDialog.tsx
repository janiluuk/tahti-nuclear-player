import { Link } from '@tanstack/react-router';
import { CalendarDaysIcon, Clock3Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog } from '@nuclearplayer/ui';

import { fetchShowBookings, type StudioShowBooking } from '../api/shows';
import { PageLoading } from './PageStates';

const DAYS_VISIBLE = 14;

export function ScheduleDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [bookings, setBookings] = useState<StudioShowBooking[]>([]);
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
                <CalendarDaysIcon
                  size={14}
                  className="text-primary shrink-0"
                  aria-hidden
                />
                <span className="text-foreground-secondary shrink-0">
                  {new Date(booking.startAt).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-foreground-secondary inline-flex shrink-0 items-center gap-1">
                  <Clock3Icon size={12} aria-hidden />
                  {new Date(booking.startAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {booking.note ?? booking.displayName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dialog.Actions>
        <Dialog.Close>Close</Dialog.Close>
        <Link to="/schedule" onClick={onClose}>
          <Button size="sm">Open full schedule</Button>
        </Link>
      </Dialog.Actions>
    </Dialog.Root>
  );
}
