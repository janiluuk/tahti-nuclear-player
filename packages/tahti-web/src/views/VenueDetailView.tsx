import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { EmptyState } from '@tahti-player/ui';

import { fetchVenues } from '../api/client';
import type { VenueDirectoryItem } from '../api/types';
import {
  EntitySocialHeader,
  type EntitySocialStat,
} from '../components/EntitySocialHeader';
import { PageFrame } from '../components/PageHeader';
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

  const placeLabel = [venue.city, countryFlagAndName(venue.countryCode) || null]
    .filter(Boolean)
    .join(', ');

  const headerStats: EntitySocialStat[] =
    venue.capacity != null && venue.capacity > 0
      ? [
          {
            key: 'capacity',
            label: 'Capacity',
            value: venue.capacity,
            icon: UsersIcon,
          },
        ]
      : [];

  const thumb = venue.photos?.[0] ?? null;
  const backdrop = venue.photos?.[1] ?? venue.photos?.[0] ?? null;

  return (
    <PageFrame maxWidth="3xl">
      {backLink}
      <EntitySocialHeader
        title={venue.name}
        imageUrl={thumb}
        location={placeLabel || null}
        description={
          venue.description ? (
            <p className="line-clamp-3 whitespace-pre-line">
              {venue.description}
            </p>
          ) : (
            <p className="text-foreground-secondary">
              This venue hasn&apos;t added a description yet.
            </p>
          )
        }
        backdropUrl={backdrop}
        visualizerPreset="WATER_RIPPLE"
        artworkUrlForVisualizer={thumb}
        stats={headerStats}
        data-testid="venue-social-header"
      >
        {venue.externalLinks?.website ? (
          <a
            href={venue.externalLinks.website}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium underline-offset-2 hover:underline"
          >
            Venue website →
          </a>
        ) : null}
      </EntitySocialHeader>
    </PageFrame>
  );
}
