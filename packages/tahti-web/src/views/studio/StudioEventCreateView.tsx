import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeftIcon, CalendarPlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, Input, Textarea } from '@nuclearplayer/ui';

import { createEvent } from '../../api/events';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioEventCreateView() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [startAt, setStartAt] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = Boolean(
    title.trim() && place.trim() && location.trim() && startAt,
  );

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/events" />
        <StudioPageHeader
          title="Add event"
          subtitle="Publish a new appearance to your artist profile."
        />
        <StudioPanel title="Event details">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <Input
                label="Place"
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                placeholder="Northern Lights Hall"
              />
              <Input
                label="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Helsinki, Finland"
              />
              <Input
                label="Event URL (optional)"
                value={eventUrl}
                onChange={(event) => setEventUrl(event.target.value)}
                placeholder="https://…"
              />
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                Description
              </span>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="What should people expect — set details, door time, ticketing…"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                Start
              </span>
              <input
                type="datetime-local"
                className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
              />
            </label>
            {message && (
              <p className="text-accent-red text-sm" role="alert">
                {message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link to="/studio/events">
                <Button size="sm" variant="secondary">
                  <ArrowLeftIcon size={14} aria-hidden className="mr-1.5" />
                  Cancel
                </Button>
              </Link>
              <Button
                size="sm"
                disabled={!canSubmit || busy}
                onClick={() => {
                  setBusy(true);
                  setMessage(null);
                  void createEvent({
                    title: title.trim(),
                    description: description.trim(),
                    place: place.trim(),
                    location: location.trim(),
                    eventUrl: eventUrl.trim() || undefined,
                    startAt: new Date(startAt).toISOString(),
                  }).then((result) => {
                    setBusy(false);
                    if (!result.ok) {
                      setMessage(result.error);
                      return;
                    }
                    void navigate({ to: '/studio/events' });
                  });
                }}
              >
                <CalendarPlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Adding…' : 'Add event'}
              </Button>
            </div>
          </div>
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
