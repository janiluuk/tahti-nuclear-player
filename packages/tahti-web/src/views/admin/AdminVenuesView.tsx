import { CheckIcon, MapPinIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchAdminVenues,
  setAdminVenueVerification,
  type AdminVenue,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function AdminVenuesView() {
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    void fetchAdminVenues().then((result) => {
      setVenues(result.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const filteredVenues = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return venues;
    }
    return venues.filter((venue) =>
      [venue.name, venue.slug, venue.city, venue.countryCode, venue.createdBy]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, venues]);

  const toggleVerification = async (venue: AdminVenue) => {
    setBusySlug(venue.slug);
    setError(null);
    const result = await setAdminVenueVerification(
      venue.slug,
      venue.verifiedAt === null,
    );
    setBusySlug(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setVenues((current) =>
      current.map((item) =>
        item.slug === venue.slug
          ? {
              ...item,
              verifiedAt:
                venue.verifiedAt === null ? new Date().toISOString() : null,
            }
          : item,
      ),
    );
  };

  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/venues">
          <div className="flex max-w-4xl flex-col gap-6">
            <StudioPageHeader
              title="Venues"
              subtitle="Review and manage venues submitted to the Tahti directory."
            />
            <StudioPanel>
              <div className="flex flex-col gap-3">
                <Input
                  label="Search venues"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, city, slug, or submitter"
                />
                {error ? (
                  <p className="text-accent-red text-sm">{error}</p>
                ) : null}
                {loading ? (
                  <PageLoading label="Loading venues…" />
                ) : filteredVenues.length === 0 ? (
                  <p className="text-foreground-secondary text-sm">
                    No venues found.
                  </p>
                ) : (
                  <ul className="divide-border divide-y">
                    {filteredVenues.map((venue) => (
                      <li
                        key={venue.id}
                        className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <MapPinIcon
                          size={17}
                          className="text-primary"
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{venue.name}</p>
                          <p className="text-foreground-secondary text-xs">
                            {venue.city}, {venue.countryCode} · /{venue.slug} ·
                            submitted by {venue.createdBy}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={venue.verifiedAt ? 'text' : undefined}
                          disabled={busySlug === venue.slug}
                          onClick={() => void toggleVerification(venue)}
                        >
                          {venue.verifiedAt ? (
                            <XIcon size={14} aria-hidden />
                          ) : (
                            <CheckIcon size={14} aria-hidden />
                          )}
                          {venue.verifiedAt ? 'Unverify' : 'Verify'}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </StudioPanel>
          </div>
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
