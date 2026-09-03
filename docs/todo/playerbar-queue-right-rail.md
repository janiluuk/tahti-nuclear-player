# Player bar queue → right rail + waveform seek

**Status:** round 1 executed (2026-09-04).

- [x] `layoutStore.rightRailTab` + `toggleQueueRail`
- [x] `RightRailPanel` uses shared tab
- [x] `Tahti/Player/WaveformSeekbar` Storybook story
- [x] Wire player-bar queue button → `toggleQueueRail` (drop BottomQueueStrip)
- [x] Compact queue viewport + past-item fade
- [x] Swap seek to WaveformSeekbar; title/artist clicks
- [x] Signed-out/mobile queue popover

Full plan below.

---

Worklog: `packages/tahti-web/UI-REDESIGN-WORKLOG.md`
(2026-09-04 — Player bar queue on the right rail).

WORKPLAN: medium-priority Storybook backlog.

## Goal

The player-bar queue button only toggles **enabled/pressed**. It must not
restyle, grow, or replace the compact player bar. The queue fades in on the
**right rail**. The bar’s seek control becomes a **waveform** of the current
track: compact by default, taller when the title is clicked. Artist name
opens that artist’s page.

## Today

| Surface | Behavior |
| --- | --- |
| Player bar queue button | `layoutStore.bottomQueueOpen` expands `BottomQueueStrip` inside `ConnectedPlayerBar` (NowPlaying unmounts, controls move under a horizontal `QueueItem` strip) |
| Right rail Queue tab | `SidebarQueuePanel` → Storybook `QueuePanel` (full-height, reorderable). Tab state is **local** in `RightRailPanel` |
| Seek | `ConnectedSeekBar` → `PlayerBar.SeekBar` (flat bar + times) |
| NowPlaying | `PlayerBar.NowPlaying` — title/artist are inert text |
| Waveform seek | `WaveformSeekbar` exists in tahti-web, **no Storybook story** |
| Signed-in desktop | `PlayerWorkspace.RightSidebar` + `RightRailPanel` |
| Mobile | No right sidebar (`AppShell` mobile shell) |
| Signed-out desktop | No right sidebar (`userId &&` around RightSidebar) |

## Storybook-first (use these)

- `Components/QueuePanel` + `Components/QueueItem` (current = expanded/`isCurrent`; others collapsed). Fade 1–2 **past** items (`opacity`) — add a `QueuePanel` story if that state is new.
- `Components/ScrollableArea` for overflow. **Top/bottom chevrons:** compose `Button` `icon-sm` (ChevronUp/Down) around the viewport; show only when content overflows. Do not hand-roll a second scroller. If chevrons prove reusable, add them to `ScrollableArea` + a story (`Missing states:` until then).
- `Layout/PlayerBar` + `PlayerBar.NowPlaying` / `PlayerBar.Controls` / `PlayerBar.Volume` — keep the compact bar. Extend NowPlaying (or wrap in ConnectedPlayerBar) with **title click** and **artist click**; add stories.
- `Tahti/Player/ConnectedPlayerBar` — remove `bottomQueueOpen` / `BottomQueueStrip` stories; add waveform compact/expanded + queue-button pressed.
- `Tahti/Misc/RightRailPanel` — Queue tab, compact viewport, fade-in, “already open → switch tab”.
- `Tahti/Player/ConnectedQueuePanel` / `SidebarQueuePanel` — compact height, history fade, chevrons.
- Waveform progress: add **`Tahti/Player/WaveformSeekbar`** (compact + expanded + live/no-duration) **before** swapping the bar. Prefer `WaveformSeekbar` (already a scrubbable progress motif). `WaveformCanvas` / `WaveformMinimap` are editor/full-canvas — only use if expanded seek needs real peaks. Ambient `Waveform` is not a seek control.
- `EmptyState` for an empty queue (QueuePanel already has empty).
- `Badge` on the queue button (count) stays.

After removal, flag `BottomQueueStrip.stories.tsx` **Orphan:** then delete the production strip (and story) in the same pass — this is an explicit replace, not a sweep-delete.

## Behavior

### Queue button (player bar)

1. Toggle `aria-pressed` / `variant="secondary"` when the right-rail **Queue** surface is showing.
2. **Do not** change player-bar height, hide NowPlaying, or mount `BottomQueueStrip`.
3. **Right rail collapsed:** uncollapse + select Queue + fade the queue in.
4. **Right rail already open:** only select the Queue tab (no extra open/close).
5. **Toggle off:** if this click opened the rail, collapse it; if the rail was already open, restore the previous tab (Chat / Notifications).

Lift `rightRailTab` (`chat` \| `notifications` \| `queue`) into `layoutStore` so the player bar and `RightRailPanel` share it. Retire `bottomQueueOpen` once nothing reads it.

### Queue on the right (not full-bleed)

Do not dump the entire queue as a full-height column that eats the rail.

- Viewport max height: a named constant (~5–7 rows / ~20rem), not `flex-1` fill.
- Window around the current item: **1–2 previous** tracks faded, current `QueueItem` highlighted (`isCurrent`, expanded), upcoming below.
- Overflow: `ScrollableArea` + top/bottom chevron `Button`s when `scrollHeight > clientHeight`.
- Keep shuffle / clear / save-as-playlist on `SidebarQueuePanel` under the viewport.
- Persistent chrome: opening the right rail is intended. Do not unmount the left sidebar or player bar.

### Signed-out desktop and mobile

No `RightSidebar` today. Do **not** bring back the bottom strip. Use a compact `QueuePanel` **popover** anchored to the queue button (same windowing, fade, chevrons). Same pressed toggle.

### Player bar: waveform + title/artist

- Replace `PlayerBar.SeekBar` in the compact bar with `WaveformSeekbar` (progress 0–1, seek). Live streams: keep `PlayerLiveBadge`, no waveform seek.
- **Title click:** expand the waveform (taller compact → expanded height, named constants). Second click collapses. Does not open full-screen player (that stays the maximize button).
- **Artist click:** `navigate({ to: '/u/$username' })` when `channelSlug` / artist username is known (`TahtiPlayable.channelSlug` today; display name alone is not a route). No slug → not a link.
- HearThis embed strip stays host-owned (do not drop it to make the bar look like the Storybook demo).

## Explicit non-goals

- Full-screen player queue
- Listen History page (`/listen/history`) — “history” here means previous **queue** items
- Changing left-nav or mobile bottom-nav chrome
- Soulseek / desktop library panel (separate plan)

## Suggested order

1. Storybook: `WaveformSeekbar`; NowPlaying title/artist; QueuePanel past-fade + compact height; RightRail Queue fade-in.
2. `layoutStore` rail tab + player-bar queue button wiring (no bar layout change).
3. Compact `SidebarQueuePanel` viewport + chevrons.
4. Remove `BottomQueueStrip` from `ConnectedPlayerBar` + stories.
5. Waveform seek + title expand + artist link.
6. Signed-out / mobile popover fallback.

## Tracking

- This file
- Worklog section named above
- Related: Status Bar idle (`ConnectedStatusBar` when the compact player is hidden)
