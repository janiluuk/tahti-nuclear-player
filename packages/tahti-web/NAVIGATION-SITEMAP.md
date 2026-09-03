# Tahti Player navigation sitemap

Updated 2026-09-03 from `src/router.tsx`, `AppShell.tsx`, `StudioNav.tsx`,
`AdminNav.tsx`, and `MobileChrome.tsx`. This is the navigation audit source of
truth for the Nuclear client. Persistent chrome is listed separately from
routes that exist but are only reached contextually, so an orphan is not
mistaken for a missing feature.

## Persistent chrome (what a user can click)

| Audience | Chrome entry | Where | Lands on |
| --- | --- | --- | --- |
| Everyone | Listen | Desktop sidebar, mobile drawer, mobile bottom | `/` |
| Everyone | Radio | Desktop sidebar, mobile drawer, mobile bottom | `/radio` |
| Everyone | Discover | Desktop sidebar, mobile drawer, mobile bottom | `/discover` |
| Everyone | Favorites | Desktop sidebar, mobile drawer | `/listen/favorites` |
| Everyone | Help center | Desktop sidebar (with Settings), mobile drawer | `/help` |
| Everyone | Settings | Desktop sidebar / mobile drawer (opens modal) | `ConnectedSettingsModal`; bookmarkable `/settings/$section` |
| Signed in | Library | Studio horizontal tab + mobile bottom | `/library` |
| Signed in | Studio | Desktop sidebar, mobile drawer, mobile bottom | `/studio` |
| Signed in | Perform | Studio primary (`StudioMainNavItems`) | `/studio/go-live` |
| Board | Admin | Desktop sidebar, mobile drawer (when diagnostics enabled) | `/admin` |

Studio section menus (`StudioNav` submenu):

- Studio: Overview, Branding, Stats, Governance, Posts, Audience, Library, Sounds, Collections, Releases, Upload, Editor
- Perform: Go live, Schedule, Events, Shows, Multicast, Channel, Radio

Admin section menus (`AdminNav`): Dashboard, Logs, Moderation, Users,
Content, Radio, News, Streams, Venues, Top lists, Announcements, Storage,
Artwork presets, Financial, Governance, Annual reports, Grants, AGM, Disco
widgets, Status, Vendors, i18n, Tahti Selects, Orphan pages.

Mobile bottom nav is Listen / Radio / Discover / Library / Studio only.
Help and Settings are drawer-only on phones. Favorites is not on the
bottom bar.

## Routes those chrome entries cover

| Audience | Navigation entry | Routes covered | Notes |
| --- | --- | --- | --- |
| Everyone | Listen | `/`, `/listen`, `/channel/$slug`, `/u/$username`, `/u/$username/c/$slug`, `/r/$slug`, `/t/$id` | Public playback destinations. `/feed` and `/listen/feed` / `/listen/history` are contextual from Listen, not chrome items. |
| Everyone | Radio | `/radio`, `/radio/show/$channelSlug` | `/schedule` is **not** a Radio chrome item (see orphans). |
| Everyone | Discover | `/discover` | |
| Everyone | Favorites | `/listen/favorites`, `/library/favorites`, `/favorites` | Aliases share the same surface. |
| Everyone | Help | `/help`, `/help/$slug` | Sidebar / drawer. Articles also reach `/status`, `/news`, `/whats-new`, legal pages, and `/transparency`. |
| Signed in | Library | `/library`, `/library/sounds`, `/library/collections` (+ `?tab=` recordings/media/stash/embeds), `/library/upload`, `/studio/releases`, `/studio/editor` | Studio horizontal tabs. `/library*` routes stay. `/library/recordings` and `/library/media` alias into collections tabs. Mobile bottom nav still has Library. |
| Artist | Studio | `/studio`, `/studio/branding`, `/studio/stats`, `/studio/governance`, `/studio/updates`, `/studio/revenue`, `/library*` | Studio stays selected on Library routes. |
| Artist | Perform | `/studio/go-live`, `/studio/schedule`, `/studio/events`, `/studio/events/new`, `/studio/shows`, `/studio/shows/$id`, `/studio/channel` | Multicast/Radio are channel query tabs. |
| Signed in | Settings | `/settings`, `/settings/$section`, `/account`, `/onboarding` | Modal + bookmarkable sections. `/themes` redirects here. `/sources` and `/sources/$id` redirect to Add-ons → Import. |
| Board | Admin | `/admin`, `/admin/logs`, `/admin/moderation` (+ `$tab`), `/admin/users`, `/admin/content`, `/admin/radio`, `/admin/news`, `/admin/streams`, `/admin/venues`, `/admin/top-lists`, `/admin/announcements`, `/admin/storage`, `/admin/artwork-presets`, `/admin/financial`, `/admin/governance`, `/admin/reports`, `/admin/grants`, `/admin/agm`, `/admin/disco-widgets`, `/admin/status`, `/admin/vendors`, `/admin/i18n`, `/admin/tahti-selects`, `/admin/orphan-pages` | Queue/detail routes stay contextual. |

