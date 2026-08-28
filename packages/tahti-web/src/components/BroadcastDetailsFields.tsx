import { MessageCircleIcon, MicIcon } from 'lucide-react';

import { Button, Input, Select } from '@nuclearplayer/ui';

import type { ShowType, StudioShowSeries } from '../api/shows';

export type BroadcastDetailsValues = {
  title: string;
  description: string;
  coverUrl: string;
  mode: 'SINGLE' | 'SERIES';
  showType: ShowType;
  durationHours: 1 | 2;
};

type Props = {
  values: BroadcastDetailsValues;
  shows?: StudioShowSeries[];
  selectedShowId?: string;
  episodeNumber?: number;
  onChange: (values: BroadcastDetailsValues) => void;
  onShowChange?: (showId: string) => void;
};

export function BroadcastDetailsFields({
  values,
  shows = [],
  selectedShowId = '',
  episodeNumber = 1,
  onChange,
  onShowChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {onShowChange && shows.length > 0 ? (
        <div className="flex flex-col gap-1 text-sm">
          <Select
            label="Prepared show"
            placeholder="Create a new show"
            options={shows.map((show) => ({
              id: show.id,
              label: show.title,
            }))}
            value={selectedShowId}
            onValueChange={onShowChange}
          />
          <span className="text-foreground-secondary text-xs">
            Existing show details fill in below and prepare the next episode
            automatically.
          </span>
        </div>
      ) : null}

      <div
        className="border-border flex flex-wrap gap-1 rounded-lg border p-1"
        role="group"
        aria-label="Broadcast type"
      >
        {(
          [
            ['LIVE_SET', 'Live set', MicIcon] as const,
            ['TALK', 'Talk', MessageCircleIcon] as const,
          ] as const
        ).map(([type, label, Icon]) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant="text"
            onClick={() => onChange({ ...values, showType: type })}
            aria-pressed={values.showType === type}
            className={
              values.showType === type
                ? 'bg-primary text-primary-foreground rounded-md'
                : 'text-foreground-secondary rounded-md'
            }
          >
            <Icon size={13} aria-hidden />
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div
          className="border-border flex gap-1 rounded-lg border p-1"
          role="group"
          aria-label="Duration"
        >
          {([1, 2] as const).map((hours) => (
            <Button
              key={hours}
              type="button"
              size="sm"
              variant="text"
              onClick={() => onChange({ ...values, durationHours: hours })}
              aria-pressed={values.durationHours === hours}
              className={
                values.durationHours === hours
                  ? 'bg-primary text-primary-foreground rounded-md'
                  : 'text-foreground-secondary rounded-md'
              }
            >
              {hours}h
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['SERIES', 'SINGLE'] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={values.mode === mode ? undefined : 'text'}
              onClick={() => onChange({ ...values, mode })}
            >
              {mode === 'SERIES' ? 'Continuous show' : 'Single show'}
            </Button>
          ))}
        </div>
        {values.mode === 'SERIES' ? (
          <span className="text-foreground-secondary text-xs">
            Episode #{episodeNumber}
          </span>
        ) : null}
      </div>

      <Input
        label="Show name"
        value={values.title}
        onChange={(event) => onChange({ ...values, title: event.target.value })}
        placeholder="New show name or episode title"
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground-secondary text-xs uppercase">
          Show description
        </span>
        <textarea
          value={values.description}
          onChange={(event) =>
            onChange({ ...values, description: event.target.value })
          }
          rows={2}
          className="border-border bg-background rounded-md border px-3 py-2"
          placeholder="What listeners can expect"
        />
      </label>
      <Input
        label="Cover image URL"
        value={values.coverUrl}
        onChange={(event) =>
          onChange({ ...values, coverUrl: event.target.value })
        }
        placeholder="https://…"
      />
      {values.coverUrl ? (
        <img
          src={values.coverUrl}
          alt="Show cover preview"
          className="h-20 w-20 rounded-md object-cover"
        />
      ) : null}
    </div>
  );
}
