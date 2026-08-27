# UI redesign worklog — Nuclear (artist + admin)

Page-by-page loop: redesign → screenshot → **wait for comment or `approved`** → next page.

Screenshots: `docs/redesign-shots/{page-slug}-v{n}.png`

Workflow rules: one page at a time; do not advance until user approves.

---

## Artist studio (POC routes)

| # | Page | Route | Status | Shot |
|---|------|-------|--------|------|
| 1 | Studio home | `/studio` | **approved** | `docs/redesign-shots/studio-home-v1.png` |
| 2 | Go Live wizard | `/studio/go-live` | **approved** | `docs/redesign-shots/studio-go-live-v1.png` |
| 3 | Music / Archive (Library) | `/studio/archive` | **approved** | `docs/redesign-shots/studio-archive-v1.png` |
| 4 | Archive item | `/studio/archive/$id` | **approved** | `docs/redesign-shots/studio-archive-item-v1.png` |
| 5 | Upload | `/studio/upload` | **approved** | `docs/redesign-shots/studio-upload-v1.png` |
| 6 | Releases | `/studio/releases` | **approved** | `docs/redesign-shots/studio-releases-v1.png` |
| 7 | Release detail | `/studio/releases/$id` | **approved** | (panels + Save CTA) |
| 8 | Collections / album designer | `/studio/collections` | **approved** | `docs/redesign-shots/studio-collections-v1.png` |
| 9 | Collection editor | `/studio/collections/$slug` | **approved** | |
| 10 | Audio editor list | `/studio/editor` | **approved** | (panels + icon row actions) |
| 11 | Editor project | `/studio/editor/$id` | **approved** | |
| 12 | Schedule | `/studio/schedule` | **approved** | `docs/redesign-shots/studio-schedule-v1.png` |
| 13 | Stats | `/studio/stats` | **approved** | `docs/redesign-shots/studio-stats-v1.png` |
| 14 | Stats detail | `/studio/stats/detail` | **approved** | (panels + range chips) |
| 15 | Channel designer | `/studio/channel` | **approved** | `docs/redesign-shots/studio-channel-v1.png` |
| 16 | Shows | `/studio/shows` | **approved** | `docs/redesign-shots/studio-shows-v1.png` |
| 17 | Show detail / episode review | `/studio/shows/$id`, `…/episodes/$episodeId` | **approved** | |
| 18 | Playlists | `/studio/playlists`, `…/$slug` | **approved** | `docs/redesign-shots/studio-playlists-v1.png` |
| 19 | Updates / newsletter | `/studio/updates` | **approved** | `docs/redesign-shots/studio-updates-v1.png` |
| 20 | Revenue / Connect | `/studio/revenue` | **approved** | `docs/redesign-shots/studio-revenue-v1.png` |
| 21 | Stash | `/studio/stash` | **approved** | `docs/redesign-shots/studio-stash-v1.png` |
| 22 | Sources hub | `/sources` | **approved** | `docs/redesign-shots/sources-v1.png`, `docs/redesign-shots/sources-detail-v1.png` |
| 23 | Settings — account | `/settings/account` | **approved** | already Nuclear shell (no redesign needed) |
| 24 | Settings — artist | `/settings/artist` (etc.) | **approved** | `docs/redesign-shots/settings-artist-v1.png` |
| 25 | Settings — money / fan tiers | `/settings/money` | **approved** | already Nuclear shell (no redesign needed) |
| 26 | Settings — connections | `/settings/connections` | **approved** | already Nuclear shell (no redesign needed) |

## Admin (prod `/admin/*`)

Porting into a Nuclear admin shell, gated on `user.isBoard`. Page-by-page loop, same as artist studio above. Inventory from prod `admin-nav`:

| # | Page | Prod route | Status | Shot |
|---|------|------------|--------|------|
| A1 | Dashboard | `/admin/dashboard` → `/admin` | **approved** | `docs/redesign-shots/admin-dashboard-v1.png`, `…-expanded-v1.png` |
| A2 | Beta applications | `/admin/beta` | **approved** | `docs/redesign-shots/admin-beta-v1.png` |
| A3 | Users | `/admin/users` | **approved** | `docs/redesign-shots/admin-users-v1.png` |
| A4 | Radio | `/admin/radio` | **approved** | `docs/redesign-shots/admin-radio-v1.png` |
| A5 | Radio submissions | `/admin/radio-submissions` | **approved** | `docs/redesign-shots/admin-radio-submissions-v1.png` |
| A6 | News | `/admin/news` | **approved** | `docs/redesign-shots/admin-news-v1.png` |
| A7 | Tahti Selects | `/admin/tahti-selects` | **approved** | `docs/redesign-shots/admin-selects-v1.png` |
| A8 | Streams | `/admin/streams` | **approved** | `docs/redesign-shots/admin-streams-v1.png` |
| A9 | Support | `/admin/support` | **approved** | `docs/redesign-shots/admin-support-v1.png` |
| A10 | Top lists | `/admin/top-lists` | **approved** | `docs/redesign-shots/admin-top-lists-v1.png` |
| A11 | Announcements | `/admin/announcements` | **approved** | `docs/redesign-shots/admin-announcements-v1.png` |
| A12 | Storage | `/admin/storage` | **approved** | `docs/redesign-shots/admin-storage-v1.png` |
| A13 | Files | `/admin/files` | **approved** | `docs/redesign-shots/admin-files-v1.png` |
| A14 | Content reports | `/admin/content-reports` | **approved** | `docs/redesign-shots/admin-content-reports-v1.png` |
| A15 | Financial | `/admin/financial` | **approved** | `docs/redesign-shots/admin-financial-v1.png` |
| A16 | Governance hub | `/admin/governance` | **approved** | `docs/redesign-shots/admin-governance-v1.png` |
| A17 | Feature requests | `/admin/feature-requests` | **approved** | `docs/redesign-shots/admin-feature-requests-v1.png` |
| A18 | Grants | `/admin/grants` | **approved** | `docs/redesign-shots/admin-grants-v1.png` |
| A19 | AGM | `/admin/agm` | **approved** | `docs/redesign-shots/admin-agm-v1.png` |
| A20 | Vendors | `/admin/settings/vendors` → `/admin/vendors` | **approved** | `docs/redesign-shots/admin-vendors-v1.png` |
| A21 | Status | `/admin/status` | **approved** | `docs/redesign-shots/admin-status-v1.png` |
| A22 | i18n languages + CSV import | (new — see Phase 0) | **approved** | `docs/redesign-shots/admin-i18n-v1.png` |

**i18n (Approved):** Admin creates languages + imports English-base CSV — [CUTOVER-PHASE0.md](./CUTOVER-PHASE0.md).

---

## Entries

### 2026-08-12 — Page 1 Studio home v1 (`in-review`)

**Goal:** Nuclear simplicity — group by context; one primary action; hide secondary clutter.

**Changes:**

- Removed flat 13-tile CardGrid + duplicate button row + “full production dashboard” escape hatch on the home surface
- Hero: channel name/state + single **Go Live** CTA
- Three context groups: **Broadcast**, **Music**, **Audience & channel** (primary links only)
- **More tools** disclosure for editor, stash, sources (collapsed by default)
- Dropped API/source jargon from the subtitle
- Kept `StudioNav` for deep navigation on other pages; home relies on groups

**Screenshot:** `docs/redesign-shots/studio-home-v1.png`

**Status:** approved (user: “move with next”).

### 2026-08-12 — Page 2 Go Live wizard v1 (`in-review`)

**Goal:** Simpler Nuclear wizard — clear steps, one job per panel, hide optional multistream noise.

**Changes:**

- Title → **Go Live**; dropped “Broadcast wizard” + API source jargon
- Compact step rail (1 Connect · 2 Live · 3 Multistream) with done ticks
- Connect: credentials + signal status; checklist as compact chips
- Live: single status card + primary actions only
- Multistream: destinations list first; **Add destination** form collapsed until opened
- Weekly usage moved to a quiet footer line

**Screenshot:** `docs/redesign-shots/studio-go-live-v1.png`

**Status:** approved (user: continue worklog).

### 2026-08-12 — Page 3 Music archive v1 (`in-review`)

**Goal:** Catalog list with one primary action; secondary row actions hidden.

**Changes:**

- Header: title + single **Upload** CTA (dropped Sources / Editor clutter)
- Empty state with Upload CTA
- Row: Play + Edit primary; playlist / audio editor / delete under **More**
- Removed API jargon from subtitle
- Shared **StudioNav** slimmed: primary 5 pills + collapsed “More studio tools”

**Screenshot:** `docs/redesign-shots/studio-archive-v1.png` (captured mock Vite + Playwright)

**Status:** approved (user: continue / next slice).

**Note:** Same ship commit (`60f5d875a`) also included artist gallery on profiles (fan-facing; not a studio worklog row).

### 2026-08-12 — Page 5 Upload v1 (`in-review`)

**Goal:** One job — pick file, upload.

**Changes:**

- Human subtitle (no prepare/PUT/complete jargon)
- Filename hint after pick; success → Open in Music only
- Link back to Music

**Screenshot:** `docs/redesign-shots/studio-upload-v1.png` (captured mock Vite + Playwright)

**Status:** approved (user: continue / next slice).

**Shared note:** StudioNav slim (primary 5 + collapsed “More studio tools”) ships with these pages; review on both shots.

### 2026-08-12 — Page 4 Archive item v1 (`in-review`)

**Goal:** One job — edit metadata; hide audio editor until needed.

**Changes:**

- Human subtitle + status/visibility chips (no middle-dot status line)
- Header **Save** as the only primary CTA
- Fields: title, description, genre, public toggle
- **More tools** disclosure for Audio editor

**Screenshot:** `docs/redesign-shots/studio-archive-item-v1.png`

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-12 — Page 6 Releases v1 (`in-review`)

**Goal:** Catalog list with one primary action; create form collapsed.

**Changes:**

- Human subtitle (no API path jargon)
- Header **New release** CTA; create form opens on demand
- Empty state with New release CTA
- Row: Edit primary; public link / distribution under **More**
- Dropped always-visible Distribution button in the header

**Screenshot:** `docs/redesign-shots/studio-releases-v1.png`

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-12 — Shows + Playlists + Channel designer (studio pillars)

**Goal:** Ship the accumulated studio pillars with Nuclear panel depth (padded titles, containers).

**Nav IA:** Primary = Overview · Go Live · Library · Releases · Shows. More = Playlists · Channel designer · Upload · Albums · …

**Shows (`/studio/shows`):**

- Create show (interval chips); episode # auto-increments; inherit description/cover
- Detail: book intervals via radio-slot bookings API; upload or attach broadcast; approve gate with trim/normalize via archive editor render
- Series/episodes persisted in **localStorage** until a real Show API exists (honest demock gap)

**Playlists (`/studio/playlists`):**

- List + TrackTable editor; add archive tracks and releases; public/private + collaborative
- Icon-only add-to-playlist affordances on Music rows

**Channel designer (`/studio/channel`):**

- Tabs: Design · 24/7 radio · Profile · Username/domain
- 24/7 radio: a compact three-part editor for playlist source, playback settings, and active rotation; supports pick/create/edit, direct archive adds, enable/mode/auto-enroll/announcements, and icon-only reorder/remove controls (max 5 items)
- StudioPanel / StudioPageHeader polish

**Status:** in-review — screenshots captured; awaiting comment or `approved`.

### 2026-08-12 — Release detail + Albums polish + link-out cleanup

**Goal:** Finish next worklog rows with StudioPanel depth; remove easy prod dashboard link-outs.

**Release detail (`/studio/releases/$id`):** Artwork / Details / Tracks panels; header Save CTA; Distribution in-app link.

**Albums (`/studio/collections` + editor):** Human subtitle (no API jargon); StudioPanel list; Playlists cross-link; album editor panels + Save.

**Show detail:** Defaults / Schedule / Episodes as StudioPanels.

**Setup channel:** StudioPageHeader + panel; home CTA → `/studio/setup-channel` (no tahti.live wording).

**Settings:** Dropped “Full media builder” and “Manage on production” moderator link-outs.

**Screenshots:** `studio-shows-v1`, `studio-playlists-v1`, `studio-channel-v1`, `studio-collections-v1` (+ releases refresh).

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-12 — Schedule + Stats (+ Editor panel parity)

**Goal:** Next pending studio tools with Nuclear panel depth; icon-dense secondary chrome.

**Schedule (`/studio/schedule`):**

- StudioPageHeader + Save CTA; human subtitle (no API source jargon)
- Next broadcast + Offline programme as StudioPanels
- Mode chips; quiet link to Channel 24/7 radio
- Empty rotation points to Channel designer

**Stats (`/studio/stats` + detail):**

- Summary metric panels; Top tracks / countries lists
- Detail CTA → plays chart; track titles link into Library
- Revenue note is in-app (`/studio/revenue`), not a prod escape hatch
- Detail: StudioPageHeader + range chips; drop API path jargon / middle-dot meta

