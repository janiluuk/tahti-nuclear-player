import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { EmptyState } from '@tahti-player/ui';

import { fetchVenues } from '../api/client';
import type { VenueDirectoryItem } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageLoading } from '../components/PageStates';
import { countryFlagAndName } from '../lib/countries';
import { syncDocumentMetadata } from '../lib/seo';

export function VenueDetailView({ slug }: { slug: string }) {
  const [venue, setVenue] = useState<VenueDirectoryItem | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    setVenue(undefined);
    void fetchVenues().then((res) => {
      if (cancelled) {
        return;
      }
      const found = res.data.find((v) => v.slug === slug) ?? null;
      setVenue(found);
      if (found) {
        const place = [found.city, found.countryCode]
          .filter(Boolean)
          .join(', ');
        syncDocumentMetadata(window.location.pathname, {
          title: `${found.name} on Tahti`,
          description:
            found.description ??
            `${found.name}${place ? ` — ${place}` : ''} is a verified venue on Tahti.`,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const backLink = (
    <Link
      to="/discover"
      search={{ tab: 'venues' }}
      className="text-foreground-secondary inline-flex w-fit items-center gap-1.5 text-xs hover:underline"
    >
      <ArrowLeftIcon size={13} aria-hidden />
      All venues
    </Link>
  );

  if (venue === undefined) {
    return (
      <PageFrame maxWidth="3xl">
        {backLink}
        <PageLoading label="Loading venue…" />
      </PageFrame>
    );
  }

  if (venue === null) {
    return (
      <PageFrame maxWidth="3xl">
        {backLink}
        <EmptyState
          title="Venue not found"
          description={`No verified venue matches "${slug}".`}
          action={
            <Link
              to="/discover"
              search={{ tab: 'venues' }}
              className="text-sm font-medium underline-offset-2 hover:underline"
            >
              Browse venues
            </Link>
          }
        />
      </PageFrame>
    );
  }

  return (
    <PageFrame maxWidth="3xl">
      {backLink}
      <PageHeader
        title={venue.name}
        meta={
          <div className="flex flex-wrap items-center gap-3">
            {(venue.city ?? venue.countryCode) && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon size={13} aria-hidden />
                {[venue.city, countryFlagAndName(venue.countryCode) || null]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            )}
            {venue.capacity != null && (
              <span className="inline-flex items-center gap-1">
                <UsersIcon size={13} aria-hidden />
                Capacity {venue.capacity}
              </span>
            )}
          </div>
        }
      />

      {venue.photos?.[1] && (
        <img
          src={venue.photos[1]}
          alt={`${venue.name} cover`}
          className="border-border max-h-72 w-full rounded-lg border object-cover"
        />
      )}
      {venue.photos?.[0] && (
        <img
          src={venue.photos[0]}
          alt={`${venue.name} venue`}
          className="h-24 w-24 rounded-lg object-cover"
        />
      )}

      {venue.description ? (
        <p className="text-foreground text-sm whitespace-pre-line">
          {venue.description}
        </p>
      ) : (
        <p className="text-foreground-secondary text-sm">
          This venue hasn't added a description yet.
        </p>
      )}
      {venue.externalLinks?.website && (
        <a
          href={venue.externalLinks.website}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium underline-offset-2 hover:underline"
        >
          Venue website →
        </a>
      )}
    </PageFrame>
  );
}
