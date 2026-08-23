import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchVenueProfile } from '../api/client';
import type { VenueProfile } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';

function formatWhen(startAt: string, endAt: string | null): string {
  const start = new Date(startAt);
  const startLabel = start.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  if (!endAt) {
    return startLabel;
  }
  const endLabel = new Date(endAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${startLabel} – ${endLabel}`;
}

export function VenueDetailView({ slug }: { slug: string }) {
  const [venue, setVenue] = useState<VenueProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchVenueProfile(slug).then((res) => {
      if (cancelled) {
        return;
      }
      setVenue(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <PageFrame maxWidth="3xl">
        <p className="text-foreground-secondary text-sm">Loading venue…</p>
      </PageFrame>
    );
  }

  if (!venue) {
    return (
      <PageFrame maxWidth="3xl">
        <Link
          to="/venues"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Venues
        </Link>
        <p className="text-foreground-secondary mt-4 text-sm">
          Venue not found.
        </p>
      </PageFrame>
    );
  }

  return (
    <PageFrame maxWidth="3xl">
      <Link
        to="/venues"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Venues
      </Link>
      <PageHeader
        title={venue.name}
        subtitle={[venue.city, venue.countryCode].filter(Boolean).join(', ')}
      />
      <div className="flex flex-col gap-4">
        {venue.description && <p className="text-sm">{venue.description}</p>}
        <div className="text-foreground-secondary flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <span>{venue.address}</span>
          {venue.capacity != null && <span>Capacity {venue.capacity}</span>}
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">Upcoming shows</h2>
          {venue.broadcasts.length === 0 ? (
            <p className="text-foreground-secondary mt-2 text-sm">
              No upcoming shows booked at this venue.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {venue.broadcasts.map((b) => (
                <li
                  key={b.id}
                  className="border-border rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="font-medium">
                    {formatWhen(b.startAt, b.endAt)}
                  </div>
                  {b.description && (
                    <p className="text-foreground-secondary mt-0.5 text-xs">
                      {b.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