**Editor list / project (also pending; brought to same shell):**

- StudioPageHeader / StudioPanel; icon-only Open / Pro editor row actions
- Project page: Pro editor primary CTA; archive link into Library

**UX / icons (studio sweep):**

- Library: Play / More / Pin / Audio editor / Delete → icon-only with aria-label
- Albums tracklist: Up / Down / Remove → chevron / trash icons
- Releases More: Public link / Distribution → icons; release detail secondary same

**Screenshots:** `studio-schedule-v1.png`, `studio-stats-v1.png`

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-13 — Mock content pass + map notes export

**Goal:** Data/content richness across the listen directory and studio calendar, plus a reviewer tool on the Tahti map page — not a page-by-page layout redesign, so it sits outside the usual one-page loop above.

**Mock stations (`src/api/mock.ts`):** Grew the listen directory from 2 to 8 stations (Northern Lights, Screenshot Demo, Midnight Cartography, Tundra Static, Saimaa Sessions, Kaiku Collective, Valo Radio, Metsänpeitto), each with its own bio, genre tags, two releases with real descriptions, follower count, and distinct track titles — replaces the single repeated "Mock channel for the Nuclear × Tahti listen POC" blurb.

**Gig calendar (`src/api/events.ts`, `StudioEventsView`):** Added a `description` field end to end (type, form, list rendering) and seeded 7 representative events across Finnish venues with full descriptions.

**Shows/schedule (`src/api/shows.ts`):** 1 → 4 show series (added Route 550 Live, Kaiku Cypher Sessions, Boathouse Talk) with matching episodes and radio-slot bookings.

**Map notes export (`ScreenAtlas.tsx`):** Added a CSV export button next to "Screen atlas" — exports `view_id, view_name, case_title, commentary` for every case with a saved note, so review notes left on `/more` can be saved to a file and revisited later instead of only living in this browser's localStorage.

**Screenshots:** `listen-artist-rich-v1.png` (new — enriched artist profile), `studio-events-v1.png` (new), `map-more-v1.png` (new — export button), refreshed `listen-home-v1`, `listen-radio-v1`, `listen-artist-v1`, `studio-shows-v1`, and the rest of the atlas set against the new mock data.

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-16 — Page 19 Updates / newsletter v1 (`in-review`)

**Goal:** Bring the last un-styled studio page to the StudioPageHeader/StudioPanel shell used by Schedule and Releases; one primary action per tab.

**Changes:**

- `StudioPageHeader` with tab-aware primary CTA (**New post** / **New draft**) instead of a right-aligned button row
- Tabs restyled to match Channel designer (`shadow-sm` active state, `role="tablist"`/`role="tab"`)
- Posts and drafts lists moved into `StudioPanel` with `divide-y` rows (was ad-hoc bordered `<li>` cards), matching Releases
- Dropped the "Source: mock/live" jargon from the subtitle
- No behavior changes — same create/delete/send handlers and dialogs

**Screenshots:** `docs/redesign-shots/studio-updates-v1.png` (Posts tab), `docs/redesign-shots/studio-updates-newsletter-v1.png` (Newsletter tab)

**Status:** approved.

### 2026-08-16 — Page 20 Revenue / Connect v1 (`in-review`)

**Goal:** Same StudioPageHeader/StudioPanel shell; replace the yes/no status list with the ✓/○ chip pattern from the Go Live wizard; drop dev jargon from user-facing copy.

**Changes:**

- `StudioPageHeader` with a plain subtitle — dropped "Source: mock" and the `VITE_FORCE_MOCK=1` dev-env line that was leaking into the UI
- Stripe Connect status (configured / charges enabled / details submitted / payments ready) now reads as compact ✓/○ chips instead of a `yes`/`no` bullet list
- Fan-sub Connect, grant estimate, and past grants are each a `StudioPanel`; past grants moved to `divide-y` rows
- No behavior changes — same onboarding/portal handlers

**Screenshot:** `docs/redesign-shots/studio-revenue-v1.png`

**Status:** approved.

### 2026-08-17 — Page 21 Stash v1 (`in-review`)

**Goal:** Same StudioPageHeader/StudioPanel shell as the rest of studio; the page still used the pre-redesign bordered-`<li>` list and a raw flex header.

**Changes:**

- `StudioPageHeader` with Upload as the single header CTA (file input stays hidden, triggered via ref)
- File list moved into `StudioPanel` with `divide-y` rows, matching Releases/Stash's siblings
- Empty state gets its own Upload CTA
- Play/Delete stay icon-only, switched to `variant="text"` for consistency with other row actions
- No behavior changes — same upload/download/delete handlers

**Screenshot:** `docs/redesign-shots/studio-stash-v1.png`

**Status:** approved.

### 2026-08-17 — Page 22 Sources hub v1 (`in-review`)

**Goal:** Lighter pass than most pages — the overview grid and per-source detail panels already had good Nuclear treatment (service-branded tiles, status chips) from an earlier "plugin-store style" pass. Mainly a chrome/jargon cleanup.

**Changes:**

- Outer page switched from a raw `<h1>` block to the shared `PageFrame`/`PageHeader` (matches Listen/Radio/Feed instead of a bespoke header)
- Dropped "Opened from Music when you add tracks (alongside upload)" implementation detail from the subtitle
- Removed the "Status source: mock" debug line from the per-source detail header — the existing status chip (Mock/Connected/Needs auth/etc.) already conveys this
- No behavior changes — grid, tabs, connect/disconnect, and import flows untouched

**Screenshots:** `docs/redesign-shots/sources-v1.png` (overview grid), `docs/redesign-shots/sources-detail-v1.png` (SoundCloud detail tab)

**Status:** approved.

### 2026-08-17 — Pages 23–26 Settings account/artist/money/connections

**Finding:** these four rows were tracked as `pending`, but the worklog was stale — the Settings modal (`SettingsPanels.tsx`) already uses the Nuclear `SettingsPanel` shell consistently across every section (sub-tabs, bordered `SettingsInfo` rows, real Save CTAs, tier cards). No layout/chrome work was actually outstanding.

**Verified via screenshot, no changes needed:** Account (Session/Security/Membership/Notifications sub-tabs, read-only `SettingsInfo` rows are intentional — editable display name lives under Artist → Profile), Money (Fan tiers list with New/Deactivate, matches the Releases/Stash divide-y pattern), Connections (short redirect notice pointing to Sources, intentionally minimal).

**One real fix, already shipped in the Source:/API sweep:** Account → Membership had a raw `Source: {source}` debug line — removed there, not here.

**Screenshot:** `docs/redesign-shots/settings-artist-v1.png` (representative — Profile sub-tab with Save CTA)

**Status:** approved.

### 2026-08-17 — Page A1 Admin dashboard v1 (`in-review`)

**Goal:** First admin page — reverses the earlier CUTOVER.md "out-of-scope" call (confirmed with user). Establish the board-gated shell + nav pattern the remaining 21 admin pages will build on.

**Changes:**

