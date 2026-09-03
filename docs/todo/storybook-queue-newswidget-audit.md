# Playerbar/sidebar queue redesign, revision-picker audit, and NewsWidget

Four independent asks from the user, executed in one pass. UI/interaction
work only except where explicitly requested new logic (queue reorder/shuffle
actions, sidebar save-as-playlist) — no change to what data is fetched or
how playback itself works.

## 1. Playerbar queue — collapsed strip + count pill + confirm-on-clear

`packages/tahti-web/src/components/BottomQueueStrip.tsx` had a hand-rolled
`QueueChip` rendering every queued item as a full card in the horizontal
strip. Replaced it with the official `QueueItem` component
(`@tahti-player/ui`): the current track renders expanded (full card), every
other item renders `isCollapsed` (thumbnail-only) — exactly the "only the
current track shows the queue item element" behavior asked for. Added a
`Badge` pill next to the clear-queue button showing `queue.length`. Clearing
now always opens `ClearQueueConfirmDialog` (new, shared with the sidebar
panel below) instead of clearing immediately.

## 2. QueueItemPopover for file-revision selection — no swap, documented

The user's example ("track editor... select revision of the file... preview
and assign as primary") maps to
`packages/tahti-web/src/components/AudioRevisionList.tsx`, which already
does exactly that workflow (Preview / Download / "Use this version" per
revision, backed by `fetchArchiveVersions`/`activateArchiveVersion`).

`QueueItemPopover` (`packages/ui/src/components/QueueItemPopover/`) is a
different thing: a right-click (`triggerOn="contextmenu"`) popover over a
*playback* `Track`, showing `StreamCandidate`s (alternative streaming
sources for the same track — YouTube/SoundCloud/local file, with bitrate/
protocol info via `StreamThumbnail`/`StreamQualityInfo`). It's already used
this way inside `QueuePanel`'s `ReorderableQueueItem`.

`AudioRevisionList`'s data is `ArchiveVersion` (versionNumber, versionLabel,
sourceFormat/bitDepth/sampleRate, isActive, status) — a completely different
shape from `StreamCandidate`, and the interaction is a normal artist-editor
workflow (left-click buttons), not a hidden right-click menu. Forcing
`QueueItemPopover` onto this would mean rewriting it to accept a generic
item/candidate type and trigger mode — a redesign, not the "generic
backward-compatible extension" pattern used elsewhere in these audits — so
left `AudioRevisionList` as-is. No files changed for this item.

## 3. Sidebar queue panel

`packages/tahti-web/src/components/ConnectedQueuePanel.tsx` already wrapped
`QueuePanel` (`@tahti-player/ui`, supports `reorderable`/`onReorder` via
`@dnd-kit` already) but had **zero call sites** — dead code. Wired it in as
a new "Queue" tab in `RightRailPanel.tsx`, alongside the existing Chat and
Notifications tabs (collapsed-rail icon + count badge, expanded `Tabs.Tab`
+ count badge, matching the existing notifications-badge pattern exactly).

Built `SidebarQueuePanel.tsx` (replaces the old unused
`ConnectedQueuePanel` for this purpose) with:

- `reorderable` + `onReorder` → new `reorderQueue(fromIndex, toIndex)`
  action on `playerStore` (array splice, no existing action did this).
- Click a track's name → `navigate({ to: '/t/$id' })`, using
  `soundIdFromPlayableId(track.source.id)` (existing helper in `lib/
  archiveId.ts`) — only for tracks whose source is a Tahti archive item;
  external-provider tracks have no detail route, so their titles stay inert
  (same pattern `PlayableTrackContextMenu.tsx` already uses for "add to
  playlist" being conditional on `soundId`).
- Like icon + highlighted current item → reused `useLibraryStore`'s existing
  `favoriteTracks`/`isFavoriteTrack`/`toggleFavoriteTrack` and
  `playableFromQueueItem` (same favorite mechanism `PlayableTrackContextMenu`
  already uses); `isCurrent` highlighting was already built into `QueueItem`.
- Bottom icon buttons: **Clear** (reuses `ClearQueueConfirmDialog` from #1 —
  one confirm dialog, not two); **Save as playlist** (new
  `SaveQueueAsPlaylistDialog.tsx`, composes the *existing*
  `createStudioCollection` + `addStudioCollectionItem` calls
  `AddToPlaylistPanel.tsx` already uses for single tracks — no new
  persistence, just the same two calls looped over the queue's Tahti-catalog
  tracks; external-provider tracks are skipped with a count shown in the
  dialog, since there's nothing to create a collection item from); **Randomize**
  (new `shuffleQueueOrder()` action — deliberately distinct from the
  existing `shuffle` boolean, which is a persistent *next-track-selection*
  mode and doesn't touch the visible queue array; this is a one-shot
  Fisher-Yates reshuffle of everything after the current track).

Generic, backward-compatible extensions to `@tahti-player/ui` (existing call
sites unaffected — all new props are optional):
`packages/ui/src/components/QueueItem/types.ts` (+`onTitleClick`,
`isLiked`, `onToggleLike`), `QueueItemExpanded.tsx` (renders a heart button
next to remove, and makes the title clickable, only when those props are
passed), `QueuePanel/QueuePanel.tsx` + `ReorderableQueueItem.tsx` (thread
the three new props down to each item by id).

The playerbar's own queue strip (#1) is intentionally untouched by this
section beyond the shared confirm dialog — this is an additional surface,
not a replacement, per the ask.

## 4. Widescreen news/articles widget — new component

New `packages/ui/src/components/NewsWidget/` (`NewsWidget.tsx` +
`ArticleCard.tsx`): same row/slider shell as `CardsRow` (title, optional
badge, scroll-left/right buttons, horizontal scroll container) but with a
wider card (`w-72 sm:w-80` vs `CardsRow`'s fixed thumbnail size) that has
room for a thumbnail (via `ImageReveal`, lazy-loaded + fade-in, same
mechanism `docs/todo/storybook-copybutton-loading-audit.md` established),
a header, and 2-line-clamped teaser text — none of which `CardsRow`'s fixed
`Card` renderer supports.

Not wired into any production page: no news/articles data source exists
anywhere in `packages/tahti-web` (checked — no matching API module).
Storybook-only for now (`packages/storybook/src/NewsWidget.stories.tsx`,
3 stories: default, with badge, empty state) with representative mock
data, per the instruction to build the component/story rather than
fabricate a backend. Production wiring needs a real news/articles endpoint
first.

## Verification

`pnpm --filter @tahti-player/ui run type-check`,
`pnpm --filter @tahti-player/ui test` (58 files / 260 tests passed — 2
unrelated unhandled-exception warnings from `DayOfWeekChart.test.tsx`'s
`cancelAnimationFrame` jsdom issue, pre-existing, not touched by this pass),
`pnpm --filter @tahti-player/tahti-web run type-check`, and
`pnpm --filter @tahti-player/storybook build` — all clean.
