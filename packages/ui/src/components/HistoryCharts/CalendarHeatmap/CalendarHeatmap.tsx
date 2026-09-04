import { cloneElement, type FC, type KeyboardEvent } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';

import './CalendarHeatmap.css';

import { cn } from '../../../utils';
import { toActivities } from './activities';
import type { CalendarHeatmapProps } from './types';

const LIGHT_COLORS = [
  'var(--background-secondary)',
  'color-mix(in oklab, var(--accent-green) 25%, var(--background-secondary))',
  'color-mix(in oklab, var(--accent-green) 55%, var(--background-secondary))',
  'var(--accent-green)',
  'color-mix(in oklab, var(--accent-green) 70%, black)',
];

const DARK_COLORS = [
  'var(--background-secondary)',
  'color-mix(in oklab, var(--accent-green) 25%, var(--background-secondary))',
  'color-mix(in oklab, var(--accent-green) 55%, var(--background-secondary))',
  'color-mix(in oklab, var(--accent-green) 80%, var(--background-secondary))',
  'var(--accent-green)',
];

export const CalendarHeatmap: FC<CalendarHeatmapProps> = ({
  days,
  labels,
  colorScheme,
  formatValue,
  formatDate,
  onDayClick,
  className,
}) => {
  const [monday, tuesday, wednesday, thursday, friday, saturday, sunday] =
    labels.weekdays;

  return (
    <div
      data-testid="calendar-heatmap"
      className={cn('w-fit text-xs', className)}
      style={{ color: 'var(--foreground-secondary)' }}
    >
      <ActivityCalendar
        data={toActivities(days)}
        colorScheme={colorScheme}
        theme={{ light: LIGHT_COLORS, dark: DARK_COLORS }}
        blockSize={16}
        weekStart={1}
        showTotalCount={false}
        showWeekdayLabels
        tooltips={{
          activity: {
            text: (activity) =>
              `${formatValue(activity.count)} · ${formatDate(activity.date)}`,
            placement: 'top',
          },
        }}
        renderBlock={
          onDayClick
            ? (block, activity) =>
                cloneElement(block, {
                  role: 'button',
                  tabIndex: 0,
                  style: { ...block.props.style, cursor: 'pointer' },
                  onClick: () => onDayClick(activity.date),
                  onKeyDown: (event: KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onDayClick(activity.date);
                    }
                  },
                })
            : undefined
        }
        labels={{
          months: labels.months,
          weekdays: [
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
          ],
          legend: {
            less: labels.legendLess,
            more: labels.legendMore,
          },
        }}
      />
    </div>
  );
};