- New `AdminGate` component (mirrors `StudioGate`) — gates on `user.isBoard` instead of channel ownership; shows sign-in or "board access required" states
- New `AdminNav` (mirrors `StudioNav`'s `InPageNav` chip pattern) — starts with just Dashboard, grows page-by-page
- `isBoard?: boolean` added to `AuthUser`; new "Admin" sidebar item (shield icon), visible only when `user.isBoard`
- `/admin` route renders `AdminDashboardView`, reusing `StudioPageHeader`/`StudioPanel` for visual consistency with the rest of the app rather than inventing new admin-specific chrome
- Content follows the same disclosure pattern as Studio home: KPI row (active members, live now, beta queue, open tickets) + Needs action queue + System health up front; Finance YTD, live streams, queue health, cron jobs, and audit log tucked behind a "Finance, streams, queues & audit" toggle
- `api/admin.ts`: prod's dashboard fans out to ~12 separate `/api/admin/*` calls — batched into one `fetchAdminDashboard()` for this first port, with a rich mock payload for offline demo

**Screenshots:** `docs/redesign-shots/admin-dashboard-v1.png` (collapsed), `docs/redesign-shots/admin-dashboard-expanded-v1.png` (More expanded)

**Status:** approved.

### 2026-08-17 — Pages A2–A6 Beta / Users / Radio / Radio submissions / News v1 (`in-review`)

**Goal:** Continue the admin port — five pages in one pass, all reusing the AdminGate/AdminNav/StudioPanel foundation from A1. `AdminNav` grows to 6 entries.

**A2 Beta applications** (`/admin/beta`): status filter chips (All/Pending/Approved/Rejected); Approve opens a `Dialog` for username/display name, shows the resulting setup link inline; Reject and Resend-setup-link stay inline row actions.

**A3 Users** (`/admin/users`): search + tier/member selects (debounced, client-side filter under mock), divide-y list with board/suspended tags and live-state coloring. Dropped the per-row detail link and CSV export — no detail page or export endpoint exists yet, out of scope for this pass.

**A4 Radio** (`/admin/radio`): Now playing, Eligible channels (Move to front / Opt out), Opted out (Re-enable), Feature history — four `StudioPanel`s matching prod 1:1.

**A5 Radio submissions** (`/admin/radio-submissions`): auditing panel plays through Nuclear's real player bar (`usePlayerStore`) instead of a bespoke audio element like prod's — one less thing to build, and it's consistent with how every other page in the app plays audio. Approve/reject with an optional rejection note.

**A6 News** (`/admin/news`): compose in a `Dialog` (Publish / Save as draft), list rows with inline Edit (swaps to a form in place, no separate route) / Publish-Unpublish / Delete.

All five: `api/admin.ts` mock + live fetchers (`fetchAdminBetaApplications`, `fetchAdminUsers`, `fetchAdminRadio`, `fetchAdminRadioSubmissions`, `fetchAdminNews` + mutations), same forceMock()-first pattern as the rest of the app.

**Screenshots:** `docs/redesign-shots/admin-beta-v1.png`, `admin-users-v1.png`, `admin-radio-v1.png`, `admin-radio-submissions-v1.png`, `admin-news-v1.png`

**Status:** approved.

### 2026-08-17 — Pro audio editor v2 (`/studio/archive/$id/editor`) (`in-review`)

**Goal:** Rows 10/11 (Editor list, Editor project summary) were marked approved earlier, but that swept past the actual waveform tool at `/studio/archive/$id/editor` (`StudioProEditorView`) without a real pass — it was still the pre-redesign raw layout. User flagged it specifically: give it space, make it look correct.

**Problems found:** capped at `max-w-4xl` (896px) on a page whose whole job is a waveform; waveform canvas fixed at 96px tall and its render effect never re-ran on resize; raw `<h1>`/bordered-`<div>` chrome instead of `StudioPageHeader`/`StudioPanel`; dev jargon in copy ("Real: PATCH draft + POST render (ffmpeg job). Mock: local draft store...") and a raw `EditList JSON` `<details>` dump; limiter had a checkbox but no way to actually adjust its ceiling.

**Changes:**

- Widened to `max-w-[1400px]`; waveform panel is full-width
- `WaveformCanvas`: height now driven by its own `clientHeight` (was hardcoded 96px) so the CSS class controls it; added a `ResizeObserver` so it redraws on layout/viewport changes instead of only on data changes; bumped to 224px tall
- Mastering (EQ/Compressor/Limiter) spread across a 3-column grid instead of 2, each control gets room; limiter's ceiling is now a real slider (-6..0 dB) instead of static text
- Stems and Export moved into side-by-side panels instead of stacking full-width
- Dropped the PATCH/POST/ffmpeg jargon line and the EditList JSON debug dump; save/render feedback stays in the Export panel as a plain status line
- Play/Save/Render buttons got icons, matching the rest of studio

**Screenshots:** `docs/redesign-shots/studio-editor-project-v1.png` (1280px), `docs/redesign-shots/studio-editor-project-wide-v1.png` (1680px, shows it scaling)

**Status:** approved.

### 2026-08-17 — Pages A7–A11 Tahti Selects / Streams / Support / Top lists / Announcements v1 (`in-review`)

**Goal:** Finish the admin nav's first row — 11 of 22 pages now built. Same AdminGate/StudioPanel foundation as A1–A6.

**A7 Tahti Selects** (`/admin/tahti-selects`): Start/stop stream as the header action; current-rotation list with up/down reorder + remove; debounced search-to-add from public archive. Dropped prod's Liquidsoap/`TAHTI_RADIO_AUDIO_URL` infra paragraph — that's ops detail, not something a board member editing rotation content needs to see.

**A8 Streams** (`/admin/streams`): live-channel list, each row gets Restart/Skip/Pause/Resume/Force offline — matches prod's control set exactly, confirm dialogs kept on the destructive ones.

**A9 Support** (`/admin/support`): status filter chips + ticket list. No detail page (same scope trim as Users/Beta) — ticket detail/reply isn't built yet.

**A10 Top lists** (`/admin/top-lists`): three filter rows (period/dimension/sort) driving per-bucket progress-bar lists; built a small inline bar (`bg-primary` fill over `bg-background-secondary` track) since Nuclear UI doesn't have one.

**A11 Announcements** (`/admin/announcements`): system on/off toggle, upload button (mirrors the stash prepare→PUT→complete pattern), per-clip enable/schedule-mode/Nth-interval/delete, preview plays through Nuclear's real player bar instead of a raw `<audio>` element like prod. No separate clip editor page (out of scope, same as the `announcements/editor/[id]` sub-route in prod).

**Screenshots:** `docs/redesign-shots/admin-selects-v1.png`, `admin-streams-v1.png`, `admin-support-v1.png`, `admin-top-lists-v1.png`, `admin-announcements-v1.png`

**Status:** approved.

### 2026-08-17 — Pages A12–A21 Storage / Files / Content reports / Financial / Governance / Feature requests / Grants / AGM / Vendors / Status v1 (`in-review`)

**Goal:** Close out the remaining board-admin nav — all 21 built pages now live under `/admin/*`, gated on `user.isBoard`. AdminNav grew from 11 to 21 entries.

**A12 Storage** (`/admin/storage`): total used/quota/user-count summary + per-user usage list with an inline MB quota editor (mirrors prod's `QuotaEditor`). Per-user file browser (`/admin/storage/[userId]`) stays out of scope — folded into A13 instead.

**A13 Files** (`/admin/files`): board-wide archive browser — debounced search by title/artist/username, public/private badge, inline play preview, delete. Prod's `_admin-files-browser.tsx` (856 lines: facets, bulk edit, saved filter presets) trimmed to single-item search + delete for v1; bulk operations deferred.

**A14 Content reports** (`/admin/content-reports`): status filter chips + report list with resolve-with-note actions (start review / mark actioned / dismiss) — ported prod's flow directly, it was already simple.

**A15 Financial** (`/admin/financial`): folded prod's link-only hub plus its `ledger` and `fansubs/overview` sub-pages into one page — fan-sub stats (active subs, MRR, pending/failed payouts) + ledger entries with an add-entry form. `fansubs` (per-subscriber payout retry) and `legacy-members` (Stripe migration queue) sub-pages stay out of scope.

**A16 Governance** (`/admin/governance`): prod is a pure link hub to 6 sub-tools; ported as an info-card grid instead, with live counts where available (open motions, pending venue verifications, resolutions this year). Only AGM links through to a built page — Audit log, Annual report generator, Board resolutions, and Member register stay informational cards for v1 (no dedicated pages yet).

**A17 Feature requests** (`/admin/feature-requests`): status filter chips + vote-ranked list with Plan/In progress/Done/Decline/Reopen actions. Dropped the "close as duplicate + merge target" flow (low-value complexity for a first pass) and the quarterly report panel.

**A18 Grants** (`/admin/grants`): disbursement history table (year, recipients, total). Per-year preview/run flow (`/admin/grants/[year]`, a dry-run + irreversible disbursement trigger) stays out of scope — too high-stakes for a v1 port without a real confirm-and-audit flow.

**A19 AGM** (`/admin/agm`): agenda builder ported verbatim (fully client-side in prod — add/reorder/remove/copy-to-clipboard) + open/draft motions list + the member-notification-requirements disclosure. Minutes/records links point at pages that don't exist yet in this shell, so that section was dropped rather than link to nothing.

**A20 Vendors** (`/admin/settings/vendors`, mounted at `/admin/vendors` here): static critical-vendor and integration-vendor reference tables + live Mixcloud/Revelator distribution status. Dropped raw env-var names (`MIXCLOUD_CLIENT_ID` etc.) — board members need to know a DPA is required, not which env var holds the secret.

**A21 Status** (`/admin/status`): service health table (state, criticality, latency, detail) with an overall operational badge — direct port, prod page was already clean.

**Screenshots:** `docs/redesign-shots/admin-storage-v1.png`, `admin-files-v1.png`, `admin-content-reports-v1.png`, `admin-financial-v1.png`, `admin-governance-v1.png`, `admin-feature-requests-v1.png`, `admin-grants-v1.png`, `admin-agm-v1.png`, `admin-vendors-v1.png`, `admin-status-v1.png`

**Status:** approved.

### 2026-08-17 — Mobile pass + icon-only media actions + mock-text sweep

**Goal:** Not a page-by-page redesign — a cross-cutting cleanup requested directly: kill redundant text links next to icon buttons, strip leftover "(mock)" jargon from user-facing copy, and fix concrete mobile breakage (found via a Playwright audit at a 390×844 viewport, since no live browser session was available this pass).

**`MediaIconActions`:** Dropped the auto-generated hint line under the icon row (`Play Radio · Queue · Favorite`) — every action already carries `title`/`aria-label`, so the caption was pure duplication. Used on `RadioView` and `ChannelView`.

**Mobile layout bug (`RadioView`):** The member-relay banner (`Live now on the member relay: …`) put raw text and inline elements as direct children of `Box`, which is `display: flex` — on a 390px viewport each text fragment became its own flex item and wrapped word-salad style instead of flowing as a sentence. Fixed by wrapping the sentence in a single `<span>`.

**Mock jargon removed from content strings:** `src/api/mock.ts` had "(mock rotation)", "(mock HLS)", "(mock chat)" etc. baked directly into now-playing titles, chat messages, and revenue line items — these render as real UI copy, not just an internal flag. Also cleaned `(mock)` suffixes in `client.ts`, `broadcast.ts`, `channel-provision.ts`, `sources.ts` error/label strings.

**Live vs browsable artists (`mockChannel`/`mockDirectory`):** Every one of the 9 demo channels was hardcoded `state: 'LIVE'` with a working `hlsUrl`, so every artist card in the Listen directory offered a misleading "Play" as if they were all broadcasting. Only `tahti-radio` and `northern-lights` (the member-relay slug used by `mockRadio()`) are actually live now; the rest report `OFFLINE`/`hlsUrl: null`/`nowPlaying: null`. `ChannelDirectoryItem` gained an optional `live` flag so the Listen grid only shows the Play/Queue overlay on genuinely-live cards — offline artists are click-through to their profile, which already had a real per-artist archive (`mockArchiveItems` → `trackTitles`) and releases; that infrastructure just wasn't being reached from the directory.

**Screenshots:** `mobile-shots/radio-fixed.png` (banner fix), `mobile-shots/channel-offline-artist.png` (offline-artist profile), `mobile-shots/home-v2.png` (Listen directory) — captured to scratch, not committed to `docs/redesign-shots/`.

**Status:** shipped — verified via `tsc --noEmit`, `eslint`, and `vite build`; no automated screenshot regen against `docs/redesign-shots/` this pass.

### 2026-08-17 — Music page folds in Stash as a Files folder

**Goal:** User request — archive items should live under "Music," with an Archive folder sitting alongside the artist's other files, instead of Archive (`/studio/archive`, labelled "Library") and Stash (`/studio/stash`, private uploads) being two disconnected nav entries.

**Changes:**

- `StudioArchiveView` renamed "Library" → **Music**; added an Archive/Files folder-tab switcher (`?folder=files` search param, same `role="tablist"` pattern as Updates' Posts/Newsletter tabs) — Archive tab is the unchanged catalog list, Files tab renders the Stash file browser inline
- Extracted Stash's upload/list/play/delete UI into a shared `StashFilesPanel` component so it's not duplicated between the standalone Stash page and the new Files folder
- `StudioStashView` now just wraps `StashFilesPanel`; page stays reachable directly (Sources hub and Studio home's "More tools" still deep-link there) and its subtitle now points back at Music → Files
- `StudioNav`: primary pill relabelled "Music"; dropped the separate "Stash" entry from More studio tools (folded into Music)
- Studio home's Music group card relabelled "Library" → "Music" to match

**Screenshots:** `mobile-shots/music-archive-tab.png`, `mobile-shots/music-files-tab.png` (scratch, not committed).

**Status:** shipped — verified via `tsc --noEmit`, `eslint`, and `vite build`.

### 2026-08-17 — Page A22 Languages (i18n) v1 (`in-review`)

**Goal:** Last row on the admin nav — per the Phase-0 decision log, board must be able to create a language and import a CSV whose base/source column is English. Same AdminGate/AdminNav/StudioPanel foundation as the rest of admin.

**Changes:**

- `AdminI18nView` (`/admin/i18n`): language list with a translated/total progress bar per row (English is the non-removable `Base`); **New language** opens a `Dialog` for code + name; each non-base row gets an **Import CSV** action that opens a native file picker
- `api/admin.ts`: `fetchAdminLanguages`, `createAdminLanguage`, `importAdminLanguageCsv` — CSV parsing (header-row detection, `english,translation` columns) happens client-side so the imported/skipped count and progress bar update immediately in mock mode; the live-API path posts the file as `multipart/form-data` to `/api/admin/i18n/languages/:code/import` (endpoint doesn't exist yet — same "port ahead of the real API" pattern as the rest of this admin sweep)
- `AdminNav` gained a 22nd entry, **Languages**

**Verified functionally** (not just visually): created a language via the dialog, imported a 3-row CSV against Swedish's mock 214/812 baseline, confirmed it read 217/812 (27%) afterward.

**Screenshot:** `docs/redesign-shots/admin-i18n-v1.png`

**Status:** approved. This closes out all 22 rows of the admin port.

### 2026-08-17 — Studio panel consistency pass: Moderation / Events / Embeds / Upload / Channel designer + shared PageHeader

**Goal:** Cross-cutting consistency pass, not a page-by-page loop entry — several studio pages still used ad-hoc `<section>`/`<h2>` chrome instead of the `StudioPageHeader`/`StudioPanel`/`Tabs` shell already established across the rest of studio, and the fan-facing `PageHeader` lagged Studio's heading weight.

**Changes:**

- **Studio Moderation / Events / Embeds** (`StudioModerationView`, `StudioEventsView`, `StudioEmbedsView`): raw `<section>` blocks replaced with `StudioPageHeader` + `StudioPanel`, each split into a `Tabs` view (Moderators/Chat bans, Upcoming/Add event, Pinned tracks/Add embed) instead of stacking every control on one page
- **Studio Upload** (`StudioUploadView`): same `StudioPageHeader`/`StudioPanel` shell
- **Channel designer visualizer picker** (`ChannelDesigner.tsx`): replaced the per-preset enable/disable toggle list (`visualizerPrefsStore.ts`, deleted) with a single "Use visualizer" toggle plus a flat pick-list of presets — the old per-preset visibility toggle was speculative config nobody had asked to hide individual presets with; the picker now just shows what's usable and which one's active. Design/24-7 Radio/Profile/Username-Domain reorganized into `Tabs`.
- **`PageHeader`** (shared fan-facing page shell): heading now `font-display font-extrabold` to match Studio's headings, instead of a plain `font-bold`
- **Chat / Venues / Status / Collection / Messages / Themes**: migrated onto the shared `PageFrame`/`PageHeader` for the same heading treatment and back-link pattern Studio already uses, replacing bespoke `<div>`/`<h1>` headers

**Verified:** `tsc --noEmit` and `eslint` clean on `tahti-web` (pre-existing markdown/script lint errors in files untouched by this diff aside); live-screenshotted every changed route (`VITE_FORCE_MOCK=1`, mock auth) against `tahti-dark` — no visual regressions, tabs/panels render and switch correctly.

**Status:** shipped — not captured into `docs/redesign-shots/` (scratch-only this pass, same as the earlier "Mobile pass" entry above).

### 2026-08-22 — Full visualizer catalog

**Goal:** Close the visualizer parity gap without adding Three.js to the initial mobile listen bundle.

**Changes:**

- Replaced the three-effect canvas/WebGL approximation with ten distinct Three.js scenes matching the production preset catalog: Water ripple, Waveform bars, Particle field, Aurora, Reactive grid, Cloudscape, Line tangle, Backdrop box, Lens flares, and Spotlight
- Kept the shared Web Audio analyser wiring, custom channel colors, artwork-driven water ripple, reduced-motion fallback, and per-preset speed/intensity settings
- Lazy-loaded the Three.js renderer as its own chunk; static gradients remain the no-WebGL/reduced-motion fallback
- Layered the active Three.js scene behind the full public channel page at Tahti's ambient live/offline opacity while retaining the stronger hero visualizer

**Status:** shipped — verified with type-check, lint, production build, and browser screenshots.

### 2026-08-23 — Tahti route and capability parity sweep

**Goal:** Compare the current Tahti `apps/web` page tree with the Nuclear SPA by route and behavior, distinguish missing features from intentionally consolidated ones, and repair legacy links that were landing on the Studio home.

**Navigation repaired:** Distribution, Events, Embeds, Recordings, artist Venues, Posts, broadcast recordings, archive editor deep links, track Insights, collection creation, and production settings destinations now resolve to their existing Nuclear surfaces. Regression coverage lives in `prodPathRedirects.test.ts`.

**Missing list added:** `FEATURES.md` now records public venue detail, transparency methodology, public/member feature requests, upload job detail, and guided signup sub-steps as missing; support submission, member venue governance, routed DM threads, reduced admin detail operations, multitrack depth, and dynamic SEO/OG as partial.

**Map updated:** `/more` no longer says Press kit and Board admin are absent. It shows their current parity and exposes the newly audited missing/partial surfaces as reviewer-visible comparison cards.

**Status:** implementation gaps logged; navigation fixes included in the current release batch.

### 2026-08-23 — Artist identity, radio rotation, imports, and Library consolidation

**Goal:** Bring the artist-facing media identity workflow into one professional surface, make the board’s radio view reflect what listeners actually hear, and remove duplicate or silent import/archive paths.

**Branding and press kit:** Added `/studio/branding` with Branding, Gallery, and Press kit tabs. Artists can upload or replace their profile picture and open it full size, reuse the channel outlook designer, append to or replace the existing gallery, choose gallery visibility during upload, and select press-kit images. The press kit keeps at most ten selected images and automatically excludes the oldest selection when the limit is exceeded. Public gallery viewing now has a fullscreen slideshow, previous/next controls, wraparound keyboard arrows, Home/End, and Escape.

**Admin identity and radio:** User management now combines account, membership, payment, channel, engagement, public-profile, follower, bio, pronoun, and catalog information, with an expandable avatar. Tahti Radio admin reads the actual station output separately from the live-member relay, so rotation playback is no longer called offline. It shows current track and transport controls plus the shared draggable `TrackTable`, removal actions, and total rotation duration. Tahti Selects uses the same editor.

**Sources and imports:** Removed “From broadcast” from Sources; saved captures stay in Studio → Recordings. hearthis.at single, batch, set, and collection imports now emit started/completed notifications, link to the new track or collection, retain cover-art import, and disable source items already imported by the signed-in user.

**My Library:** Studio’s primary Music entry now opens My Library. All sounds remains its first section and gains pinned filtering, pinned-first ordering, inline pin/unpin actions, high-contrast pinned rows, stronger zebra striping, visibility filters, search across title/artist/genre, and discography sorting.

**Collections, Recordings, and Messages:** Albums and Playlists no longer compete as separate Studio tools. One Collections hub now searches and filters albums, EPs, DJ sets, and playlists, creates each type, and opens the correct design or ordering editor. Album and EP metadata includes release date, up to five genres, and public, unlisted, or private visibility both at creation and in the full editor. Recordings is now a first-class My Library section. Messages moved out of My Library to `/messages`, with global sidebar and top-bar access plus compatibility redirects for old links.

**Release tools:** Embeds moved out of the Grow/miscellaneous area and into the Release tool group, the Studio music overview, and the Releases header so pinned external players are managed alongside release publishing.

**Queue feedback:** Add-to-queue actions now flash and disable during the add transition, then remain visibly checked and disabled while the track is queued. The bottom player’s queue control uses upward/downward expand and collapse cues, and Clear queue is a subdued icon-only action beside the lower playback controls.

**Status:** implemented; type-check, lint, unit tests, build, and focused browser acceptance are the release gate.

### 2026-08-23 — DM thread deep-links, public venue detail, country flags

**Goal:** Close three of the smaller gaps from the same-day route/capability sweep: DM threads lost their identity on refresh, the venue directory promised a "shareable venue profile" that didn't exist, and every country display in the app showed a bare two-letter code instead of a flag.

**Direct-message thread URLs:** `MessagesView` used to track the open conversation only in local state. Added a `/messages/$id` route; opening a thread now navigates there (`fetchConversation` still drives the panel), so refreshing or sharing a DM link lands back on the same conversation instead of an empty inbox view.

**Public venue detail:** New `/v/$slug` route + `VenueDetailView`, built entirely from the existing `fetchVenues()` directory list (no new backend endpoint — `VenueDirectoryItem` already carries name/city/country/capacity/description). Handles loading and not-found states with the shared `EmptyState`. `VenuesView` now links each card and its former "Open on tahti.live" external link to this in-app page instead of out to prod.

**Country flags:** Ported `flagEmoji`/`countryName` from prod's `apps/web/src/lib/flag-emoji.ts` + `country-options.ts` into `src/lib/countries.ts` (kept this repo's larger 58-country list rather than prod's 15-entry subset), plus a combined `countryFlagAndName` helper. Replaced every bare country-code render with flag + name: `VenuesView`, `VenueDetailView`, Studio Stats' "Top countries" and Stats Detail's "Download countries" panels, and the country `<select>` options in Onboarding and Settings → Artist (matching prod's own `{flag} {name}` option label pattern). Left `VenueRegisterView`'s raw code input alone — prod's own venue-register form is the same plain 2-letter text input, no flag preview there.

**Status:** implemented; `tsc --noEmit`, `eslint`, and the full `vitest` suite (52/52, excluding the pre-existing unrelated Playwright/vitest config collision on `e2e/cutover-vital.spec.ts`) are clean. Not yet click-verified in a live browser — the Chrome extension wasn't connected this session.

### 2026-08-23 — Guided page tour (H key) and a keyboard-shortcuts help article

**Goal:** Port prod's contextual help spotlight (`packages/ui/src/brand/HelpSpotlight.tsx` on tahti.live — a "?" button that highlights and explains a page's tabs one at a time) into a keyboard-triggered tour covering nav, not just tabs: explain the sidebar everywhere, the top bar only on the homepage, and Studio/Admin panel items while inside those sections. Prod's own version has no keyboard trigger and is desktop-only tab-level help; this is a from-scratch reimplementation of its visual mechanism (four veil divs cutting a highlight box out of a dark overlay, plus a glow ring) generalized to whole nav trees via a `data-tour-id` targeting scheme instead of prod's per-page ref map, since one page here can have 50+ explainable items across four independently-owned nav components instead of prod's handful of same-component tabs.

**New:** `lib/pageTour.ts` (pure `getPageTourSteps(pathname)`, unit-tested in `pageTour.test.ts`), `stores/tourStore.ts` (open/stepIndex/toggle — zustand, same shape as the existing modal stores), `components/PageTourSpotlight.tsx` (the veil+ring+card overlay, mounted once in `AppShell`). `StudioNav`/`AdminNav` gained a `description` on every nav-item object and export their own `*_TOUR_STEPS`; `InPageNav` auto-tags every item it renders with `data-tour-id="nav-item-{id}"` so any future page built on it gets tour support for free, mirroring prod's `DashboardTab.helpDescription?` generic-wrapper pattern rather than its per-page duplicated-tab-list pattern. Sidebar items (`AppShell`) and top-bar icon buttons (`AppTopNav`) got matching `data-tour-id`s and hand-written step copy in `pageTour.ts` since they aren't data-driven components.

**H key:** added to `AppShell`'s existing global keydown handler (same `isEditing` guard as the pre-existing Alt+1–5 and V shortcuts) — confirmed Alt+1–5 and V are unmodified and still work, and shortcuts stay suppressed while typing, via a throwaway Playwright/Chromium script (browser extension wasn't connected this session either) signing in against the mock API and walking the tour with real keypresses.

**Two real bugs the script caught, both fixed:**
- Studio's "Studio tools" panel starts collapsed on Overview, so its 17 tool links weren't mounted yet when the tour's one-shot `getPageTourSteps().filter(exists in DOM)` ran — `StudioNav` now force-expands the panel while the tour is open (`useTourStore` subscription), but that's a second render-commit cycle after `open` flips, so `PageTourSpotlight` also had to move its step-availability scan from a single rAF to a 60ms deferred check to give that cycle time to land.
- The highlight ring reused `border-primary`/`ring-primary`, prod's own accent color — on an already-active nav pill (`bg-primary` styling) the ring and the pill's own highlight blended and the label became unreadable. Switched to `border-accent-cyan`/`ring-accent-cyan`, matching prod's original choice of cyan specifically to contrast against whatever it's highlighting. Also found (via fast synthetic ArrowRight presses, faster than a human would ever go) that the rect measurement lagged the step-label update by one render when both changed in the same tick; moved the per-step measurement from `useEffect` to `useLayoutEffect` so the ring is never visibly one step behind the card.

**Help center:** added a `keyboard-shortcuts` article to `content/help.ts` listing H/←/→/Esc for the tour and the existing Alt+1–5 / V shortcuts (also verified live, not just read from source) — `HelpArticle.productionPath` had to become optional since this article has no prod equivalent.

**Status:** implemented; `tsc --noEmit`, `eslint`, and the full `vitest` suite (58/58 — 6 new for `pageTour.ts`) are clean. Live-verified via the throwaway Playwright script on `/`, `/studio` (including the force-expanded tools panel), and `/admin/users` (via a localStorage role patch, since the mock login flow has no board-role path) — screenshots confirmed correct highlight placement, legible ring contrast, and correct step-order after both bug fixes; the script and its screenshots were scratch-only, not committed.

### 2026-08-23 — Transparency methodology page

**Goal:** Next `FEATURES.md` gap — prod's `/transparency/methodology` explains how Tahti ry's co-op ledger is recorded (revenue/cost categories, the grant-pool formula, the monthly data pipeline, the public read-only API); the POC's `/transparency` dashboard had the live numbers but no explanation of where they come from.

**New:** `TransparencyMethodologyView` (`/transparency/methodology`) ports prod's static content (`apps/web/src/app/transparency/methodology/page.tsx`) into the POC's own header/section conventions rather than prod's `@tahti/ui` `PublicPageHeader`/`Heading` components — no new API dependency, it's pure copy. Linked both ways: a "How this data is recorded and published" link from the `/transparency` dashboard header, and a back-link + footer "Platform status" link (pointed at the POC's own `/status` route instead of prod's external status-page helper, since this app has a live one).

**Status:** implemented; `tsc --noEmit`, `eslint`, and the full `vitest` suite (58/58) are clean. Live-verified with a throwaway Playwright script — both nav links work, content renders, no console errors; script and screenshot were scratch-only, not committed.

### 2026-08-23 — Support ticket form, member feature requests, and a `FEATURES.md` correction

**Goal:** Continue down the route-sweep gap list. Before building anything, forked a research pass into prod's actual backend (`/home/jani/workspace/tahti` — `apps/api`, `packages/db/prisma/schema.prisma`) for the five remaining items, since building UI against a nonexistent endpoint would be worse than not building it. Findings: support and feature-requests both have real, complete Prisma-backed APIs; venue governance in prod is board-only (same as this POC already has) — not actually a gap despite `FEATURES.md`'s wording; upload job detail and signup-step parity are lower value (the former is fundamentally session-scoped even in prod, the latter is prod's own "deliberately consolidated" call).

**Support contact form:** `SupportContactForm` (new component, mounted into `HelpArticleView` only for the `support` slug) posts to the real `POST /api/support/contact` — `subject`/`message`/`category` (`ENGAGEMENT_DISPUTE | TECHNICAL | FINANCIAL | OTHER`, matching the Zod enum in `packages/shared/src/dto/admin-support.ts`) plus `contactEmail` only when signed out, mirroring prod's own `support-contact-form.tsx` field-for-field. `api/client.ts` gained `submitSupportTicket` with the usual mock/live split.

**Member feature requests ("Topics"):** New `FeatureRequestsView` at `/governance/feature-requests`, modeled directly on the existing `GovernanceView.tsx` (same member-gate/forbidden-state pattern, same expand-to-discuss comment thread) since it's the closest sibling in this codebase — list sorted by vote count, upvote/un-vote toggle, a collapsible "Propose an idea" composer, and status badges for prod's real `FeatureRequestStatus` enum (`OPEN | PLANNED | IN_PROGRESS | DONE | DECLINED | DUPLICATE`, with `DUPLICATE` rows showing which request they were merged into and voting disabled). `api/client.ts` gained `fetchFeatureRequests`/`createFeatureRequest`/`voteFeatureRequest`/`fetchFeatureRequestComments`/`postFeatureRequestComment` against `/api/v1/governance/feature-requests` — the member-facing route, distinct from the pre-existing admin-only `fetchAdminFeatureRequests` review queue in `api/admin.ts` (`/api/admin/feature-requests`), which stays as-is. Comments reuse the existing `MotionComment` type since prod's own Prisma schema comment says `FeatureRequestComment` "mirrors `MotionComment`'s shape... for the same reason" (nullable author survives user deletion).

**`FEATURES.md` correction:** struck "Public venue governance" as a gap — prod's own `/governance/venues` is board-only ("Venue verification"), same as this POC's existing board/studio venue tooling. There's no member-facing prod route to be missing.

**Status:** implemented; `tsc --noEmit`, `eslint`, and the full `vitest` suite (58/58) are clean. Live-verified via a throwaway Playwright script signing in against the mock API: submitted a support ticket both logged-in and logged-out (email field correctly required only when signed out), and on feature requests — navigated from `/governance`, upvoted a request, posted a comment, and proposed a new idea, all reflected immediately in the UI. Script and screenshots were scratch-only, not committed.

**Remaining from the sweep, deliberately not built:** upload job detail (`/dashboard/upload/:uploadId`) is buildable only as within-tab-session parity — a `File` object can't survive a real refresh in prod either, so a route wouldn't close the actual gap `FEATURES.md` describes; signup profile/broadcast step parity is prod's own "deliberately consolidated" design, redundant with what Onboarding/Settings already cover here. Flagged rather than built silently.

### 2026-08-24 — hearthis.at Studio Archive playback, dynamic appearance mode, chat reconnect debounce

**hearthis.at embeds "not working in the player":** Root cause wasn't the embed widget itself — `lib/embedSrc.ts`'s `hearthisEmbedSrc` was verified byte-for-byte against the canonical `packages/shared/src/hearthis-embed.ts` in the main tahti repo and confirmed live via `curl` (200, real embed HTML, no blocking CSP/X-Frame-Options). The actual bug: `StudioArchiveItem` (the "My Library" list type) never carried `embedProvider`/`embedUri` at all, so an artist's own hearthis.at-imported tracks were indistinguishable from real uploads in Studio → Music. Clicking Play called `fetchEditorSource` — an endpoint that expects a real Tahti-hosted file — against a track Tahti never hosts, so it silently failed. Every *other* embed surface (`CollectionView`, `StudioCollectionEditView`) already filtered/branched on these fields correctly; only Studio Archive was missing them. Added the fields to the type, a mock hearthis.at row for testability, and swapped the Play button to open the same `EmbedTrackRow`-style inline iframe used elsewhere when a row is embed-only (also hides the now-meaningless "Audio editor" action for those rows). Live-verified: the real hearthis.at widget mounts and plays.

**Dynamic appearance mode:** `themeStore.ts` gained a `colorMode: 'light' | 'dark' | 'dynamic'` alongside the existing `dark` boolean — `dynamic` re-resolves against the local clock (dark 19:00–06:59) on a 5-minute interval so it keeps tracking day/night while the tab stays open, without needing a page reload. A brand-new user with no persisted preference now defaults to `matchMedia('(prefers-color-scheme: dark)')` instead of the old hardcoded dark default — same fallback duplicated in `index.html`'s pre-React boot script so there's no flash of the wrong theme. Onboarding gained an "Appearance" tab (Light / Dark / Dynamic) that applies live as it's picked and pre-selects whichever option matches the OS, exactly as asked; `ThemesView.tsx` and Settings → Themes both got the same 3-way control so `dynamic` remains a live, undoable choice rather than a onboarding-only dead end. New `isDynamicDark` unit tests (7 cases, hour boundaries).

**Chat reconnect flicker:** `ChannelChatPanel`'s viewer-connect `useEffect` depended on `[slug, mode]` — but its own WebSocket's `onclose` handler demoted `mode` from `'live'` back to `'rest'` on any drop, which re-triggered that same effect and opened a *second* connection as an accidental, undocumented reconnect path with no backoff and no visible-state debounce, so a flaky connection flickered the "Live" badge on every drop/reconnect cycle. Replaced it with an explicit, owned reconnect: `connectWs`'s `onclose` now schedules a retry (linear backoff, capped at 5 attempts, skipped on intentional close from unmount/slug-change) instead of relying on the mode-change side effect, and the effect itself now depends only on `[slug]`. Separately, the "Live" badge is now driven by a debounced `liveDisplay` state that only flips to false after 8 continuous seconds of disconnection (`DISCONNECT_GRACE_MS`) — a quick drop-and-recover never touches the UI. The real send-message gate still checks the live `wsStatus`, not the debounced display, so nothing sends over a socket that only *looks* connected.

**Status:** implemented; `tsc --noEmit`, `eslint`, the full `vitest` suite (65/65 — 7 new for `isDynamicDark`), and a production build are clean. hearthis.at fix and onboarding appearance defaults live-verified with a throwaway Playwright script (including both `light`/`dark` `colorScheme` contexts confirming the pre-selected option tracks the OS exactly). The chat reconnect/backoff logic could not be timing-verified live — mock mode never opens a real WebSocket, so this needs a manual check against a live Centrifugo connection (kill the network, confirm the badge survives an 8s blip and only drops on a sustained outage).

### 2026-08-24 — CI lint fix, beta API proxy regression, GitHub Actions deploy flow, TrackTable accessibility bug

**Goal:** GitHub CI was red and beta.tahti.live couldn't reach the live API at all; also wanted a GitHub Actions deploy flow (ported from the sibling `tahti-org` repo) so a merge to `master` deploys the beta build automatically instead of needing a manual `pnpm deploy:tahti-beta` from a dev machine.

**CI lint root cause:** `TAHTI-PORT-CHECKLIST.md` had `12b. [ ]` as a checklist marker — not a valid ordered-list token, so remark parses that line as a plain paragraph where `[ ]` becomes an empty shortcut reference link instead of a task-list checkbox, failing `markdown/no-missing-label-refs`. Renumbered the item into the real sequence (13–15). While pushing the fix, `origin/master` had already moved — someone (or an earlier session) had pushed a competing "fix" that left the actual `12b.` bug untouched and instead truncated two unrelated sentences to `[...]`, reintroducing the identical empty-reference-link bug it claimed to fix. Rebased onto it and resolved by hand: kept the real numbering fix, restored the two corrupted sentences to their original full text.

**Beta → API connectivity root cause:** the earlier same-day DNS re-resolve fix (`ce5210d0`, switching `nginx.conf`'s `proxy_pass` to a variable host so it wouldn't cache `api.tahti.live`'s IP forever) has a documented nginx side effect: with a variable host, nginx stops doing its usual location-prefix path rewriting and forwards only the literal static text written after the variable, dropping the actual request path. Every proxied call on beta — `/tahti-api/...`, `/api/...` — was collapsing to plain `/` (or `/api/`) on the upstream and landing on the API's own docs/reference page (200, HTML) instead of the real JSON endpoint, regardless of what path the client actually asked for. Confirmed live via `curl` (byte-identical 805-byte response body across unrelated endpoints), root-caused via `git log` on `nginx.conf`, and reproduced + fixed by actually building the Docker image and round-tripping real requests against `api.tahti.live` on a Compose-equivalent user-defined bridge network (the default `docker run` bridge doesn't have Docker's embedded DNS at `127.0.0.11`, so an initial local repro attempt gave a false negative before switching networks). Fixed with `rewrite ^/tahti-api/(.*)$ /$1 break;` + URI-less `proxy_pass` for the prefix-stripping `/tahti-api/` location, and `proxy_pass https://$upstream$request_uri;` for the pass-through `/api/` location. The currently-running beta container still has the broken config loaded and needs a redeploy to pick this up.

**Deploy flow:** new `.github/workflows/deploy-tahti-web.yml`, porting the jumphost-SSH pattern from `tahti-org`'s `deploy-production.yml` (vimage sits on a private LAN behind `sparkki.dudeisland.eu`, unreachable directly from GitHub-hosted runners) and pointing it at this repo's existing `deploy-vimage.sh` target instead: build `tahti-web`, rsync `dist/` + `deploy/`, rebuild the container, restart via `docker compose`, smoke-check both the SPA and the (now-fixed) API proxy. Triggers on `workflow_dispatch` (deploy latest `master` on demand) and on `workflow_run` after `CI` succeeds on `master`, so every merged change ships automatically once green. Registered `DEPLOY_SSH_PRIVATE_KEY` as a repo secret from the same key already authorized on the jumphost for `tahti-org`'s own deploys.

**Accessibility regression, caught as a side effect:** fixing the lint failure let the `Test` CI stage run for the first time in a while (it had been skipped every run while `Lint` failed first), which surfaced a real, previously-invisible bug in `packages/ui`'s `SortableRow` (used by every `TrackTable`, including this repo's own read-only playlist rows): it only spread dnd-kit's `attributes` (which carries `role`, `tabindex`, `aria-roledescription`, and `aria-disabled`) when a row was reorderable — exactly backwards, since the disabled/read-only case is precisely when `aria-disabled="true"` needs to be present. Fixed to always spread `attributes`; the actual interactive `listeners` stay gated on `isReorderable`. Regenerated the 18 player-package snapshots and the `ui` package's own 4 `TrackTable` snapshots that were stale from this fix plus an unrelated, already-shipped button press/hover style change (`5cde3d6e`) that Test had never gotten a chance to catch either.

**Status:** implemented; full monorepo `pnpm lint` (12/12 workspaces) and `pnpm test` (14/14 turbo tasks — 673 player tests, 242 ui tests, all others) are clean locally and pushed to `master`. Not yet verified against a real deploy: the new workflow needs a green `CI` run on `master` to fire for the first time, and the running beta container needs that deploy (or a manual `pnpm deploy:tahti-beta`) to actually pick up the nginx fix.

Follow-up in the same session: the beta proxy fix and deploy workflow above both landed and were verified live — `beta.tahti.live` round-trips real API responses again, and a manual `workflow_dispatch` run of the new Deploy workflow went fully green end-to-end (its `DEPLOY_SSH_PRIVATE_KEY` needed re-authorizing on the jumphost first; once done, every step including the jumphost→vimage SSH hop and both smoke checks passed).

### 2026-08-24 — Legal pages bind to the real terms/privacy/AGPL text

**Goal:** Next open P0 cutover blocker (`CUTOVER.md` §P0 / §1.2): `/terms`, `/privacy`, and `/agpl` were a short in-app summary that told the reader to go read the binding version at `tahti.live/...` — exactly the "POC summary + link-out" shape the checklist calls out as not good enough for cutover.

**Changes:** Ported prod's actual page copy verbatim from `tahti/apps/web/src/app/(info)/{terms,privacy,agpl}/page.tsx` — every section, list, and link, not a re-summarized version. The existing `content/legal.ts` → generic `LegalView` renderer only supports flat paragraphs per section, too thin for these three (definition lists on Privacy, ordered/unordered lists throughout, inline links including a cross-link from Terms to Privacy and mailto links). Rather than bend that shape to fit, gave each page its own view (`TermsView`, `PrivacyView`, `AgplView`) built on a new shared `LegalDocShell`/`LegalDocSection` (`components/LegalDocShell.tsx`) that reproduces `LegalView`'s existing header/back-link/hub-footer chrome exactly, so the visual shell stays identical and only the body content differs. `content/legal.ts` lost the `terms`/`privacy`/`agpl` entries (dead weight once real components own that content) and gained `LEGAL_HUB_LINKS`, a plain `{slug, title, to}` list so the cross-page footer nav (shared by `LegalView` and the three new pages) has one source of truth instead of being derived from page content that no longer lives in that file; the three titles there now match the ported pages' real headings ("Terms of service", "Privacy policy", "Source code & AGPL licence") instead of the old summary-page titles.

**Status:** implemented; `tsc --noEmit`, `eslint`, and a production build are clean — confirmed the real content (e.g. "District Court of Helsinki", the `tietosuoja@tahti.live` contact address, the `tahti-live/tahti-org` repo link) actually lands in the built JS bundle rather than only existing in source. `CUTOVER.md`'s "Legal pages" P0 line and its §1.2 duplicate both flipped to done. Not click-verified in a live browser — the Chrome extension wasn't connected this session.

### 2026-08-24 (continued) — Bot-facing OG proxy, part 2 of the SEO/OG plan

**Goal:** Close the last open piece of `SEO-OG-NOTES.md`'s two-part plan (part 1 — client-side metadata sync once each view's data resolves — landed earlier the same day). Non-JS-executing unfurl bots (Facebook/Slack/Discord/etc.) never run the SPA's own `syncDocumentMetadata`, so they were all getting the single static `index.html` — identical generic preview for every `/c`, `/u`, `/r` URL.

**Changes:** `nginx.conf` gained an `$og_bot` user-agent `map` (Facebook/Twitter/Slack/Discord/LinkedIn/WhatsApp/Applebot) and three regex locations for `/c/*`, `/u/*`, `/r/*` that rewrite matched bot requests to an internal `/og-proxy/` location, proxying to a new `GET /api/og/{channel,profile,release}/:slug` in the production `tahti` repo's `apps/api` — a small, cacheable HTML document with just `<meta>`/`<title>` tags, mirroring this repo's own `src/lib/seo.ts` copy formulas so client-side and bot-facing previews say the same thing. Real browsers and JS-executing crawlers are completely unaffected — same SPA fallback as before, unless the UA matches the bot list.

**A same-feature collision, resolved live:** a parallel session (`tahti-06`) had independently built the identical `apps/api` route around the same time — discovered via `git fetch` before pushing, both sides checked in and reconciled without racing: their version won (used the shared zod route-param schemas already used elsewhere in that codebase, plus an HTML 404 page — a better fit than this session's own draft), this session dropped its local duplicate commit rather than push over it.

**Nginx routing logic verified end-to-end**, not just read — ran a real nginx container with the actual (unmodified) config file, a live upstream (the real `api.tahti.live`, since this is a read-only public GET matching normal beta traffic): confirmed a bot UA on `/c/foo` gets rewritten through `/og-proxy/` to the correct upstream path, a normal browser UA gets the untouched SPA fallback, nested paths like `/u/foo/subscribe` are correctly NOT intercepted, and direct external access to `/og-proxy/` itself is correctly blocked (`internal;`, 404).

**Status:** implemented and pushed on both repos. `CUTOVER.md`'s SEO checklist item and `SEO-OG-NOTES.md` both updated to reflect both parts done; the only remaining step noted there is a live crawler QA pass (Phase 7.4) against the deployed `tahti` API route.

### 2026-08-25 — Accessibility pass, studio UX fixes, per-screenshot navigation atlas, admin Activity + Logs

**Goal:** Continue down `CUTOVER.md`'s remaining P0/P1 items — the accessibility pass (keyboard/focus/live regions), the bundle-budget item, and the "everything mixed up" single mermaid diagram the map page's Screen atlas had been using — plus two feature requests that came up mid-session: a real system-events admin page and a container-logs admin page.

**Player bar accessibility:** the seek bar was a mouse-only `<div onClick>` with no `role`, no keyboard support, and no ARIA value attributes at all — a keyboard or screen-reader user couldn't seek at all. Gave it `role="slider"` with `aria-valuemin/max/now/valuetext`, arrow-key/Home/End/PageUp/PageDown handling (mirroring the existing `Slider` primitive's own step convention), and a visible focus ring. The volume slider had no accessible name — its `Slider.Header` (the thing that supplies `aria-labelledby`) was never rendered, since `PlayerBarVolume` passed `showValue={false}` with no `label`; fixed by composing `Slider`'s subcomponents directly with a visually-hidden (`sr-only`) label instead of the default visible header, so the compact player bar's layout doesn't change. The mute button existed but had no `onClick` at all — wired it to the player store's pre-existing (unused) `toggleMute` action, added `aria-pressed`/an icon swap. Previous/Next/Shuffle/Repeat/Discovery buttons had no `aria-label` (Play/Pause was the only one that did) — added them, reusing the same label text already passed to their `Tooltip`. Tooltips themselves only ever appeared on mouse hover (`onMouseEnter`/`onMouseLeave` only) — added `onFocus`/`onBlur` so keyboard-focused controls get the same tooltip a mouse user would, a fix that benefits every other `Tooltip` consumer in the app too, not just the player bar.

**Chat accessibility:** the message list had no live region at all — new messages gave screen-reader users zero indication anything had happened. Added `role="log"` + `aria-live="polite"` + `aria-relevant="additions"` (the ARIA spec's own canonical example for exactly this "chat room" case). The seven emoji reaction buttons had no accessible name beyond the raw glyph — added `aria-label="React with {description}"` for each, plus `role="status"` + a screen-reader-only description on the ephemeral "Sent 💜" confirmation.

**Studio upload → durable landing:** `StudioUploadView` used to stay on the form after a successful upload, showing a local "Open in Music" link that vanished on refresh (ephemeral React state, no route) — this was `FEATURES.md`'s open "Upload job detail" gap. It now navigates straight to `/studio/archive/$id`. That page itself previously rendered the full edit UI even while a track was still `PENDING`/`PROCESSING` — Play, the waveform, Normalize, and Auto-trim would silently act on audio that didn't exist yet. `StudioArchiveItemView` now polls while non-`READY`, shows a processing banner, and disables the audio-dependent actions until the track is ready (or shows a distinct error state for `ERROR`).

**A real navigation gap, found and fixed:** while grep-verifying every real `<Link>`/`navigate()` call in every Nuclear view against the map page's route claims (see next section), found that `StudioNav`'s persistent "Music" tool group listed Upload, Collections, Recordings, and Audio editor — but not the Music/Archive catalog itself, despite it being one of the most central artist surfaces. Added it (`ListMusicIcon`, first in the group). Logged this and every other finding — including things checked and found to actually be fine, like Governance's apparent lack of a top-level nav entry turning out to be intentionally gated behind Settings → Account instead — in a new `NAVIGATION-GAPS.md`.

**Per-screenshot navigation atlas:** the Screen atlas's single ~90-node "every user option on one canvas" mermaid diagram was unreadable and, per the user, "mixed up." Replaced it with one small diagram *and* an accessible text list per screenshot (`actions`/`goesTo` fields added to `MapCase` in `content/mapScreens.ts`, a `caseFlowchart()` generator that turns that same data into a mermaid chart so the two representations can't drift apart — the text list is the actual accessible source of truth, the diagram is a supplementary visual). Every `goesTo` edge for all 46 cases is grep-verified against real source, not guessed; the persistent chrome (`AppShell`'s sidebar, `StudioNav`) is deliberately excluded from each screen's edge list since it reaches nearly everywhere and would make all 46 diagrams identical noise — that's also why the Music-in-sidebar gap above mattered, it's a hole in the one nav surface that *isn't* per-screen. The old monolithic diagram (pack `current`, i.e. apps/web) was replaced with a short redirect note pointing at the new atlas rather than mechanically split, since re-verifying a different repo's routes wasn't in scope this session.

**Bundle budget:** mermaid and Three.js were already correctly code-split (confirmed via a real production build, not assumed) — the actual problem was that all 22 admin pages were statically imported at the top of `router.tsx`, bundling board-only pages into the JS every anonymous listener downloads. Converted them to `lazyRouteComponent`, each into its own small chunk (~1-15 KB apiece) — a real if modest win (~95 KB off the main chunk); the true bulk of the ~2.6 MB main chunk is elsewhere and wasn't chased further this session.

**Admin → Activity:** a new page reusing the Nuclear desktop player's `LogViewer` UI (`@nuclearplayer/ui`, already shared — no porting needed, just composed via its `Root`/`SearchInput`/`LevelFilter`/`ScopeFilter`/`EntryCount`/`VirtualizedList` subcomponents rather than its default `Toolbar`, since "Clear"/"Open log folder" don't make sense for a real audit trail), fed by real system events — logins, uploads, releases, likes, follows, new fan subscriptions — not mocked. The backend half (separate repo, `tahti`) extended the existing board-gated `AuditLog` (already paginated/filterable/CSV-exportable) with three new action types rather than building a parallel system, instrumented at each real create path, verified against a live DB that repeat likes/follows/subscription-renewals each write exactly one row, not one per call. "Listened track" is deliberately absent — `ListenEvent` rows are anonymous by design (no `userId` column, for listener privacy), so there's no real per-user event to show; the page notes this and points at Stats for aggregate counts instead of fabricating attribution the data doesn't have.

**Admin → Logs, and a real architecture correction caught before it shipped wrong:** built to reuse the same `LogViewer` pattern for real container logs. First attempt added a whole new Loki + Grafana-datasource setup to `tahti/infra/docker-stack.yml` — which turned out to be a dormant, never-deployed aspirational Swarm migration file; the actual production stack on `vimage` runs via plain `docker compose` against `docker-compose.stack.yml`, and Loki + Grafana + a Loki datasource *already exist*, running on `vimage6` (confirmed by SSH, not assumed from repo docs). Corrected before merging: removed the redundant Loki service and datasource-provisioning from the unused file, pointed both files' logging config at the real `192.168.2.105:3100`, and added the actual `GET /api/admin/logs` route (queries Loki's `query_range` API server-to-server, board-gated, degrades to `lokiReachable:false` instead of throwing if Loki's down) — verified against the live vimage6 Loki, not mocked. Installed the missing Loki Docker logging-driver plugin on `vimage` and ran the real production deploy (`scripts/deploy_prod.sh`, coordinated with the concurrent `tahti-06` session to avoid racing a second deploy on the shared checkout): confirmed post-deploy that all 14 services now have real log streams flowing into Loki with exactly the labels the frontend's scope-parser expects, and that the new endpoint is live and correctly board-gated (401 with no session).

**In progress at session end — vimage7 GPU stem-separator:** asked to make the `worker` on `vimage7.local` use its NVIDIA GPU for "encoding." Checked before touching anything: every ffmpeg job in `apps/worker` is audio-only (`libopus`/`libmp3lame`/`flac`/`aac`) — NVENC only accelerates video codecs, so GPU passthrough for the transcode worker's actual workload would do nothing. The real GPU-shaped workload already in the fleet is `services/stem-separator` (ML source-separation inference, explicitly `[cpu]`-only today per its own Dockerfile comment, written when the only known hosts were colo/Hetzner with no GPU) — confirmed the GPU is real and working on vimage7 (`nvidia-smi`, GTX 950, driver 580.173.02) but the NVIDIA Container Toolkit wasn't installed. Since `separate-stems` is already in the `transcode` lane already running on vimage7, moved stem-separator into the same `docker-compose.worker-remote.yml` project (GPU device reservation, `audio-separator[gpu]` swap, no code change needed — `main.py` never hardcoded a device, the library auto-detects CUDA) rather than adding a new host. Deliberately no `depends_on` between the two services — stem-separator failing to start (e.g. toolkit not yet installed) must not block `worker-transcode`, matching the pre-existing "not required to boot" resilience design. Removed it from the main stack on vimage, repointed `STEM_SEPARATOR_URL` there at vimage7 instead. Blocked on: `sudo` on vimage7 needs an interactive password this session doesn't have, so the toolkit install itself needs a human; deploy of the new colocated services was kicked off and left running in the background (large image — torch + two baked-in model checkpoints + CUDA wheels) at the point this entry was written, not yet confirmed complete.

**Status:** the accessibility, studio UX, navigation atlas, bundle-budget, and Activity-page work above are implemented, tested (existing PlayerBar/Tooltip snapshot tests updated and passing, new archive-likes/artist-follows/fansubs/admin-logs tests added in the `tahti` repo and passing against a real Postgres, full `tahti-nuclear` suite — 69/69 — and `tahti` suites all clean), and pushed + deployed to production. The stem-separator GPU move is code-complete and pushed but not yet confirmed live — see above.

### 2026-08-25 (continued) — Stem separation UI, listener widgets, Plugin Store, History page port, MediaSession

**Goal:** vimage7 deploy confirmed live (worker-transcode up; stem-separator built but blocked on the toolkit install, as expected). From there: wire the stem-separation feature's frontend (backend already existed, built independently by the concurrent `tahti-06` session), then a long run of feature requests and `CUTOVER.md` slices.

**Stem separation:** found the backend (DB model, worker job with 7-day retention + sweep, API routes, DTOs) already fully built server-side with no consumer UI, and a real bug blocking it — the frontend requested `stemSet: '2STEMS'`, the API's zod schema only accepted `TWO_STEM`/`FOUR_STEM`, so every real request would 400. Fixed the mismatch and built a synced multitrack `StemPlayer` (one transport plays every stem together, per-stem mute keeps it silently in sync rather than pausing, per-stem download) into the Pro Editor's Stems panel, replacing bare download links.

**Listener widgets (SoundCloud/YouTube embeds + internet radio):** new `Settings → Widgets` — install a widget type, paste a URL, get the real platform embed (`w.soundcloud.com/player`, YouTube's `-nocookie` embed), not a proxy. Internet radio is a curated catalog (7 Finnish stations sourced from `streamurl.link/country/fi/`, fetched live rather than invented) with big-artwork cards reusing the same `Card`/`CardGrid` the channel directory uses; stream URLs are honestly `null` until verified — streamurl.link's actual stream links are behind client-side JS a static fetch can't reach, so rather than guess a URL, unverified stations show "Stream pending" and a real link to their own page. Built a listener station-suggestion → admin-review pipeline (`AdminRadioStationSuggestionsView`, distinct from the pre-existing track-submission review) so the catalog can grow past the seed 7 without guessing more URLs. Enabled widgets render on the Listen page itself, not just in Settings.

**UX consistency sweep:** forked a survey across every admin/studio view for crowding and styling drift, then fixed the top 5 findings — `StudioDistributionView` (rewired onto `StudioPanel`/`Tabs`, six unlabeled toolbar buttons got icons), `StudioVenuesView` and `StudioChannelView` (same `StudioPanel`/icon-button treatment), `AdminNewsView`'s three bare row-action buttons, and a literal `×` glyph in `StudioGoLiveView` replaced with a `Trash2Icon`. One low-priority finding (`StudioCollectionEditView`'s track-list density) was left as-is per the survey's own recommendation.

**Map page mermaid diagrams:** the per-screenshot diagrams added in the previous entry started overlapping once a screen had more than ~5 actions/links — `flowchart LR` was fanning every single action/nav item off the screen node as its own edge, and dagre couldn't lay that out cleanly at scale. Redesigned `caseFlowchart()` to group actions and nav targets into two `subgraph` clusters instead (at most two edges out of the screen node regardless of case size; dagre stacks cluster members cleanly on its own) — a structural fix, not a sizing tweak. Also added a second, distinct `MapCommentForm` (`kind="flow"`) next to each diagram specifically for navigation-flow feedback, separate from the existing per-case comment box, and filled in one real missing case (`/studio/archive/$id`'s detail view had two inbound links from other cases but no card of its own).

**Rotation controls collapse:** `StreamManagerPanel`'s "rotation is playing" state showed the full live-stream stats grid, playlist-add form, and multistream target list even when nothing was actually live — collapsed by default to just the transport buttons and artist/title/time-left line, with a chevron (matching the existing collapse-icon convention from the Pro Editor's mastering panel) to expand the rest. Scoped only to the rotation-fallback state; the real "you're live" view is unchanged.

