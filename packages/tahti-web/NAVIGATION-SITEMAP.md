# Tahti Player navigation sitemap

Updated 2026-09-02 from `src/router.tsx`, `AppShell.tsx`, `StudioNav.tsx`,
`AdminNav.tsx`, and `MobileChrome.tsx`. This is the navigation audit source of
truth for the Nuclear client; route aliases and diagnostics are listed so an
orphan is not mistaken for a missing feature.

## User-facing navigation

| Audience | Navigation entry | Routes covered | Notes |
| --- | --- | --- | --- |
| Everyone | Listen | `/`, `/listen`, `/channel/$slug`, `/u/$username`, `/u/$username/c/$slug`, `/r/$slug`, `/t/$id`, `/discover`, `/radio`, `/venues`, `/v/$slug` | Public discovery and playback |
| Everyone | Radio | `/radio`, `/radio/show/$channelSlug`, `/schedule` | Schedule is reached from the radio surface |
| Signed in | Library | `/library`, `/library/sounds`, `/library/collections`, `/library/favorites`, `/library/history`, `/library/messages`, `/library/media`, `/library/recordings`, `/library/releases`, `/library/smartlinks`, `/library/upload`, `/messages`, `/messages/$id` | Some legacy aliases redirect into the same library surfaces |
| Artist | Studio | `/studio`, `/studio/stats`, `/studio/governance`, `/studio/updates`, `/studio/distribution`, `/studio/revenue`, `/studio/go-live`, `/studio/schedule`, `/studio/events`, `/studio/events/new`, `/studio/shows`, `/studio/shows/$id`, `/studio/channel`, `/studio/releases`, `/studio/collections`, `/studio/playlists`, `/studio/sounds`, `/studio/editor`, `/studio/recordings`, `/studio/branding`, `/studio/stash`, `/studio/mastering/$id` | Persistent Studio navigation owns these pages; detail routes are contextual. `/studio/archive`, `/studio/archive/$id`, `/studio/archive/$id/editor`, and `/studio/upload` are legacy aliases redirecting into their `/studio/sounds`/`/library/upload` equivalents (Archive was renamed to Sounds) |
| Signed in | Settings | `/settings`, `/settings/$section`, `/account`, `/onboarding` | Account, artist, channel, broadcast, notifications, themes, and connections |
| Board | Admin | `/admin`, `/admin/logs`, `/admin/moderation`, `/admin/users`, `/admin/content`, `/admin/radio`, `/admin/news`, `/admin/streams`, `/admin/venues`, `/admin/top-lists`, `/admin/announcements`, `/admin/storage`, `/admin/artwork-presets`, `/admin/financial`, `/admin/governance`, `/admin/reports`, `/admin/grants`, `/admin/agm`, `/admin/disco-widgets`, `/admin/status`, `/admin/vendors`, `/admin/i18n`, `/admin/tahti-selects`, `/admin/orphan-pages` | Admin section navigation owns these pages; queue/detail routes remain contextual. `/admin/missed-shows` is now a legacy alias redirecting into `/admin/moderation/$tab` (tab: missed-shows) |

## Intentional deep links and aliases

These routes are real but should not become extra top-level navigation items:

- `/chat`, `/chat/$slug`, `/feed`, `/listen/feed`, and `/listen/history` are
  contextual listening/community destinations.
- `/subscribe/$username`, `/u/$username/subscribe`, `/u/$username/green-room`,
  and `/venues/register` are action pages reached from their parent surface.
- `/embed/*` routes are embeddable documents, not app navigation.
- `/login`, `/join`, `/signup`, `/verify`, `/forgot-password`,
  `/reset-password`, and `/setup-password` are authentication flows.
- `/dashboard/*`, `/c/$slug`, `/favorites`, `/history`, `/schedule`, `/themes`,
  `/sources/*`, and `/more` are compatibility or redirect routes.

## Orphan pages

Full studio/admin/library route audit against `AdminNav.tsx`, `StudioNav.tsx`,
and every `<Link>`/`navigate()` call in `src/` (2026-09-02). One real,
content-bearing page had no menu entry and no in-app link anywhere:
`/admin/radio-station-suggestions` (`AdminRadioStationSuggestionsView`) — only
referenced from `src/api/admin.ts`'s HTTP calls, never from a nav item or a
`<Link>`. It's now `RadioStationSuggestionsTab`, gathered with any future
finds under **`/admin/orphan-pages`** (`AdminOrphanPagesView`, tabbed —
addressable per-tab at `/admin/orphan-pages/$tab`, same convention as
`/admin/moderation/$tab`). The old URL redirects into its tab. `/admin/orphan-pages`
itself is in `AdminNav`'s "Manage" section and linked from the Help Center's
"Admin guide" article so the gathering page doesn't become an orphan itself.

Two more routes were found unreachable but are not content pages, so they
were left as-is rather than added to the tabs:
- `/studio/setup-channel` (`StudioSetupChannelRedirect`) — a pure redirect
  component (opens the channel-setup modal, then navigates to `/studio`);
  nothing links to this exact path (the old-prod-URL alias for
  `setup-channel` in `prodPathRedirects.ts` points at `/studio/channel?tab=setup`
  instead). Dead route; candidate for removal in a follow-up.
- `src/views/studio/StudioVenuesView.tsx` — a whole component with no route
  pointing at it at all (`/studio/venues` redirects straight to
  `/admin/venues`). Dead code, not a routable orphan; flagged for cleanup,
  not touched here.

## Navigation gaps found

- No production navigation points to the diagnostics-only Tahti map. The map
  route remains available at `/more` only when diagnostics are enabled, and its
  board-only mirror remains at `/admin/map` for direct QA access.
- Studio detail pages and Admin queue/detail pages are intentionally contextual;
  adding every detail route to a persistent menu would duplicate their parent
  section.
- `/library/favorites` now has its own left-side panel with Tracks, Playlists,
  Channels, and Artists tabs. Playlist/artist entries can show a New marker
  until the user opens them; timestamps are stored with the local favourite.
- All public utility pages (`/help`, `/help/$slug`, `/status`, `/transparency`,
  `/transparency/methodology`, legal pages, and `/whats-new`) are reachable from
  the public shell or their parent page and contain no Tahti-map breadcrumb.

The sitemap deliberately excludes `src/content/mapScreens.ts`'s internal
anchors: those links navigate within the diagnostics atlas itself and are not
application navigation.
