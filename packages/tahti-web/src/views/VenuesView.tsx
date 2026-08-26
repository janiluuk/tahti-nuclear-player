import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchVenues } from '../api/client';
import type { VenueDirectoryItem } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { TahtiMapLink } from '../components/TahtiMapLink';
import { countryFlagAndName } from '../lib/countries';

export function VenuesView() {
  const [venues, setVenues] = useState<VenueDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchVenues().then((res) => {
      if (cancelled) {
        return;
      }
      setVenues(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageFrame maxWidth="3xl">
      <PageHeader
        title="Venues"
        subtitle="Browse verified venues in the Tahti community."
        actions={
          <Link
            to="/venues/register"
            className="text-sm font-medium underline-offset-2 hover:underline"
          >
            Register a venue
          </Link>
        }
      />

      {loading ? (
        <p className="text-foreground-secondary text-sm">Loading venues…</p>
      ) : venues.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No verified venues returned.
        </p>
      ) : (
        <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
          {venues.map((v) => (
            <li key={v.id} className="flex flex-col gap-1 px-4 py-3">
              <Link
                to="/v/$slug"
                params={{ slug: v.slug }}
                className="font-medium hover:underline"
              >
                {v.name}
              </Link>
              <div className="text-foreground-secondary text-xs">
                {[v.city, countryFlagAndName(v.countryCode) || null]
                  .filter(Boolean)
                  .join(', ')}
                {v.capacity != null ? ` — cap. ${v.capacity}` : ''}
              </div>
              {v.description && (
                <p className="text-foreground text-sm">{v.description}</p>
              )}
              <Link
                to="/v/$slug"
                params={{ slug: v.slug }}
                className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
              >
                View venue →
              </Link>
            </li>
          ))}
        </ul>
      )}

      <TahtiMapLink label="Full feature map →" />
    </PageFrame>
  );
}
