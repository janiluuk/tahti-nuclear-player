# Studio Stats Storybook charts + lists

**Status:** executed (2026-09-05)
**Branch:** `feat/studio-subtabs-help-layer`

## Done

1. Storybook `TopList` for engagement units (and existing top lists).
2. Plays & listeners: compact `ListenerWorldMap` + Plays over time side by side.
3. `DayOfWeekChart` for ≤30 days (N bars); `CalendarHeatmap` when longer.
4. Day click → `Dialog` + `ListeningClock` (hourly mock until API).
5. FilterChips: Today, 7, 30, All time, Custom (date From/To + Apply).
6. Sibling: stats range `1` + `from`/`to` window on `/api/me/stats/plays`.

## Follow-ups

- Real hourly series on sibling API (replace mock `fetchStatsPlaysHourly`).
- Sweep other Studio ranking rows outside Stats if any remain hand-rolled.
