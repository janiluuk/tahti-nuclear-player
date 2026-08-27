# Tahti production → beta gap mapping

Audit date: 2026-08-27

This maps the public Tahti product described at [tahti.live](https://tahti.live/) to the beta SPA in this package (`beta.tahti.live`). “Partial” means the main path exists but important depth or parity is missing. Admin production details are based on the existing port inventory because those routes require board access and cannot be inspected anonymously.

## Summary

| Area | Beta coverage | Main gaps |
| --- | --- | --- |
| Listener | Broad coverage | Marketing/apply entry points, venue depth, server-side parity for favorites/history, and some legal/about depth |
| Artist | Broad coverage | Pro editor depth, channel design parity, settings/source OAuth depth, and moderator workflow discoverability/verification |
| Admin | Partial | Beta has the core board pages, but not the full production admin surface or several detailed/bulk workflows |

## Listener

| Production capability | Beta route/surface | Status | Gap or parity note |
| --- | --- | --- | --- |
| Listen directory / on-air discovery | `/` (production `/listen`) | Present | Route intentionally differs; directory uses the live channel API. |
| Artist live channel and archive | `/channel/$slug` (production `/c/:slug`) | Present | HLS, archive playback, now-playing state, chat, and visualizer are present. |
| Anonymous listening | Public listener routes | Present | Matches the product principle that listening does not require an account. |
| Channel chat | Channel rail and `/chat/$slug` | Present | REST/WS chat, anonymous hCaptcha join, reactions, and subscriber-only gating are wired. |
| Tahti Radio | `/radio` | Present | Radio playback and current-track presentation are implemented. |
| Artist profiles | `/u/$username` | Present | Includes pinned tracks, catalog, gallery, and profile actions. |
| Collections and smart links | `/u/$username/c/$slug`, `/r/$slug` | Present | Both public surfaces are implemented. |
| Favorites and history | `/library/*` | Partial | Beta uses local persistence/follows; it is not a full production account-backed equivalent. |
| Playlists | Player bar, Music/library tables | Present | Create and add-to-playlist flows are live-API backed. |
| Fan subscriptions | `/subscribe/$username` | Present | Stripe checkout is wired; offline activation is mock-only. |
| Venues | `/venues` | Partial | Listing exists, but the production venue experience has more depth than the beta list. Registration exists at `/venues/register`. |
| Governance and direct messages | `/governance`, `/messages` | Present | Voting/comments and inbox paths are live-API backed. |
| Widgets | Settings → Widgets, listener/channel surfaces | Present | Sandboxed widgets exist; the admin widget catalog remains outside this beta SPA. |
| Help, legal, about, status | `/help`, legal routes, `/status` | Partial | Core pages exist, but legal/about coverage and content depth are not fully equivalent. |
| Marketing home and artist application | Production `/`, `/apply` | Missing | Beta opens in the listener hub and has no equivalent marketing/apply journey. |

## Artist

| Production capability | Beta route/surface | Status | Gap or parity note |
| --- | --- | --- | --- |
| Artist dashboard | `/studio` | Present | Studio shell and section navigation are implemented. |
| Channel setup | `/studio/channel?tab=setup` | Present | Channel provisioning uses the live API. |
| Go Live / browser broadcast | `/studio/go-live` | Present | Broadcast wizard is present; simulator behavior is restricted to mock mode. |
| Multistream RTMP | Go Live → multistream | Present | RTMP target management is included in the live flow. |
| Archive, upload, releases, collections | `/studio/archive`, `/studio/upload`, `/studio/releases`, `/studio/collections` | Present | Upload prepare/complete and album-based collection design are implemented. |
| Pro editor | `/studio/editor` | Partial | Core editor exists, but production-grade multitrack timeline depth is still missing. |
| Schedule, 24/7 rotation, radio shows | `/studio/schedule`, `/studio/channel`, `/studio/shows` | Present | Programme, rotation, bookings, series, and episodes are represented. |
| Stats and detail reporting | `/studio/stats`, `/studio/stats/detail` | Present | Summary and range-detail views exist. |
| Channel design / profile / branding | `/studio/channel`, `/channel/$slug?edit=1` | Partial | Presets, layers, layout, gallery, and press-kit workflows exist; parity with the production designer is not complete. |
| Updates/newsletter | `/studio/updates` | Present | Newsletter/update flow is live-API backed. |
| Revenue and Stripe Connect | `/studio/revenue` | Present | Connect onboarding and portal paths exist; mock mode uses local activation. |
| Distribution | `/studio/distribution` | Present | Catalog, Revelator submission/payment, Spotify profile, and royalty surfaces exist. |
| Stash | `/studio/stash` | Present | Upload/delete and share access are implemented. |
| Channel moderators | `/studio/moderation` | Partial | API and assignment/removal UI exist, but the workflow is not clearly exposed from the current Studio navigation and needs owner-permission and moderator-capability verification. |
| Settings | `/settings` | Partial | Nuclear settings shell exists, but parity/depth across artist, discovery, notification, and account sections is thinner. |
| Source connections / OAuth | `/sources` | Partial | Source hub exists; several providers still have simplified OAuth UX and need production callback verification. |
| Email invites for people without accounts | — | Missing/deferred | Current moderator flow assigns an existing username; there is no invite-token flow for a new user. |

## Admin

| Production capability | Beta route/surface | Status | Gap or parity note |
| --- | --- | --- | --- |
| Board-gated admin shell | `/admin/*` | Present | Access is gated by `user.isBoard`. |
| Dashboard and operational overview | `/admin` | Present | Core overview and shortcuts exist. |
| Activity and container logs | `/admin/logs` | Present | Combined Logs page has separate Activity and Container logs tabs; `/admin/activity` remains a compatibility route. |
| Moderation queues | `/admin/moderation/$tab` | Present | Support, beta, radio submissions, Selects, content reports, and feature requests are consolidated into tabs. |
| Users | `/admin/users` | Partial | User administration exists, but production has more detailed user/support workflows. |
| Radio and station suggestions | `/admin/radio`, `/admin/radio-station-suggestions` | Present | Separate destinations; active-route matching is boundary-safe so they cannot highlight together. |
| News, announcements, streams, status | Corresponding `/admin/*` routes | Present | Core operational pages are ported. |
| Top lists, storage, financial, governance | Corresponding `/admin/*` routes | Partial | Core pages exist, but some production actions are intentionally trimmed. |
| Grants | `/admin/grants` | Partial | Listing/review exists; grant run/preview depth is missing. |
| Storage/files operations | `/admin/storage` | Partial | Storage visibility exists; production bulk file operations are not ported. |
| Financial operations | `/admin/financial` | Partial | Main records exist; payout retry and legacy-member migration workflows are missing. |
| User/support detail pages | — | Missing | Production has deeper detail pages than the beta board surface. |
| Announcement clip/detail workflows | — | Missing | Not included in the beta admin port. |
| Widget catalog administration | Production admin/catalog | Missing from beta | Listener widgets work, but catalog management remains in the production/Next admin surface. |
| Full production admin surface | Production has roughly 35 admin pages; beta has 22 | Partial | Beta covers the main board workflows but is not a complete admin replacement. |

## Recommended implementation order

1. Make `/studio/moderation` a first-class destination in the Studio Manage/Broadcast navigation and add owner-only assignment/removal tests.
2. Close artist depth gaps: pro editor timeline, channel designer parity, settings, and source OAuth callbacks.
3. Close listener entry/content gaps: marketing home/apply, venue depth, legal/about depth, and a deliberate decision on account-backed favorites/history.
4. Prioritize admin detail and bulk workflows: users/support, storage files, financial payout operations, grants run/preview, announcements, and widget catalog management.
5. Repeat a live beta-vs-production route and permission sweep after each batch; retain intentional consolidations such as Admin Logs and Moderation tabs.

## Evidence

- Production product principles and listener/artist capabilities: [How Tahti works](https://tahti.live/how-it-works) and [About Tahti](https://tahti.live/about).
- Beta route/status inventory: [`FEATURES.md`](FEATURES.md).
- Navigation and implementation detail: [`UI-REDESIGN-WORKLOG.md`](UI-REDESIGN-WORKLOG.md) and the route/view files under `src/`.