## Intentional deep links and aliases

These routes are real but should not become extra top-level navigation items:

- `/chat`, `/chat/$slug`, `/feed`, `/listen/feed`, and `/listen/history` are
  contextual listening/community destinations.
- `/subscribe/$username`, `/u/$username/subscribe`, `/u/$username/green-room`,
  and `/venues/register` are action pages reached from their parent surface.
- `/embed/*` routes are embeddable documents, not app navigation.
- `/login`, `/join`, `/apply`, `/signup`, `/signup/payment`, `/verify`,
  `/forgot-password`, `/reset-password`, and `/setup-password` are
  authentication flows.
- `/dashboard/*`, `/c/$slug`, `/favorites`, `/history`, `/themes`,
  `/sources/*`, and `/more` are compatibility or redirect routes.
- Admin aliases that redirect into an existing menu page: `/admin/activity` →
  logs; `/admin/beta`, `/admin/radio-submissions`, `/admin/support`,
  `/admin/content-reports`, `/admin/feature-requests`, `/admin/missed-shows`
  → moderation tabs; `/admin/files` → storage `?tab=files`;
  `/admin/radio-station-suggestions` → orphan-pages tab.
- `/studio/archive*` and `/studio/upload` redirect into sounds / library
  upload. `/studio/venues` redirects to `/admin/venues`. `/studio/moderation`
  redirects to Settings → Channel. `/studio/playlists*` aliases collections.

## Orphan pages (production, content-bearing, no chrome item)

Audited 2026-09-03 against `AppShell` / `StudioNav` / `AdminNav` /
`MobileChrome` and every `<Link>` / `navigate({ to })` in `src/` excluding
`mapScreens.ts` / `flowDiagrams.ts` / `MoreView` diagnostics.

| Route | Inbound from production UI? | Notes |
| --- | --- | --- |
| `/venues` | Only venue detail, venue register, and the diagnostics atlas | Sitemap previously listed it under Listen chrome. It is **not** in the sidebar, drawer, or mobile bottom nav. |
| `/schedule` | Booking calendar + schedule dialog only | Public programme page. Radio chrome does not link it. Distinct from `/studio/schedule`. Listed as a compatibility route historically; the page is real. |
| `/library/smartlinks` | None (direct URL / atlas only) | `LibraryView` can render the tab, but the Library submenu and collections tab strip omit it. |
| `/studio/distribution` | Studio Releases row + export add-on deep links | Not a StudioNav submenu item. `SECTION_PREFIXES` still highlights Library → Releases. |
| `/studio/stash` | Library collections tab `?tab=stash` (embedded) | Dedicated `/studio/stash` has no submenu entry. Direct visits still highlight Library via `SECTION_PREFIXES`. |
| `/jam/$code` | None in app chrome | Join-by-code surface; atlas-only besides the route itself. |

Still gathered under **`/admin/orphan-pages`** (Admin → Manage): radio
station suggestions. `/admin/map` remains diagnostics-only (board QA), same
as `/more`.

Dead / not a content orphan:

- `/studio/setup-channel` — redirect helper, nothing links the exact path.
- `StudioVenuesView.tsx` — unmounted; `/studio/venues` redirects to admin.

## Navigation gaps found

See [NAVIGATION-GAPS.md](NAVIGATION-GAPS.md) for the chrome-vs-inbound
mapping (2026-09-03) and the earlier atlas-diagram findings.

- No production navigation points to the diagnostics-only Tahti map (`/more`,
  `/admin/map`).
- Studio detail pages and Admin queue/detail pages are intentionally
  contextual.
- Favorites live at `/listen/favorites` (sidebar). `/library/favorites`
  still redirects there. Library no longer has a left-side favorites panel.
- Public utility pages (`/status`, `/transparency*`, legal, `/whats-new`,
  `/news`) are reached from Help or parent pages, not from Listen chrome.
- Member governance is Settings → Account → Governance (`/governance`), not
  a listener sidebar item. Artists use Studio → Governance; board uses Admin
  → Governance / AGM.

The sitemap deliberately excludes `src/content/mapScreens.ts` internal
anchors: those links navigate within the diagnostics atlas and are not
application navigation.