**History page, ported from Nuclear desktop exactly:** the referenced screenshot turned out to be a real Nuclear production screenshot, confirming the existing `@nuclearplayer/ui` History components (`HistoryDayGroup`, `HistoryRow`, `CalendarHeatmap`, `ListeningClock`, `DayOfWeekChart`, `TopList`) were already ported into this fork's design system with zero consumers — built the actual page around them (`HistoryView` → `HistoryStatsSection`/`HistoryListSection`, same two-tab Stats/Listening-history layout). Nuclear tracks real per-play listening duration from a local SQLite log; this app only logs a play-event timestamp deduped to one row per track, so listening time is *approximated* from each track's own duration (documented inline, not left implicit) and "Top albums" — plays aren't grouped by album here — became "Top channels" instead of a fabricated list. Matched the reference screenshot's exact copy ("Time of day", "Listening calendar", the date-range header text). Added a sidebar "History" entry (was only reachable as a nested Library tab). This dragged `react-activity-calendar` into the main bundle (+367 KB) via `LibraryView`'s eager import — caught by a before/after build comparison, fixed by lazy-loading `LibraryView` the same way the admin pages already were.

**`CUTOVER.md` slices, several rounds:** closed §1.4's "document localStorage keys" (new `LOCALSTORAGE-KEYS.md` — confirmed `libraryStore`'s favorites/history are already scoped per-user/anon via a key suffix, so no migration step is needed at cutover) and its "no IndexedDB/service-worker, no Next server-actions" pair (both genuinely clean by construction — grepped, not assumed). Audited the "chat captcha + access gating (already hardened)" claim in the `tahti` repo rather than taking it on faith: server-side hCaptcha verification fails closed, `ChatBan` is checked at both token-issue and message-send, message length is schema-capped, and the Centrifugo publish-proxy webhook is locked to internal-network-only callers (a previously-fixed real vulnerability, SEC-007) — it genuinely is hardened, now with evidence recorded instead of an unverified checkbox. Removed two dead "open on tahti.live" escape-hatch links in `GovernanceView`/`FeatureRequestsView` (same membership check, same result, just extra friction) in favor of an in-app settings shortcut. Traced a real functional gap while auditing Next-only route handlers for hidden capability: the old Next app streamed live SSE render-progress via a route handler with no SPA equivalent at all, so `StudioProEditorView`'s render fired-and-forgot with a one-time toast and no way to know when it actually finished — added the same PENDING/PROCESSING-polling pattern the stems flow already used.

