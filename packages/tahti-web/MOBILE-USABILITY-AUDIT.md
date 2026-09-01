# Mobile usability audit — 2026-09-01

A phone-width walkthrough of the listener- and artist-facing surfaces,
looking for clutter, content that doesn't fit the screen, unstyled native
browser controls, and plain unstyled buttons. This is a snapshot audit, not
exhaustive coverage of every route.

## Method

Tested at a ~390-400px CSS viewport (this session's browser-automation tool
could only reliably hold a window that narrow, not a full device emulation).
Two techniques were used together:

- **Screenshots** for a first visual pass. These turned out to have a known
  limitation in this session: the tool's screenshot capture at this window
  size did not line up 1:1 with the real CSS viewport, and visually made
  several pages look like they had content sliced off at the right edge.
- **DOM measurement** (`getBoundingClientRect()` against `window.innerWidth`,
  plus `scrollWidth`/`clientWidth` checks) to confirm or reject what the
  screenshots suggested. This is the source of truth below — every "no
  overflow" and "found" line was verified this way, not just eyeballed.

That mismatch is worth knowing for next time: don't trust this tool's
screenshots alone to judge horizontal fit at narrow widths — verify with a
bounding-rect check before reporting a clipping bug.

## Routes checked (mobile width)

| Route | Horizontal overflow | Native controls | Notes |
| --- | --- | --- | --- |
| `/` (Listen) | None | None | Clean |
| `/radio` | None | None | Clean |
| `/discover` | None | None | Clean |
| `/channel/northern-lights` | None | None | Clean |
| `/library/favorites` | None | None | **Duplicate "Favorites" content — see below** |
| `/studio` | None | None | Clean |
| `/studio/channel` | None | **1 unstyled checkbox** | See Channel Designer section |
| `/studio/distribution` | — | None | Native-control sweep from earlier rounds already covers this |
| `/studio/releases` | — | None | Same |
| `/studio/go-live` | — | None | Same |
| `/studio/schedule` | — | None | Same |

No page in this pass had real horizontal overflow at 400px — the app's
mobile CSS (flex/grid with `min-w-0`, `overflow-x-auto` on tab rows, etc.) is
solid. `WORKPLAN.md`'s medium-priority item about unstyled `Input`/`Select`
in `StudioDistributionView`/`StudioReleasesView`/Go Live/Schedule looks
stale — those surfaces are already using the shared Nuclear form components.

## Findings

### 1. Duplicate Favorites content on `/library/favorites` (flagged, partially addressed)

`LibraryView.tsx` always renders the new `FavoritesPanel` sidebar (added
this round: Tracks/Playlists/Channels/Artists, compact text rows) in its
`<aside>`, and — only on the `favorites` tab — also renders the older
`FavoritesView` in the main content area (Channels card grid + a Tracks
table, no Playlists/Artists split). On `/library/favorites` both render at
once: two "Favorites" headings, and channels/tracks listed twice in two
different visual styles.

I didn't remove either side outright: the sidebar is the only place
Playlists/Artists favorites currently show, and the main view is the only
place with play/queue actions and artwork — removing either loses real
capability. As a minimal fix, `FavoritesView`'s header now explains the
relationship (`packages/tahti-web/src/views/FavoritesView.tsx`):

> Play, queue, or unfavorite from here. The panel on the left is a quick-jump
> list to the same items.

**Recommended follow-up:** consolidate into one component — either give
`FavoritesPanel` the play/queue/artwork treatment and make it the sole
`/library/favorites` content (drop the sidebar-vs-page distinction), or add
Playlists/Artists tabs to `FavoritesView` and stop rendering the sidebar on
that one route. Either removes the duplication instead of just labeling it.

### 2. Unstyled native checkbox in Channel Designer

`packages/tahti-web/src/components/ChannelDesigner.tsx` has five bare
`<input type="checkbox">` elements (lines 650, 718, 881, 1938, and the
"Use a separate gradient for the player" one at ~731) styled only with a
`mt-0.5` alignment class — plain browser checkbox rendering inside otherwise
fully-styled cards. Not fixed in this pass; flagging for a follow-up to swap
in whatever the Nuclear/`@tahti-player/ui` checkbox or toggle component is
(same pattern as the `Select`/`Textarea` native-control sweep from rounds
9-13 in `UI-REDESIGN-WORKLOG.md`).

### 3. Channel Designer preview scrolled out of view while editing (fixed)

Below the `xl:` breakpoint (1280px — so every phone, tablet, and most
laptops) the Channel Designer's live preview and its long controls form
stack into a single column with the preview first. The controls form is
substantial (the component is ~2,500 lines), so scrolling down to reach most
settings scrolled the preview off-screen entirely — changes couldn't be
observed without scrolling back up. This also affected the `compact` render
used in Settings → Channel & design, which is even more space-constrained
inside the settings dialog.

**Fixed:** the preview `<main>` is now `sticky top-4` with a capped height
and its own internal scroll, so it stays pinned in view while the controls
below it scroll. Verified by scripting a scroll to the bottom of the panel
and confirming the preview's bounding box stays on-screen for effectively
the whole scroll range (`position: sticky` confirmed, preview only recedes
in the final ~30px at the very end of the controls list, which is correct
sticky behavior at a container boundary, not a bug).

**Also fixed:** the "Open my channel →" link only lived in the top action
row, which scrolls away with the title. It's now a shared node
(`openChannelLink`) rendered both there and inside the preview panel's own
header strip (next to "Live page preview"), so it stays reachable while
scrolling — including from the Settings-hosted compact instance, which
shares the same component.

## Files changed this pass

- `packages/tahti-web/src/components/ChannelDesigner.tsx` — sticky preview,
  shared open-channel link in the preview header.
- `packages/tahti-web/src/views/FavoritesView.tsx` — header subtitle
  clarifying its relationship to the new Favorites sidebar panel.
