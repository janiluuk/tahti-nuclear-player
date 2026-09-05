import { FC } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import { DayOfWeekTooltip } from './DayOfWeekTooltip';
import type { DayOfWeekChartProps } from './types';

const barTopRadius: [number, number, number, number] = [4, 4, 0, 0];

export const DayOfWeekChart: FC<DayOfWeekChartProps> = ({
  values,
  labels,
  formatValue,
  onBarClick,
  className,
  ...props
}) => {
  const data = labels.weekdays.map((weekday, index) => ({
    weekday,
    value: values[index] ?? 0,
    index,
  }));

  const tickInterval =
    data.length > 14 ? Math.max(0, Math.ceil(data.length / 10) - 1) : 0;

  return (
    <ResponsiveContainer
      data-testid="day-of-week-chart"
      width="100%"
      height="100%"
      className={className}
      {...props}
    >
      <BarChart data={data}>
        <XAxis
          dataKey="weekday"
          tickLine={false}
          axisLine={false}
          interval={tickInterval}
          tick={{ className: 'fill-foreground-secondary text-xs' }}
        />
        <Tooltip
          cursor={false}
          content={<DayOfWeekTooltip formatValue={formatValue} />}
        />
        <Bar
          dataKey="value"
          radius={barTopRadius}
          fill="var(--color-primary)"
          stroke="var(--color-border)"
          className="stroke-(length:--border-width)"
          cursor={onBarClick ? 'pointer' : undefined}
          onClick={(_, index) => {
            if (typeof index === 'number') {
              onBarClick?.(index);
            }
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
