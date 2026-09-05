# WORKPLAN — tahti-web (open only)

**Rule:** This file lists **unfinished** work only. When an item ships, fold a one-line note into [`docs/todo/HISTORY.md`](../../docs/todo/HISTORY.md), delete/update any matching `docs/todo/` file via [`docs/todo/INDEX.md`](../../docs/todo/INDEX.md), and **remove** the checkbox from here. Do not keep `[x]` rows.

Shipped navigation / product / Storybook batches through 2026-09-05 live in HISTORY (bulk fold + WORKPLAN shipped fold). Product matrix: [`FEATURES.md`](FEATURES.md). Cutover: [`CUTOVER.md`](CUTOVER.md).

Sibling API checkout: **`../tahti-org`**.

## Now

- [ ] **Independent desktop player** — Storybook `TitleBar` + `TopBar` with Tahti branding only; right-rail Library with local import/play; Soulseek desktop add-on (no Tahti P2P relay). Details: [docs/todo/desktop-pro-library.md](../../docs/todo/desktop-pro-library.md).
- [ ] **Production cutover for `apps/web`** — finish no-drop ledger in [GAP-MAPPING.md](GAP-MAPPING.md) before changing the official client; keep Next Admin canonical unless Admin parity gate is closed.
- [ ] **Nuclear registry runtime parity (remaining)** — `bandcamp-dashboard`, `deezer-dashboard`, `listenbrainz-dashboard` (charts), `omnisource`, `youtube-liked-songs-sync` still need contracts (or stay out of scope). `youtube-playlists` / `soundcloud-dashboard` stay `partial` via Listen embeds.
- [ ] **Studio Storybook primitive sweep** — FilterChips / Input addons / Toggle / EmptyState / ImageReveal gaps. Details: [docs/todo/studio-storybook-sweep.md](../../docs/todo/studio-storybook-sweep.md).
- [ ] **Input Storybook sweep** — remaining native fields → `Input` / `Textarea` / `Select` / etc. Progress notes historically in worklog; continue from live code, not from deleted todos.
- [ ] **Full Studio/Admin UX sweep** — remaining icon-less actions, explainer→Tooltip moves, tab/segmented drift, missing Alert/Banner + SegmentedControl. Findings: [STUDIO-ADMIN-UX-SWEEP.md](STUDIO-ADMIN-UX-SWEEP.md).
- [ ] Replace remaining bespoke bordered panels with `Box` / `SectionShell` / `Card` / `CardGrid` / `StudioPanel` where safe (see sweep doc for carve-outs).
- [ ] Audit remaining custom actions → `Button` / `FavoriteButton` / `MediaIconActions` / `CopyButton` / `SaveButton`.
- [ ] **System rule — set-image hover delete + preview modal** — finish remaining upload surfaces. Spec: [docs/todo/image-upload-hover-lightbox.md](../../docs/todo/image-upload-hover-lightbox.md).
- [ ] Extend sibling archive metadata API for mentions context; then remove artist-page fallback link and verify notifications end to end (`../tahti-org`).
- [ ] Open agent todos not duplicated above — see [docs/todo/INDEX.md](../../docs/todo/INDEX.md) (Channel Designer leftovers, stream overlay, radio cover image, governance parity, map screenshots, queued UX, etc.).

## Later / blocked

- [ ] Map screenshot signed-in recapture (blocked post-ViewShell) — [docs/todo/map-screenshot-refresh.md](../../docs/todo/map-screenshot-refresh.md).
- Flagged intentional unlit sidebar routes and Studio subtab gaps: see prior notes in HISTORY / `NAVIGATION-SITEMAP.md` — do not invent chrome for marketing/legal pages.

## Nuclear component reference (when replacing bespoke UI)

Prefer Storybook: `SidebarNavigation`, `TopBar`, `ViewShell`, `Button`, `Box`, `SectionShell`, `Card`, `CardGrid`, `StudioPanel`, `Tabs`, `Tooltip`, `Input`, `Select`, `Textarea`, `Dialog`, `SaveButton`, `StatChip`, `FavoriteButton`, `FilterChips`, `Pagination`, `PageLoading`/`PageEmpty`/`PageError`, `EmptyState`, `Loader`, `TrackTable`, `MediaArtwork`, `KeyCombo`, `QueuePanel`, `QueueItem`, `ScrollableArea`, `PlayerBar`, `Badge`. No shared SegmentedControl or inline Alert/Banner yet.

Cheat sheet: [`STORYBOOK-SURFACES.md`](STORYBOOK-SURFACES.md).

## Verify

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 24
pnpm --filter @tahti-player/tahti-web type-check
pnpm --filter @tahti-player/tahti-web build
VITE_FORCE_MOCK=1 pnpm --filter @tahti-player/tahti-web dev
```
