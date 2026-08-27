# WORKPLAN — tahti-web POC

## Shipped

- [x] Sparse sidebar + Studio/Sources/Library/Channel tabs
- [x] Sources **CardGrid** big service icon tiles + detail pane
- [x] **Settings** Nuclear-style (Themes under Settings; Account demoted)
- [x] Go Live, catalog, upload, schedule, stats
- [x] Profile-integrated channel designer (owner Design tab)
- [x] Studio Channel design / profile / domain
- [x] **Inline channel page design** — `/channel/$slug?edit=1`: presets, side Layers (hide/add), drag reorder; layout localStorage; Look via API
- [x] Editor EQ/comp/limiter + markers + stems
- [x] Newsletter send, DMs, releases, revenue, governance
- [x] **Offline mock session** — auth `/me`, follow set, fan subscribe activate, Sources Connect, Stripe Connect in-app ([MOCKS.md](MOCKS.md))
- [x] **Port checklist** — [FEATURES.md](FEATURES.md)
- [x] **Demock wave 1** — prod builds skip silent mock fallback (`api/mode.ts`); chat WS → `wss://chat.tahti.live`
- [x] **Demock waves 2–3** — Go Live / broadcast + upload/archive live paths (see FEATURES.md)
- [x] **Demock waves 4–5** — fan subscribe + Connect; DMs + governance (see FEATURES.md)

## Product priority

- [x] **Album-based designer** — `/studio/collections`
- [x] **Add-to-playlist** — player bar, Music, tables
- [x] **Visualizations** — ChannelView + analyser
- [x] **Broadcasting wizard** — Connect → Live → Multistream
- [x] **Email verify** — `/verify`
- [x] **Fan-tier editor** — Settings → Money
- [x] **Screen atlas on `/more`** — curated e2e thumbnails + Nuclear routes (`public/map/`, `ScreenAtlas`)

## Checklist (remaining)

Kept in sync with [FEATURES.md](FEATURES.md)'s "Remaining / partial" list, which has the up-to-date detail — this is the short version.

- [x] Full Three.js visualizer presets (ten distinct analyser-reactive scenes, lazy-loaded in the channel hero and ambient page background)
- [x] Stash share access (grant expiring read/download access + revoke)
- [x] Sources OAuth callback-return verification (SoundCloud, Bandcamp, Google Drive, and Mixcloud production redirect shapes land on the matching source result in the SPA)
- [ ] Radio slots depth
- [ ] **Channel moderator management** — expose the existing `/studio/moderation` workflow from the Studio Manage/Broadcast navigation, verify owner-only user assignment and removal, and cover the moderator permissions (chat mute/remove/ban) with mock/API tests so channel owners can reliably delegate moderation.
- [ ] Multitrack timeline + press-kit polish
- [ ] Production cutover for `apps/web`

Done since last update (was listed here as remaining, verified shipped): channel chat hardening (hCaptcha + rail parity), Stash upload UI, Stats detail page, Venue register, Membership purchase, Password/account security (TOTP panel), board admin (22/22 pages, now `partial` not `out-of-scope`).

## Storybook UI compliance backlog

This backlog comes from the Storybook comparison audit. Prefer the original Nuclear primitives from `@nuclearplayer/ui` wherever they cover the need. Admin-specific Storybook entries are secondary references: keep board workflows dense where necessary, but match the shared Nuclear chrome, controls, states, and spacing first.

### High priority

- [ ] Update stale Storybook stories after the navigation redesign: remove the deleted `AppTopNav` `minimal` variant stories and replace the removed Studio tools-panel story with the six-section Studio navigation states.
- [ ] Add Storybook coverage for `SectionSidebar`, including active, inactive, no-current-route, deep-route, mobile overflow, and all Studio/Admin variants.
- [ ] Decide whether `SectionSidebar` should wrap Nuclear's existing `SidebarNavigation` and `SidebarNavigationItem` rather than maintaining duplicate sidebar markup; use the Nuclear components where practical.
- [ ] Normalize remaining custom page headers against `PageHeader` / `StudioPageHeader`: Collection, Track detail, Studio home, Studio archive detail, More/map, and any later raw `<h1>` findings.

### Medium priority

- [ ] Replace hand-styled native controls in listener and Studio surfaces with Storybook-backed Nuclear components where behavior permits: `Input`, `Select`, and `Textarea` in `ChannelRadioPlaylistPanel`, `RadioBookingCalendar`, `StreamManagerPanel`, `StudioEditorListView`, `StudioDistributionView`, `StudioReleasesView`, and related forms.
- [ ] Replace repeated bespoke bordered panels with `Box`, `SectionShell`, `Card`, `CardGrid`, or `StudioPanel` where the content is a standard panel/card/list rather than a deliberately custom visualization or editor.
- [ ] Audit custom actions against Nuclear `Button`, `FavoriteButton`, `MediaIconActions`, `CopyButton`, and `SaveButton`; prioritize Artist gallery actions, channel layer actions, collection actions, and Radio actions while preserving legitimate custom tab, drag-handle, and row-selection buttons.
- [ ] Normalize remaining loading, empty, error, and status treatments against `PageLoading`, `PageEmpty`, `EmptyState`, `Loader`, and `Badge`.

### Storybook quality and verification

- [ ] Add Storybook states for Studio deep routes, Admin nested/moderation routes, artist-page standard top navigation, mobile navigation, and active/inactive navigation states.
- [ ] Enable Storybook story type-checking, or add a dedicated Storybook TypeScript check, so stale props and removed stories fail before build; investigate the current docgen warnings caused by `tahti-web` files being outside the active TypeScript project.
- [ ] Run a full Storybook render sweep after each compliance batch and record intentional exceptions, especially for Admin operational tables and specialized editor controls.

### Nuclear component reference order

When replacing a bespoke element, check these existing Storybook components first: `SidebarNavigation`, `TopBar`, `Button`, `Box`, `SectionShell`, `Card`, `CardGrid`, `Tabs`, `Input`, `Select`, `Textarea`, `Dialog`, `SaveButton`, `FavoriteButton`, `FilterChips`, `Pagination`, `EmptyState`, `Loader`, `TrackTable`, `MediaArtwork`, and `Badge`.

## Verify

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
pnpm --filter @nuclearplayer/tahti-web type-check
pnpm --filter @nuclearplayer/tahti-web build
# Offline:
VITE_FORCE_MOCK=1 pnpm --filter @nuclearplayer/tahti-web dev
# Live API (no silent mock in prod build):
unset VITE_FORCE_MOCK && pnpm --filter @nuclearplayer/tahti-web dev
```
