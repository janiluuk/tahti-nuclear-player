# Tahti Player navigation sitemap

Updated 2026-09-01 from `src/router.tsx`, `AppShell.tsx`, `StudioNav.tsx`,
`AdminNav.tsx`, and `MobileChrome.tsx`. This is the navigation audit source of
truth for the Nuclear client; route aliases and diagnostics are listed so an
orphan is not mistaken for a missing feature.

## User-facing navigation

| Audience | Navigation entry | Routes covered | Notes |
| --- | --- | --- | --- |
| Everyone | Listen | `/`, `/listen`, `/channel/$slug`, `/u/$username`, `/u/$username/c/$slug`, `/r/$slug`, `/t/$id`, `/discover`, `/radio`, `/venues`, `/v/$slug` | Public discovery and playback |
| Everyone | Radio | `/radio`, `/radio/show/$channelSlug`, `/schedule` | Schedule is reached from the radio surface |
| Signed in | Library | `/library`, `/library/sounds`, `/library/collections`, `/library/favorites`, `/library/history`, `/library/messages`, `/library/media`, `/library/recordings`, `/library/releases`, `/library/smartlinks`, `/library/upload`, `/messages`, `/messages/$id` | Some legacy aliases redirect into the same library surfaces |
| Artist | Studio | `/studio`, `/studio/stats`, `/studio/governance`, `/studio/updates`, `/studio/distribution`, `/studio/revenue`, `/studio/go-live`, `/studio/schedule`, `/studio/events`, `/studio/events/new`, `/studio/shows`, `/studio/shows/$id`, `/studio/channel`, `/studio/releases`, `/studio/collections`, `/studio/playlists`, `/studio/archive`, `/studio/upload`, `/studio/editor`, `/studio/recordings`, `/studio/branding`, `/studio/stash`, `/studio/mastering/$id` | Persistent Studio navigation owns these pages; detail routes are contextual |
| Signed in | Settings | `/settings`, `/settings/$section`, `/account`, `/onboarding` | Account, artist, channel, broadcast, notifications, themes, and connections |
| Board | Admin | `/admin`, `/admin/logs`, `/admin/moderation`, `/admin/users`, `/admin/content`, `/admin/radio`, `/admin/news`, `/admin/streams`, `/admin/venues`, `/admin/top-lists`, `/admin/announcements`, `/admin/storage`, `/admin/financial`, `/admin/governance`, `/admin/grants`, `/admin/agm`, `/admin/missed-shows`, `/admin/disco-widgets`, `/admin/status`, `/admin/vendors`, `/admin/i18n`, `/admin/tahti-selects` | Admin section navigation owns these pages; queue/detail routes remain contextual |

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