**Plugin Store, built from scratch then substantially reworked:** first pass was a read-mostly directory across the app's 7 plugin-shaped subsystems (themes/visualizers/export/import/multicast/fingerprinting/audio-plugins), each reading its real existing data source, with a companion `PLUGIN-STORE-PLAN.md` mapping what actually extracting each into a standalone package would take (ranked by cost — themes and audio-plugins are already closest to a real registry shape; Export/Fingerprinting have no per-implementation behavior to extract yet, since "Export" today is one Revelator call regardless of which DSP box is checked). Second pass added real inline configuration: a shared gear-toggle fold-out (`ConfigurableCard`) instead of every card being launcher-only, per-preset visualizer speed/intensity sliders backed by the real `patchChannelVisual` API, and a `MusicBrainz` fingerprinting plugin wiring a complete OAuth connect/disconnect flow that existed server-side (`apps/api/src/routes/me/musicbrainz.ts`) with no SPA UI at all before this. Third pass unified Import/Export/Fingerprinting into one tagged registry (`SERVICE_PLUGINS`, each entry carrying a `tags: PluginCategoryId[]`) instead of one array per category, so hearthis.at — genuinely both an import source and an export target — is a single entry with two tags rather than a duplicated card; its username config moved from a generic "Social links" profile field onto its own plugin card (same underlying storage, no longer only reachable by first navigating elsewhere).

