import { Link } from '@tanstack/react-router';
import {
  CalendarClockIcon,
  CalendarDaysIcon,
  Clock3Icon,
  MapPinIcon,
  RadioIcon,
  SaveIcon,
  Settings2Icon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchChannelSchedule,
  fetchUpcomingBroadcasts,
  patchChannelSchedule,
  type ChannelSchedule,
  type UpcomingBroadcast,
} from '../../api/studio-extras';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_BROADCAST_HOUR = 20;
const DAYS_PER_WEEK = 7;

type LocalDateTime = {
  date: string;
  time: string;
};

type ScheduleCard = {
  id: string;
  startAt: string;
  title: string;
  location?: string | null;
  visibility?: 'PUBLIC' | 'FAN_ONLY';
};

const pad = (value: number) => value.toString().padStart(2, '0');

function toLocalParts(iso: string | null): LocalDateTime {
  if (!iso) {
    return { date: '', time: '' };
  }
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return { date: '', time: '' };
  }
  return {
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  };
}

function fromLocalParts(date: string, time: string): string | null {
  if (!date || !time) {
    return null;
  }
  const value = new Date(`${date}T${time}`);
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso));
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function nextFriday(): Date {
  const value = new Date();
  const friday = 5;
  const daysUntilFriday =
    (friday - value.getDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  value.setDate(value.getDate() + (daysUntilFriday || DAYS_PER_WEEK));
  value.setHours(DEFAULT_BROADCAST_HOUR, 0, 0, 0);
  return value;
}

function ScheduledTimes({ items }: { items: ScheduleCard[] }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <section className="border-border bg-background-secondary/40 overflow-hidden rounded-xl border shadow-sm">
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon size={18} className="text-primary" aria-hidden />
          <h2 className="font-display font-bold">Your next broadcasts</h2>
        </div>
        <span className="text-foreground-secondary text-xs">{timezone}</span>
      </header>
      {items.length === 0 ? (
        <div className="px-4 py-5">
          <p className="text-sm font-medium">Nothing scheduled yet</p>
          <p className="text-foreground-secondary mt-1 text-xs">
            Pick a local date and time below to tell listeners when you return.
          </p>
        </div>
      ) : (
        <ol className="bg-border grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item, index) => (
            <li key={item.id} className="bg-background p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-primary text-xs font-bold tracking-wide uppercase">
                  {index === 0 ? 'Next' : `Upcoming ${index + 1}`}
                </span>
                {item.visibility === 'FAN_ONLY' ? (
                  <span className="text-foreground-secondary text-[10px] uppercase">
                    Fans only
                  </span>
                ) : null}
              </div>
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <div className="text-foreground-secondary mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1">
                  <CalendarDaysIcon size={13} aria-hidden />
                  {formatDate(item.startAt)}
                </span>
                <span className="text-foreground inline-flex items-center gap-1 font-medium">
                  <Clock3Icon size={13} aria-hidden />
                  {formatTime(item.startAt)}
                </span>
              </div>
              {item.location ? (
                <p className="text-foreground-secondary mt-2 flex items-center gap-1 truncate text-xs">
                  <MapPinIcon size={13} aria-hidden />
                  {item.location}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function StudioScheduleView() {
  const [schedule, setSchedule] = useState<ChannelSchedule | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingBroadcast[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([fetchChannelSchedule(), fetchUpcomingBroadcasts()]).then(
      ([scheduleResult, upcomingResult]) => {
        const local = toLocalParts(scheduleResult.data.nextBroadcastAt);
        setSchedule(scheduleResult.data);
        setDate(local.date);
        setTime(local.time);
        setNote(scheduleResult.data.nextBroadcastNote ?? '');
        setUpcoming(upcomingResult.data);
        setLoading(false);
      },
    );
  }, []);

  const scheduledTimes = useMemo<ScheduleCard[]>(() => {
    const rows: ScheduleCard[] = upcoming.map((item) => ({
      id: item.id,
      startAt: item.startAt,
      title: item.title,
      location: item.venue ?? item.location,
      visibility: item.visibility,
    }));
    if (
      schedule?.nextBroadcastAt &&
      !rows.some(
        (item) =>
          new Date(item.startAt).getTime() ===
          new Date(schedule.nextBroadcastAt!).getTime(),
      )
    ) {
      rows.push({
        id: 'channel-next-broadcast',
        startAt: schedule.nextBroadcastAt,
        title: schedule.nextBroadcastNote ?? 'Next live session',
      });
    }
    return rows.sort(
      (left, right) =>
        new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    );
  }, [schedule, upcoming]);

  const setQuickDate = (value: Date) => {
    const local = toLocalParts(value.toISOString());
    setDate(local.date);
    setTime(local.time);
  };

  const saveSchedule = async () => {
    const nextBroadcastAt = fromLocalParts(date, time);
    if ((date || time) && !nextBroadcastAt) {
      setMsg('Choose both a date and time.');
      return;
    }
    setBusy(true);
    setMsg(null);
    const result = await patchChannelSchedule({
      nextBroadcastAt,
      nextBroadcastNote: note.trim() || null,
    });
    setBusy(false);
    if (!result.ok) {
      setMsg(result.error);
      return;
    }
    setSchedule(result.data);
    setMsg('Next broadcast saved.');
  };

  const tomorrow = new Date(Date.now() + MILLISECONDS_PER_DAY);
  tomorrow.setHours(DEFAULT_BROADCAST_HOUR, 0, 0, 0);
  const minimumDate = toLocalParts(new Date().toISOString()).date;

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/schedule" />
        <StudioPageHeader
          title="Schedule"
          subtitle="Plan your next broadcasts. Times use your local timezone."
        />

        <ScheduledTimes items={scheduledTimes} />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel
          title="Next planned broadcast"
          description="This is shown on your public channel so listeners know when to return."
        >
          <div className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground-secondary inline-flex items-center gap-1.5 text-xs uppercase">
                  <CalendarDaysIcon size={13} aria-hidden />
                  Date
                </span>
                <input
                  type="date"
                  min={minimumDate}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground-secondary inline-flex items-center gap-1.5 text-xs uppercase">
                  <Clock3Icon size={13} aria-hidden />
                  Local time
                </span>
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground-secondary text-xs uppercase">
                Quick pick
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setQuickDate(tomorrow)}
              >
                Tomorrow at {pad(DEFAULT_BROADCAST_HOUR)}:00
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setQuickDate(nextFriday())}
              >
                Next Friday
              </Button>
              {(date || time) && (
                <Button
                  size="icon-sm"
                  variant="text"
                  aria-label="Clear planned time"
                  title="Clear planned time"
                  onClick={() => {
                    setDate('');
                    setTime('');
                  }}
                >
                  <XIcon size={15} aria-hidden />
                </Button>
              )}
            </div>

            <Input
              label="Broadcast title or note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Friday deep set"
            />

            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-foreground-secondary text-xs">
                {date && time
                  ? `${formatDate(fromLocalParts(date, time)!)} at ${formatTime(fromLocalParts(date, time)!)}`
                  : 'No next broadcast selected'}
              </p>
              <Button
                size="sm"
                disabled={busy || loading}
                onClick={() => void saveSchedule()}
              >
                {busy ? (
                  <CalendarClockIcon size={15} aria-hidden />
                ) : (
                  <SaveIcon size={15} aria-hidden />
                )}
                {busy ? 'Saving…' : 'Save broadcast'}
              </Button>
            </div>
          </div>
        </StudioPanel>

        <StudioPanel
          title="Offline programme"
          description="Rotation, ordering, automatic uploads, announcements, and playlist tracks are managed together in Channel."
          action={
            <Link to="/studio/channel" search={{ tab: 'radio' }}>
              <Button size="sm" variant="secondary">
                <Settings2Icon size={15} aria-hidden />
                Open 24/7 settings
              </Button>
            </Link>
          }
        >
          <div className="flex items-center gap-3">
            <span className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-lg">
              <RadioIcon size={19} aria-hidden />
            </span>
            <p className="text-foreground-secondary text-sm">
              The 24/7 channel section is now the single place for everything
              that plays while you are offline.
            </p>
          </div>
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
