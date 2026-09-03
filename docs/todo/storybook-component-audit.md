# Storybook history/stats component audit

Scan of Storybook (`packages/storybook`) for history/stats/graph components,
checked against what `packages/tahti-web` (the real production app) actually
ships, to see whether Storybook's stories still reflect the current, official
components — UI-only, no behavior/data changes.

## Finding: the shared HistoryCharts primitives are already correct and current

`@tahti-player/ui`'s `packages/ui/src/components/HistoryCharts/*`
(`CalendarHeatmap`, `DayOfWeekChart`, `ListeningClock`) plus `StatChip`,
`HistoryRow`, `HistoryDayGroup`, and `TrackTable` are **not** stale
Nuclear-fork leftovers — they're exactly what production uses today. Grep
confirms only two production call sites, both current:

- `packages/tahti-web/src/components/history/HistoryStatsSection.tsx` —
  composes `CalendarHeatmap`, `DayOfWeekChart`, `ListeningClock`, `TopList`,
  `Select`, `EmptyState`, `Box`, `ScrollableArea`.
- `packages/tahti-web/src/components/history/HistoryListSection.tsx` —
  composes `HistoryDayGroup`, `HistoryRow`, `Pagination`, `Select`,
  `EmptyState`.

So there is no swap to make here — no candidate found. What *was* missing:
Storybook only had stories for the individual primitives in isolation
(`CalendarHeatmap.stories.tsx`, `DayOfWeekChart.stories.tsx`,
`ListeningClock.stories.tsx`, `HistoryRow.stories.tsx`,
`HistoryDayGroup.stories.tsx`, `StatChip.stories.tsx`) — nothing showed how
they're actually assembled together on the real Listening History page. That
gap is what "update the storybook to match the currently existing
components" turned out to mean here: not a bad-component swap, but two
missing in-context stories.

### Added (this pass)

- `packages/storybook/src/tahti-web/HistoryStatsSection.stories.tsx` — new.
  Renders the real `HistoryStatsSection` component (imported straight from
  `@tahti-web/components/history/HistoryStatsSection`, same pattern as the
  other `tahti-web/*.stories.tsx` files) with 120 mock `HistoryEntry` rows
  spread over 30 days / 5 mock artists, so the calendar heatmap, day-of-week
  bars, and time-of-day clock all render with real-looking data. `Default`
  and `Empty` variants.
- `packages/storybook/src/tahti-web/HistoryListSection.stories.tsx` — new.
  Renders the real `HistoryListSection` component with 34 mock entries
  spanning several days, so day-grouping and pagination are visible.
  `Default` and `Empty` variants.

Both build cleanly (`pnpm --filter @tahti-player/storybook build`, verified
— chunks `HistoryStatsSection.stories-*.js` / `HistoryListSection.stories-*.js`
present in `storybook-static/assets/`). No existing story was removed or
modified — the old primitive-only stories stay as-is, these are additive.

## Examined and excluded: StatChip vs. StatNumber

`packages/ui/src/components/StatChip/StatChip.tsx` (documented in
`StatChip.stories.tsx`) and `packages/tahti-web/src/components/tahti/StatNumber.tsx`
(used in `StudioStatsView.tsx` / `StudioStatsDetailView.tsx`, **not**
documented in Storybook) look like duplicates at first glance but are not:

- `StatChip` — a complete bordered chip: icon + big value + uppercase label,
  meant for compact inline stat badges.
- `StatNumber` — a bare `<span>`, just a large accent-colored number with no
  label/border, meant to be composed inside a parent layout that supplies
  its own label/context (e.g. a payout figure heading).

Different jobs, not a clean 1:1 swap — per the "leave out rather than force
it" rule, no change made here. If `StatNumber` usage grows, it may be worth
promoting it into `@tahti-player/ui` alongside `StatChip` as a documented
primitive of its own (separate task, not a swap).

## Everything else checked

`FanSubscriptionStats`, `MembershipStatusPanel`, `AdminStatusView`,
`ListenerWorldMap`, `TrackInsightsPanel` and other stat/graph-shaped
`tahti-web` components already have current stories under
`packages/storybook/src/tahti-web/*.stories.tsx` mirroring the real
components — no gap found there.

`TrackTable` (`@tahti-player/ui`) has no direct tahti-web usage found via
grep at audit time; left as-is (no evidence it's stale, just not currently
wired into tahti-web — out of scope to speculate further without a task
asking for that).
