import { Link } from '@tanstack/react-router';
import { CalendarPlusIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input, SaveButton } from '@nuclearplayer/ui';

import {
  cancelVenueBroadcast,
  createVenueBroadcast,
  fetchMyVenues,
  patchVenue,
  type MyVenue,
} from '../../api/venues-manage';
import { PageLoading } from '../../components/PageStates';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';

function VenueCard({
  venue,
  onChanged,
}: {
  venue: MyVenue;
  onChanged: () => void;
}) {
  const [name, setName] = useState(venue.name);
  const [address, setAddress] = useState(venue.address);
  const [city, setCity] = useState(venue.city);
  const [capacity, setCapacity] = useState(
    venue.capacity != null ? String(venue.capacity) : '',
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);

  const [startAt, setStartAt] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');

  const upcoming = venue.broadcasts.filter((b) => b.state !== 'CANCELED');

  return (
    <StudioPanel
      title={venue.name}
      description={`/venues/${venue.slug} · ${venue.verifiedAt ? 'Verified' : 'Pending verification'}`}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {msg && <p className="text-xs">{msg}</p>}
        <SaveButton
          label="Save venue"
          onClick={() => {
            const cap = Number(capacity);
            void patchVenue(venue.slug, {
              name: name.trim(),
              address: address.trim(),
              city: city.trim(),
              capacity: capacity.trim() && Number.isFinite(cap) ? cap : null,
            }).then((r) => {
              setMsg(r.ok ? 'Venue saved.' : r.error);
              if (r.ok) {
                onChanged();
              }
            });
          }}
        />
      </div>

      <div className="border-border border-t pt-4">
        <div className="mb-2 flex items-center justify-between">
          <Eyebrow className="block">Bookings</Eyebrow>
          {!bookingFormOpen && (
            <Button
              size="sm"
              variant="text"
              onClick={() => setBookingFormOpen(true)}
            >
              <PlusIcon size={14} aria-hidden className="mr-1.5" />
              New booking
            </Button>
          )}
        </div>
        {upcoming.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No upcoming bookings.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {new Date(b.startAt).toLocaleString()}
                  </div>
                  {b.description && (
                    <div className="text-foreground-secondary text-xs">
                      {b.description}
                    </div>
                  )}
                </div>
                <Button
                  size="icon-sm"
                  variant="text"
                  aria-label={`Cancel booking on ${new Date(b.startAt).toLocaleString()}`}
                  onClick={() => {
                    void cancelVenueBroadcast(venue.slug, b.id).then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                      } else {
                        onChanged();
                      }
                    });
                  }}
                >
                  <Trash2Icon size={14} aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {bookingFormOpen && (
          <div className="border-border bg-background mt-3 flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Start
                </span>
                <input
                  type="datetime-local"
                  className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </label>
              <Input
                label="Description"
                value={bookingDesc}
                onChange={(e) => setBookingDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!startAt}
                onClick={() => {
                  void createVenueBroadcast(venue.slug, {
                    startAt: new Date(startAt).toISOString(),
                    description: bookingDesc.trim() || undefined,
                  }).then((r) => {
                    if (!r.ok) {
                      setMsg(r.error);
                    } else {
                      setStartAt('');
                      setBookingDesc('');
                      setBookingFormOpen(false);
                      onChanged();
                    }
                  });
                }}
              >
                <CalendarPlusIcon size={14} aria-hidden className="mr-1.5" />
                Add booking
              </Button>
              <Button
                size="sm"
                variant="text"
                onClick={() => setBookingFormOpen(false)}
              >
                <XIcon size={14} aria-hidden className="mr-1.5" />
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </StudioPanel>
  );
}

export function StudioVenuesView() {
  const [venues, setVenues] = useState<MyVenue[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    void fetchMyVenues().then((r) => {
      setVenues(r.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/venues" />
        <StudioPageHeader
          title="Venues"
          subtitle="Manage venues you registered and their live show bookings."
          action={
            <Link to="/venues/register">
              <Button size="sm" variant="secondary">
                <PlusIcon size={14} aria-hidden className="mr-1.5" />
                Register a venue
              </Button>
            </Link>
          }
        />

        {loading ? (
          <PageLoading label="Loading…" />
        ) : venues.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No venues yet — register one to start booking shows.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} onChanged={reload} />
            ))}
          </div>
        )}
      </div>
    </StudioGate>
  );
}