**Nuclear plugin registry gap list:** `/home/jani/workspace/nuclear` (the reference checkout used earlier for the History port) had disappeared from disk mid-session; re-cloned fresh from the `upstream` git remote already configured in this repo (`nukeop/nuclear`) rather than working from memory, then found the *actual* live registry Nuclear's marketplace reads from (`NuclearPlayer/plugin-registry` on GitHub, served via jsDelivr) instead of guessing at what's "official." Of its 17 real plugins, one — MediaSession — was ported outright this session (see below); several others (Bandcamp/SoundCloud/Spotify/MusicBrainz) are partially covered from a different angle (import/embed/connect rather than Nuclear's browse-and-play or search-metadata framing); the rest (Discogs, Deezer/ListenBrainz/Bandcamp/SoundCloud dashboards, Last.fm scrobbling, YouTube streaming/playlists, KHInsider, OmniSource, NetEase) aren't ported, several of which may not even be the right fit for a co-op radio platform rather than a general-purpose player — flagged as a product decision, not assumed.

**MediaSession:** the one clean 1:1 port from that gap list — `navigator.mediaSession` had zero usage anywhere, so lock-screen/notification/headset media-key controls (play/pause/prev/next) didn't work at all. Wired into `AudioEngine` (the component that already owns the `<audio>` element and playback lifecycle): action handlers route through the exact same `setStatus`/`next`/`previous` store actions the player bar's own buttons use, metadata and `playbackState` stay in sync with the current track.

**Status:** all of the above is implemented, typechecked, linted, and built clean at each step; pushed to `master` across several commits (auto-deploys to beta.tahti.live via the existing CI workflow). Not click-verified in a live browser this session — no Chrome extension connection and no local Playwright install were available, so verification was static (tsc/eslint/production build/targeted code tracing) rather than an actual rendered page. A large batch of unrelated work from other concurrent sessions (admin moderation consolidation, disco-widgets, a shared `SaveButton` component, catalog/track-listing consistency, live-show recurrence in the `tahti` repo) landed via merges during this stretch — merged cleanly except one real conflict in `deploy/nginx.conf` (a regex-quoting fix from the other session was kept over this session's older version of the same lines).

### 2026-08-26 — tahti-web Storybook, and a design-system compliance sweep (admin/artist/listener)

**Goal:** Two related pieces of work. First, extend the existing `@nuclearplayer/storybook` package (previously only `packages/ui`'s Nuclear player components) to also catalogue every unique UI element in `tahti-web` itself — panels, dialogs, admin/studio chrome, listener-facing widgets — so there's one browsable, authoritative reference for what compliant tahti-web UI looks like, linked from the board-only `/more` page (the closest thing this app has to an "admin menu more page" — it's gated on `user.isBoard && diagnosticsEnabled`, same gate as the rest of this map/diagnostics hub). Second, once that reference existed, run a real compliance sweep — admin, artist/studio, and listener surfaces — checking the actual app against it, and log what doesn't comply rather than silently drifting further.

**Storybook extension:** `packages/storybook/.storybook/main.ts` gained a `@tahti-web` Vite alias to `packages/tahti-web/src`, a `staticDirs` entry pointing at `tahti-web/public` (mock fixture assets like avatar SVGs live there), and `define`s for `VITE_FORCE_MOCK=1` plus the `__APP_VERSION__`/`__COMMIT_HASH__`/`__BUILD_TIME__` globals tahti-web's own `vite.config.ts` normally bakes in (`SidebarBuildInfo.tsx` reads them and crashed without a definition). `VITE_FORCE_MOCK=1` means every one of tahti-web's `api/*.ts` fetchers short-circuits to its own realistic fixture data with zero network calls — see `api/mode.ts` — so self-fetching admin/studio views render real-looking content for free, no per-story mocking needed. New shared decorators in `packages/storybook/src/tahti-web/_lib/decorators.tsx`: `withTahtiRouter(path)` (a throwaway single-route TanStack Router context for anything using `<Link>`/router hooks) and `withMockAuth(user)` (seeds `useAuthStore` with one of three ready-made `MOCK_USERS` — board/artist/listener — for gated components like `AdminGate`/`StudioGate`).

**Coverage:** 93 component/view titles, 278 total story entries (216 non-docs stories), across every file in `tahti-web/src/components/` and `tahti-web/src/views/admin/` — including the hard cases (Three.js `ChannelVisualizer`, canvas `WaveformCanvas`/`WaveformMinimap`, the `AudioEngine` side-effect component, `AppShell`'s full router-driven shell). Verified two ways: a full `pnpm build` (clean), and a headless Playwright sweep loading all 216 non-docs stories and checking for console/page errors — 214 clean, 2 with benign expected warnings (`AudioEngine`'s idle story genuinely tries a live HLS URL and hits CORS offline; `ListenerWidgetsSection`'s embed story 404s on an external thumbnail offline). Both noted in-story, not bugs.

**Linked from `/more`:** new "Design system" `StudioPanel` section (`MoreView.tsx`, anchored `#design-system`, added to the page's own top nav) with an `Open Storybook →` button to `http://localhost:6006` (`pnpm storybook`) — not deployed anywhere, so the link only resolves when someone has it running locally alongside the app, same as every other dev-only surface on this page.

**Compliance sweep — three parallel audits, admin/artist-studio/listener, findings not yet fixed:**

**Admin** (`views/admin/**`) — 6 findings, mostly clean. `AdminFinancialView.tsx:88,180` and `AdminLogsView.tsx:64` use raw `text-red-400`/`text-green-400`/`bg-red-500` Tailwind palette colors instead of the semantic `text-accent-red`/`text-accent-green` tokens (breaks theming across light/dark/tahti-dark — compliant sibling: `AdminStorageView.tsx:317`). `AdminUsersView.tsx:363,368` hand-rolls role/suspended pills as raw `<span>` instead of `Badge variant="pill"` (doesn't even import `Badge`). `AdminRadioStationSuggestionsView.tsx:95-97` and `moderation/tabs/RadioSubmissionsTab.tsx:215-217` render the same `PENDING/APPROVED/REJECTED` status as plain text instead of a `Badge` — notable because the sibling `BetaTab.tsx` already has a `statusBadge()` helper for the identical enum one file over. `AdminLogsView.tsx:58,68` leaks the literal internal hostname "vimage6" into board-facing copy — the exact class of implementation detail past sweeps have stripped elsewhere.

**Artist/studio** (`views/studio/**`, `views/settings/**`) — 6 findings (one systemic, ~15 files). `StudioArchiveItemView.tsx:491-524` and `TrackEditDialog.tsx:252-280` hand-roll a `role="tablist"` tab widget instead of `@nuclearplayer/ui`'s `Tabs` (already used correctly for the same pattern in `StudioModerationView`/`StudioEventsView`). `api/revenue.ts:234-235,264,270` returns literal strings like `"Mock Connect onboard complete — payments ready."` that get displayed verbatim to the artist in `StudioRevenueView.tsx`/`SettingsPanels.tsx` — this file was missed by the earlier mock-jargon cleanup pass. `StudioGoLiveView.tsx:308-313` hand-rolls channel-state coloring instead of `Badge` (sibling `StudioDistributionView.tsx:13` does it right). `StudioTrackInsightsView.tsx:56-58` hand-copies `StudioPageHeader`'s exact markup instead of using the component. `ChannelLayersMenu.tsx:176-194`'s Hide/Remove row actions are raw styled `<button>` instead of `Button size="icon" variant="text"`. Systemic: essentially every view under `views/studio/` renders a bare `<p>Loading…</p>` instead of `PageStates.tsx`'s `PageLoading` — the fan-facing surface and even in-scope `ReleasesPanel.tsx` already use it correctly, but zero studio views were ever migrated onto it.

**Listener** (top-level `views/*.tsx`, excluding admin/studio/settings/legal) — 9 finding categories, ~40 instances, across 13 files; the largest of the three. One real bug, not just a style gap: `ChatView.tsx:6,15` unconditionally calls `mockDirectory()` for its channel-suggestion links instead of the real `fetchDirectory()` API already used correctly elsewhere — every real user sees fabricated channel slugs, not gated behind `VITE_FORCE_MOCK` like `SourcesView.tsx`'s legitimate fallback. Ten-plus views (`ChannelView`, `ArtistView`, `GovernanceView`, `FeatureRequestsView`, `TransparencyView`, `TransparencyMethodologyView`, `HelpView`, `SubscribeView`, `SmartLinkView`, `OnboardingView`) render a raw `<h1>` with no `PageHeader` import at all. Several (`MyCollectionsView`, `GovernanceView`, `FeatureRequestsView`, `VenuesView`, `FeedView`, `RadioView`) use ad-hoc bordered `<li>` rows instead of the `divide-y` pattern (`ArtistView.tsx` is inconsistent with itself — `CardGrid` in one place, bordered `<li>` in another). `ArtistGalleryPanel.tsx` has 4-5 icon-only gallery actions as raw unstyled `<button>` instead of `Button size="icon-sm"`. `FanSubscriptionStats.tsx`, `SupportContactForm.tsx`, and `ArtistGalleryPanel.tsx` mix in `text-red-400`/hand-rolled pills instead of the semantic token/`Badge`. A dozen views show ad-hoc `<p>Loading X…</p>`/bare "not found" text instead of `PageLoading`/`EmptyState` (`VenueDetailView.tsx:63-73` is the compliant sibling already in the same folder).

**Not flagged (checked and found legitimate):** raw hex in `ChannelDesigner`/`ChannelVisualizer`/`TrackExportPanel` is real channel-branding/brand-color data, not app chrome; raw `<button>` in tab/chip nav widgets (`InPageNav`, `StudioNav`, `AdminNav`) is the established correct pattern, not a deviation; the fixes already shipped in the 2026-08-25 "UX consistency sweep" (`StudioDistributionView`, `StudioVenuesView`, `StudioChannelView`, `AdminNewsView`, `StudioGoLiveView`'s `×` glyph) hold, no regressions found.

**Total: ~21 finding categories / ~55+ individual instances across admin/artist/listener, none fixed in this pass** — logged here as the punch list for the next page-by-page slice, same convention as every other row in this file. `packages/tahti-web/AGENTS.md` gained a standing instruction (below) to check new/changed UI against the Storybook catalogue going forward, so this kind of drift gets caught before merge instead of accumulating for another sweep.

**Status:** Storybook extension implemented and verified (build + full headless render sweep, both clean); `/more` link implemented, typechecked, and linted clean. The compliance findings above are documented only — not fixed — per the scope of this pass. Not click-verified in a live browser (no Chrome extension connection this session); verification was the build/lint/typecheck/headless-Playwright chain described above.

### 2026-08-27 — Track-row icon fixes, Recently played → Library, Add-ons reorg, theme editor, and 9 worklog slices closed

**Goal:** Several independent pieces landed in one session. First, three UI requests: fix the queue-button/play-button overlap on track-row thumbnails, move "Recently played" from the Listen page to the Library dashboard, and fold the separate Settings → Widgets section into Settings → Add-ons (renamed from Plugin store) as four new categories. Then, per explicit request, close out 9 of the findings logged in the 2026-08-26 compliance-sweep entry above, in three batches of three, using the real cataloged components rather than one-off fixes. Also added a theme editor (previously JSON-paste-only) and updated `AGENTS.md` with the now-established "widgets configure from Add-ons" convention.

**Track-row icons (`@nuclearplayer/ui`, affects every `TrackTable` with a thumbnail — Listen, Library, Studio, anywhere):** the queue button used to render as a top-right overlay on the 48px thumbnail, stacked on top of the centered play button — `ThumbnailCell.tsx` no longer passes `onQueue` to `MediaArtwork`; `ActionsCell.tsx`'s queue button (previously suppressed whenever a thumbnail was shown) now always renders in the actions column, immediately next to the favorite heart. The thumbnail's play button switched from a solid `variant="default"` circle to `variant="text"` (transparent, white icon, no shadow) at `size="thumb"` specifically — `md`/`lg`/`fill` contexts (channel/artist hero art) keep the solid button.

**Recently played → Library dashboard:** removed from `ListenView.tsx` (was signed-in-only, at the top of Listen); added to `MyDiscographyView.tsx` (the `/library` landing tab) for every signed-in user, ahead of "All sounds." Previously, a signed-in listener with no channel landed on `/library` to a bare "No sounds yet — Open Studio" empty state and nothing else; that gate now only covers "All sounds" (the artist's own archive), not the whole page.

**Settings → Widgets folded into Settings → Add-ons:** `content/pluginStoreCategories.ts` gained four categories — `radio` (internet radio stations + suggest-a-station form), `embed` (SoundCloud/YouTube embeds), `discovery` (Listen-page disco-widgets), `channel` (channel/artist-page disco-widgets) — ported into `PluginStorePanel.tsx` verbatim from the old `WidgetsPanel` (no behavior change), which is then deleted from `SettingsPanels.tsx` along with its nav entry in `settingsNav.ts`. `plugin-store` replaces `widgets` in `PUBLIC_SETTINGS_SECTION_IDS` so anonymous access is preserved. `DiscoWidgetManagerPanel`'s `description` prop became optional (the category body already shows one above it — no more duplicate text). `AGENTS.md` gained a new section: per-page widgets configure from Add-ons as one category per concern, not a separate settings section; split a category into its own sub-tabs if it has enough to configure.

**Theme editor:** new `components/ThemeEditor.tsx` — a curated set of CSS-variable fields (core colors + the 7 accents), live-previewed via `@nuclearplayer/themes`' `applyAdvancedTheme` on every keystroke (restores the actually-active theme on unmount), saved via the existing `importCustomTheme` store action. Blank fields are left out of the saved theme entirely (partial overrides, inheriting the base palette), rather than baking in every field. `ThemesPanel` in `SettingsPanels.tsx` restructured from one long scroll into three `Tabs`: **Browse** (mode toggle + built-in/custom theme grids, unchanged), **Editor** (new), **Import JSON** (the existing paste-a-theme textarea, moved as-is). Saving from the editor lands the theme in the same `customThemes` store state the Browse tab's "Your imported themes" grid already reads from, and that grid's existing per-theme "Remove" button already covers deleting an editor-created theme — both requested explicitly, both already true of the existing store wiring, no extra code needed.

**9 compliance-sweep slices closed (batches of 3, admin → artist/studio → listener), all against the 2026-08-26 audit findings:**

- **Admin (3):** `AdminFinancialView.tsx`/`AdminLogsView.tsx`'s raw `text-red-400`/`text-green-400`/`bg-red-500` → `text-accent-red`/`text-accent-green` tokens, plus `AdminLogsView`'s "vimage6" hostname leak stripped from board-facing copy. `AdminUsersView.tsx`'s hand-rolled role/suspended `<span>` pills → `Badge variant="pill"`. `AdminRadioStationSuggestionsView.tsx` and `moderation/tabs/RadioSubmissionsTab.tsx` gained a `statusBadge()` helper (mirroring `BetaTab.tsx`'s existing one for the identical `PENDING/APPROVED/REJECTED` enum) and now render a `Badge` instead of plain uppercase text.
- **Artist/studio (3):** `StudioArchiveItemView.tsx` and `TrackEditDialog.tsx`'s hand-rolled `role="tablist"` bars replaced with `@nuclearplayer/ui`'s `Tabs` (items-array mode) — `TrackEditDialog`'s `TABS` metadata array simplified to a plain `TAB_ORDER` id list once its label/icon fields became redundant with the new inline tab labels. `api/revenue.ts`'s "Mock Connect onboard complete", "Mock Connect onboard updated", "Complete mock onboarding first", and "Mock Stripe portal for X — no redirect offline" strings reworded to plain artist-facing copy (the last one keeps the real "nothing will happen, this is a demo" caveat, just without naming Stripe/mock internals). The systemic "bare `<p>Loading…</p>`" pattern across every `views/studio/*` file (24 files total, 5 more than the original audit found — `StudioProEditorView`, `StudioEventsView`, `StudioStatsDetailView`, `StudioModerationView` ×2, `StudioEditorProjectView`) replaced with `PageStates.tsx`'s `PageLoading`.
- **Listener (3):** `ChatView.tsx` — the one real bug in the sweep — was calling `mockDirectory()` unconditionally for its channel-suggestion links instead of the real `fetchDirectory()` API, so every real user (not just `VITE_FORCE_MOCK` sessions) saw fabricated channel slugs; now fetches for real, async, same as `ListenView.tsx`. Raw `<h1>` → `PageHeader` across 10 files (`ChannelView`, `ArtistView`, `GovernanceView`, `FeatureRequestsView`, `TransparencyView`, `TransparencyMethodologyView`, `HelpView` ×2, `SubscribeView`, `SmartLinkView`, `OnboardingView`). Bordered-`<li>` rows → the `divide-y` container pattern across 7 files, 9 list spots (`MyCollectionsView`, `ArtistView`, `GovernanceView` ×2, `FeatureRequestsView` ×2, `VenuesView`, `FeedView`, `RadioView` ×2 — `RadioView`'s "now playing" row highlight switched from a full colored border to a `border-l-4` accent border, since a full border no longer fits inside a shared-border `divide-y` list).

**Not touched, deliberately:** the remaining ~12 finding categories from the 2026-08-26 audit not covered by these 9 slices (e.g. `ChannelLayersMenu.tsx`'s raw icon buttons, `StudioTrackInsightsView.tsx`'s duplicated `StudioPageHeader` markup, `StudioGoLiveView.tsx`'s hand-rolled channel-state color, `FanSubscriptionStats.tsx`'s hand-rolled pill) — still open, next slices whenever picked back up.

**Status:** implemented; `tsc --noEmit`, `eslint`, and the full `vitest` suite (179/179) are clean for every batch, checked incrementally as each landed rather than once at the end. The two systemic sweeps (studio Loading→PageLoading, listener h1/li fixes) were done by parallel subagents working from this same audit's file lists, each independently typechecked/linted before merging back. Not click-verified in a live browser this session.

### 2026-08-27 — Next 9 compliance-sweep slices

**Goal:** Continue the remaining design-system punch list in three batches of three, committing and pushing after each batch.

**Batch 1:** `ChannelLayersMenu` hide/remove actions now use shared icon buttons; `StudioTrackInsightsView` uses `StudioPageHeader`; `StudioGoLiveView` uses semantic channel-state badges.

**Batch 2:** `FanSubscriptionStats` uses semantic payout badges; `ArtistGalleryPanel` uses shared icon actions and semantic error color; `VenueDetailView` uses `PageLoading`.

**Batch 3:** `ChannelView`, `ArtistView`, and `VenuesView` use shared loading and empty states.

**Status:** implemented; all three batches passed tahti-web type-check, lint, and diff checks. Pushed as three commits to `master`.

### 2026-08-27 — Another 9 loading and theme-token slices

**Goal:** Continue the remaining design-system cleanup in three batches of three, committing and pushing after each batch.

**Batch 1:** `GovernanceView`, `ChannelDesigner`, and `DiscoWidgetManagerPanel` now use shared loading states.

**Batch 2:** `ChannelDesigner`, `AppTopNav`, and `ScreenAtlas` now use semantic warning/error colors.

**Batch 3:** `TrackEditDialog`, `AddToPlaylistPanel`, and `AccountView` now use shared loading states.

**Status:** implemented; all three batches passed tahti-web type-check, lint, and diff checks. Pushed as three commits to `master`.

### 2026-08-27 — Another 9 cleanup slices

**Goal:** Continue the remaining design-system cleanup in three batches of three, committing and pushing after each batch.

**Batch 1:** `FeatureRequestsView`, `TransparencyView`, and `EmbedViews` now use shared loading/empty states.

**Batch 2:** `StudioArchiveItemView`, `StudioProEditorView`, and `VenueRegisterView` now use semantic error colors.

**Batch 3:** `ForgotPasswordView`, `ResetPasswordView`, and `SetupPasswordView` now use semantic success/error colors.

**Status:** implemented; all three batches passed tahti-web type-check, lint, and diff checks. Pushed as three commits to `master`.

### 2026-08-27 — Another 9 compliance-sweep slices

**Goal:** Continue the remaining design-system cleanup in three batches of three, committing and pushing after each batch.

**Batch 1:** `CollectionView`, `SubscribeView`, and `SmartLinkView` now use shared loading and empty states.

**Batch 2:** `DiscoverView` and all `VenueRegisterView` states now use `PageHeader`; `SecurityTotpPanel` uses the semantic error token.

**Batch 3:** `SupportContactForm`, the remaining `ArtistGalleryPanel` error path, and `StudioGoLiveView` status errors now use semantic accent colors.

**Status:** implemented; all three batches passed tahti-web type-check, lint, and diff checks. Pushed as three commits to `master`.
