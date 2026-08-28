# WORKPLAN — tahti-web POC

## Shipped

- [x] **Plugin integration guide and metadata parity** — documented plugin authoring/API checks, add-on types and current state; centralized visualizer metadata and added registry drift coverage ([docs/PLUGIN-INTEGRATIONS.md](docs/PLUGIN-INTEGRATIONS.md))
- [x] **Tahti Map refresh** — added privileged screenshots for recently ported Studio/Admin/Settings views and documented each screen’s actions and destinations with per-view Mermaid navigation diagrams ([UI-REDESIGN-WORKLOG.md](UI-REDESIGN-WORKLOG.md))
- [x] **Beta feature-port consolidation** — Radio announcements/pinned announcements, Tahti Radio submissions, Clips, archive/Sounds parity, HEARTHIS shared playback, rotation drag-and-drop/capacity handling, notification parity, track statistics modal, and the latest admin/studio audit documentation ([UI-REDESIGN-WORKLOG.md](UI-REDESIGN-WORKLOG.md))
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
- [x] Radio slots depth — weekly Tahti Radio and own-channel filters, two-hour selection, show type/notes, green-room links, cancellation, and mobile-safe horizontal schedule grid are implemented.
- [x] **Channel moderator management** — `/studio/moderation` is exposed from Studio Manage, with owner-gated assignment/removal, chat-ban UI, and mock/API coverage for the delegated moderator contract.
- [x] Multitrack timeline + press-kit polish — press-kit gallery and download flows are shipped; editor projects now have a typed, autosaved multitrack timeline with synchronized preview and responsive controls.
- [ ] Production cutover for `apps/web` — complete the listener/artist/admin no-drop ledger in [GAP-MAPPING.md](GAP-MAPPING.md) before changing the official client; keep Next Admin canonical unless the Admin parity gate is explicitly closed.

Done since last update (was listed here as remaining, verified shipped): channel chat hardening (hCaptcha + rail parity), Stash upload UI, Stats detail page, Venue register, Membership purchase, Password/account security (TOTP panel), board admin (22/22 pages, now `partial` not `out-of-scope`).

## Storybook UI compliance backlog

This backlog comes from the Storybook comparison audit. Prefer the original Nuclear primitives from `@nuclearplayer/ui` wherever they cover the need. Admin-specific Storybook entries are secondary references: keep board workflows dense where necessary, but match the shared Nuclear chrome, controls, states, and spacing first.

### High priority

- [x] Update stale Storybook stories after the navigation redesign: remove the deleted `AppTopNav` `minimal` variant stories and replace the removed Studio tools-panel story with the six-section Studio navigation states.
- [x] Add Storybook coverage for `SectionSidebar`, including active, inactive, no-current-route, deep-route, mobile overflow, and representative Studio/Admin variants.
- [x] `SectionSidebar` now wraps Nuclear's existing `SidebarNavigation` and `SidebarNavigationItem`; explicit route selection is retained for beta deep/query routes.
- [x] Normalize remaining custom page headers against `PageHeader` / `StudioPageHeader`: Collection, Track detail, Studio home, Studio archive detail, More/map, and any later raw `<h1>` findings.

### Plugin integration follow-up

- [x] **Authoring and parity baseline** — added the agent-facing plugin contract, typed add-on settings, explicit sibling-API counterpart metadata, and a runnable example plugin/tutorial. The remaining items below are the implementation backlog, not unverified claims of runtime support.
- [x] **Bandcamp catalog import API** — complete the sibling API's Bandcamp album listing and import endpoint; the beta add-on UI, OAuth connection, release shop-link editor, and Bandcamp brand actions are now wired to those contracts.
- [ ] **Nuclear registry runtime parity** — the remaining Nuclear registry entries are now visible in Add-ons with plugin-owned configuration forms and explicit available/partial/planned status; implement provider runtime/API contracts for the planned entries before marking them active. The shared source capability contract is now explicit, but it does not claim runtime parity for planned providers.
- [x] **Slice 4 — generic Audio FX chain host** — extracted add/remove/reorder operations and plugin-owned parameter metadata/controls from `StudioProEditorView`, with chain regression coverage.
- [x] **Slice 5 — shared multicast destination form** — share the destination form between Go Live and Settings, keeping provider-specific credentials inside each provider configuration.
- [ ] Define and implement an `ExportProvider` only after `../tahti` exposes submit/status/webhook contracts; the current registry is metadata/deep-link only.
- [ ] **Slice 6 — source capability contracts** — split Sources into OAuth, search, and link/tool adapter contracts and route `SourcesView` through them without losing provider-specific behavior.
- [ ] Define the credential/permission lifecycle for a real integrations marketplace before implementing it.

### Medium priority

- [ ] Replace hand-styled native controls in listener and Studio surfaces with Storybook-backed Nuclear components where behavior permits: `Input`, `Select`, and `Textarea` in `ChannelRadioPlaylistPanel`, `RadioBookingCalendar`, `StreamManagerPanel`, `StudioEditorListView`, `StudioDistributionView`, `StudioReleasesView`, and related forms.
- [ ] Replace repeated bespoke bordered panels with `Box`, `SectionShell`, `Card`, `CardGrid`, or `StudioPanel` where the content is a standard panel/card/list rather than a deliberately custom visualization or editor.
- [ ] Audit custom actions against Nuclear `Button`, `FavoriteButton`, `MediaIconActions`, `CopyButton`, and `SaveButton`; prioritize Artist gallery actions, channel layer actions, collection actions, and Radio actions while preserving legitimate custom tab, drag-handle, and row-selection buttons.
- [ ] Normalize remaining loading, empty, error, and status treatments against `PageLoading`, `PageEmpty`, `EmptyState`, `Loader`, and `Badge`.

### Storybook quality and verification

- [x] Add Storybook states for Studio deep routes, Admin nested/moderation routes, artist-page standard top navigation, mobile navigation, and active/inactive navigation states.
- [x] Add a dedicated Storybook TypeScript check after updating legacy stories for required label props and adding the Vite/global declarations needed by imported `tahti-web` files.
- [ ] Run a full Storybook render sweep after each compliance batch and record intentional exceptions, especially for Admin operational tables and specialized editor controls.

### Community metadata follow-up

- [ ] Extend the sibling archive metadata API to record mentions from archive descriptions and return source title/link context in the public mentions response; then remove the artist-page fallback link and verify notification delivery end to end.

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
