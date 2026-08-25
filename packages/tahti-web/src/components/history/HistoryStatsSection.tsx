import { ChartColumnIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Box,
  CalendarHeatmap,
  DayOfWeekChart,
  EmptyState,
  ListeningClock,
  ScrollableArea,
  Select,
  TopList,
} from '@nuclearplayer/ui';

import {
  dailyListeningMs,
  dayOfWeekListeningMs,
  entriesInRange,
  formatHour,
  formatListeningDuration,
  hourlyListeningMs,
  monthLabelsShort,
  RANGE_PRESETS,
  rangeDisplayBounds,
  topArtists,
  topChannels,
  topTracks,
  weekdayLabelsShort,
  type RangePresetId,
} from '../../lib/historyStats';
import { useThemeStore } from '../../plugins/themes';
import type { HistoryEntry } from '../../stores/libraryStore';

const TOP_LIST_SIZE = 10;

function StatsTopList({
  testId,
  title,
  entries,
}: {
  testId: string;
  title: string;
  entries: ReturnType<typeof topTracks>;
}) {
  if (entries.length === 0) {
    return null;
  }
  return (
    <Box variant="tertiary" className="min-w-0 flex-col">
      <TopList
        data-testid={testId}
        title={title}
        entries={entries}
        formatValue={formatListeningDuration}
      />
    </Box>
  );
}

export function HistoryStatsSection({ history }: { history: HistoryEntry[] }) {
  const isDark = useThemeStore((s) => s.dark);
  const [presetId, setPresetId] = useState<RangePresetId>('last30Days');

  const ranged = useMemo(
    () => entriesInRange(history, presetId),
    [history, presetId],
  );

  const dailyDays = useMemo(() => dailyListeningMs(history), [history]);
  const hourlyValues = useMemo(() => hourlyListeningMs(ranged), [ranged]);
  const dayOfWeekValues = useMemo(() => dayOfWeekListeningMs(ranged), [ranged]);
  const hasListening = ranged.length > 0;

  const artists = useMemo(() => topArtists(ranged, TOP_LIST_SIZE), [ranged]);
  const channels = useMemo(() => topChannels(ranged, TOP_LIST_SIZE), [ranged]);
  const tracks = useMemo(() => topTracks(ranged, TOP_LIST_SIZE), [ranged]);
  const hasTopLists =
    artists.length > 0 || channels.length > 0 || tracks.length > 0;
  const rangeBounds = useMemo(
    () => rangeDisplayBounds(history, presetId),
    [history, presetId],
  );
  const rangeDates = rangeBounds
    ? `${new Date(rangeBounds.from).toLocaleDateString(undefined, { dateStyle: 'medium' })} – ${new Date(rangeBounds.to).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
    : null;

  if (history.length === 0) {
    return (
      <EmptyState
        data-testid="history-stats-empty"
        icon={<ChartColumnIcon size={48} />}
        title="Nothing to show yet"
        description="Stats build up from what you've played — come back once you've listened to something."
        className="flex-1"
      />
    );
  }

  return (
    <ScrollableArea
      data-testid="history-stats"
      viewportClassName="@container flex flex-col gap-4 p-4"
    >
      <div className="flex items-center justify-end gap-3">
        {rangeDates && (
          <span
            data-testid="history-stats-range-dates"
            className="text-foreground-secondary text-sm"
          >
            {rangeDates}
          </span>
        )}
        <div data-testid="history-stats-range" className="w-44">
          <Select
            options={RANGE_PRESETS.map((p) => ({ id: p.id, label: p.label }))}
            value={presetId}
            onValueChange={(value) => setPresetId(value as RangePresetId)}
          />
        </div>
      </div>

      {hasTopLists && (
        <div className="grid grid-cols-1 items-start gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          <StatsTopList
            testId="history-top-artists"
            title="Top artists"
            entries={artists}
          />
          <StatsTopList
            testId="history-top-channels"
            title="Top channels"
            entries={channels}
          />
          <StatsTopList
            testId="history-top-tracks"
            title="Top tracks"
            entries={tracks}
          />
        </div>
      )}

      {hasListening ? (
        <div className="flex flex-col items-stretch gap-4 @3xl:flex-row">
          <Box variant="tertiary" className="w-auto flex-col gap-3">
            <h3 className="font-heading text-xl">Time of day</h3>
            <ListeningClock
              values={hourlyValues}
              labels={{
                busiestHour: 'Busiest hour',
                busiestHourValue: 'Listening time',
              }}
              formatValue={formatListeningDuration}
              formatHour={formatHour}
            />
          </Box>
          <Box variant="tertiary" className="min-w-0 flex-1 flex-col gap-3">
            <h3 className="font-heading text-xl">Day of week</h3>
            <div className="min-h-0 flex-1">
              <DayOfWeekChart
                values={dayOfWeekValues}
                labels={{ weekdays: weekdayLabelsShort() }}
                formatValue={formatListeningDuration}
              />
            </div>
          </Box>
        </div>
      ) : (
        <EmptyState
          data-testid="history-stats-empty"
          icon={<ChartColumnIcon size={48} />}
          title="Nothing in this range"
          description="Try a wider range, or come back once you've listened to something more recently."
          className="flex-1"
        />
      )}

      <Box variant="tertiary" className="min-w-fit flex-col gap-3">
        <h3 className="font-heading text-xl">Listening calendar</h3>
        <CalendarHeatmap
          className="mx-auto"
          days={dailyDays}
          labels={{
            months: monthLabelsShort(),
            weekdays: weekdayLabelsShort(),
            legendLess: 'Less',
            legendMore: 'More',
          }}
          colorScheme={isDark ? 'dark' : 'light'}
          formatValue={formatListeningDuration}
          formatDate={(date) =>
            new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
              dateStyle: 'full',
            })
          }
        />
      </Box>
    </ScrollableArea>
  );
}
