# CardsRow and multi-select/Combobox component audit

Scan of `packages/tahti-web` (production) for (1) card-list widgets that
overflow their container and could use `@tahti-player/ui`'s `CardsRow`
(horizontally-scrollable row, in Storybook, currently unused in production),
and (2) hand-rolled multi-select/free-text inputs that could use the shared
`CreatableCombobox`. UI-only — no data/behavior changes.

## 1. CardsRow: no safe swap found — documented instead

`packages/ui/src/components/CardsRow/CardsRow.tsx` (demoed in
`packages/storybook/src/CardsRow.stories.tsx`) has **zero production call
sites** — confirmed by grep across `packages/tahti-web/src`. It renders a
single horizontally-scrollable row with a free-text filter input, a single
`badge` string, and scroll-left/right buttons; each item renders through a
fixed internal `<Card src title subtitle onClick>` — there is no
children/render-prop escape hatch (`grep -n "renderItem\|children\|ReactNode"
CardsRow.tsx` → no matches).

Candidate widgets in `ListenView.tsx` (Listen page) — genuinely more items
than fit in one row, i.e. real CardsRow shapes:

- **Radio presets row** (`ListenView.tsx` ~L480-538, `<SectionShell
  title="Radio"><CardGrid>...`) — each item wraps `Card` with an absolutely
  positioned `RadioStationCoverEditButton` overlay (edit cover).
- `ListenerWidgetsSection.tsx` L88-131 (enabled internet-radio stations) —
  same pattern: `Card` plus an overlay edit button and an overlay remove
  (`X`) button.

Both are blocked by the same gap: **CardsRow's item shape has no slot for
per-item overlay controls**, and adding one would be extending the shared
component's API, not a UI-only swap of an existing one — out of scope for
this pass. Swapping either as-is would silently drop the edit-cover /
remove-station buttons, a real functionality loss, so neither was changed.

The main artist/channel directory grid in `ListenView.tsx` (~L679,
`filtered.map((ch) => …)`) was considered and **excluded on purpose**: it's
the page's primary paginated content (potentially many artists), already
correctly rendered as a wrapping `CardGrid` with `FilterChips` above it for
genre/artist-type filtering (~L642-661). Forcing that into a single
horizontal-scroll row would be a UX regression, not an improvement — a
`CardsRow` is a *secondary row widget* pattern, not a directory-browse
pattern, so this one is correctly left alone.

**Additional blocker for this pass:** `ListenView.tsx`, `DiscoverView.tsx`,
and `LibraryView.tsx` — the other places with card-list widgets — are all
currently uncommitted/modified by a different, concurrently-running session
in this same checkout (confirmed via `git status --short` immediately before
this audit: 186 lines changed across those views plus `SectionTabs.tsx` and
`RightRailPanel.tsx`). Editing them now risks silently discarding in-flight
work from that session, so no production file was touched in this pass —
this section exists so a future pass (once that work lands) has exact
file:line pointers instead of starting the search over.

### Added (this pass)

- `packages/storybook/src/CardsRow.stories.tsx` — added a `TahtiRadioRow`
  story using tahti-styled mock data (internet radio station names/genres,
  Tahti-shaped image URLs) instead of only the generic "album" mock data, so
  the component's fit for a Tahti radio/channel row is visible in Storybook
  even though nothing consumes it in production yet. No existing story
  changed.

### Filter labels ("new to me" style)

The user's "add filters as labels on the cardsrow like the storybook"
request doesn't map onto `CardsRow` as built — its only "label" affordances
are a single static `badge` string and a free-text `filterPlaceholder`
input, not multi-chip filter labels. Production already has a *better*,
separate pattern for exactly this — `@tahti-player/ui`'s `FilterChips`
(`packages/ui/src/components/FilterChips`), already used for genre/type
filters above the `CardGrid` in both `ListenView.tsx` (~L642-661) and
`DiscoverView.tsx` (~L400-425, all three currently mid-edit, see above). No
change needed here: the "filter chips above a card list" pattern the user
described already exists and is already the official component, just paired
with `CardGrid` rather than `CardsRow`.

## 2. Multi-select / free-text Combobox: already correct, no gap found

`CreatableCombobox` (`packages/ui/src/components/Combobox/CreatableCombobox.tsx`,
demoed in `packages/storybook/src/Combobox.stories.tsx`) is **single-value**
(`value: string`, `onValueChange: (v: string) => void`) — confirmed by
reading its props. A true multi-value swap-in isn't possible without
extending the component itself, which is out of scope here (would be new
behavior, not a UI-only swap).

Genre selection — the user's own example of a multi-select case — already
solves this correctly, and isn't hand-rolled:

- `packages/tahti-web/src/components/GenrePicker.tsx` composes the official
  `FilterChips` (multi-select chips for presets + already-chosen custom
  genres, capped at `MAX_GENRES`) with `CreatableCombobox` (add one more,
  preset or free-typed) — i.e. it's already built from the two official
  primitives, not a duplicate implementation.
- Used in `OnboardingView.tsx` (~L437) and `SettingsPanels.tsx` (~L1333) for
  the artist's own genre tags (multi), and documented in Storybook already:
  `packages/storybook/src/tahti-web/GenrePicker.stories.tsx` (`Empty`,
  `SomeSelected`, `AtLimit` stories, current and correct).
- The other place genre appears as `string[]`, `DiscoverView.tsx`'s
  `filters.genres` (browse-filter, not a picker), already uses `FilterChips`
  directly (see above) — also correct, no free-text needed for filtering by
  existing genres.

`StudioSoundView.tsx` (~L594-600) uses `CreatableCombobox` directly for a
single-genre-per-track field — correct as-is, single value is the right
shape there (one track has one genre).

Grepped broadly for other hand-rolled multi-select/tag inputs
(`useState<string[]>` not already touching `GenrePicker`/`FilterChips`/
`CreatableCombobox`) across `views/` and `components/`: found
`FanTiersEditor.tsx` (perk checklist, fixed set — not free-text),
`StudioCollectionEditView.tsx` (slideshow image URL list — not a
text/tag picker), `AdminArtworkPresetsView.tsx` (artwork pool — image URLs,
not text), `StudioRadioSubmissionPanel.tsx` (a selection list, not
free-text-creatable). None of these are the "pick from a list or type your
own" shape `CreatableCombobox` solves — no swap candidates among them.

**Conclusion: no changes made for this section.** The multi-select +
free-text pattern the user asked about is already implemented correctly
with the official shared components.
