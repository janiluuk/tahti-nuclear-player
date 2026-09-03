# Conversion queue — artist + admin gaps (Nuclear)

> **Archived 2026-09-03.** This file is no longer the live status tracker.
> Use **[FEATURES.md](./FEATURES.md)** and **[WORKPLAN.md](./WORKPLAN.md)** instead.
> The admin A1–A12 table below is stale — beta ships 22 board pages (`FEATURES.md`).

Historical queue for one-row-at-a-time ports. Kept for grep archaeology only.

**Next up (historical):** #11 Stats detail (`partial` — summary only, no drill-down).

## Artist / studio — priority

| # | Feature | Prod | Nuclear | Status |
|---|---------|------|---------|--------|
| 1 | Venue register | `/venues/register` | `/venues/register` | **done** (`live-api` + mock) |
| 2 | Membership purchase | `/signup/payment` | `/signup/payment` + Settings Account | **done** (`live-api` + mock) |
| 3 | Password / security + TOTP manage | settings/account | Settings Account (TOTP) | **done** (TOTP; no separate change-password API in prod) |
| 4 | Distribution | `/dashboard/distribution` | `/studio/distribution` | **done** (catalog + Revelator + Spotify profile + royalties; `live-api` + mock) |
| 5 | Tahti Radio slot booking / Shows | `/dashboard/tahti-radio-slots` | `/studio/shows` | `partial` (bookings live; series localStorage) |
| 6 | Channel moderators | `/dashboard/moderate/:slug` | `/studio/moderation` | **done** (delegated mods + chat bans; `live-api` + mock) |
| 7 | Artist venues manage | `/dashboard/venues` | `/studio/venues` | **done** (profile edit + bookings; `live-api` + mock) |
| 8 | Events | `/dashboard/events` | `/studio/events` | **done** (`live-api` + mock) |
| 9 | Studio embeds manager | `/dashboard/embeds` | `/studio/embeds` | **done** (SoundCloud track embeds; `live-api` + mock) |
| 10 | Insights | `/dashboard/insights/:kind/:id` | `/studio/insights/$kind/$id` | **done** (period, plays/downloads, daily chart, countries; `live-api` + mock) |
| 11 | Stats detail | `/dashboard/stats/detail` | `/studio/stats/detail` | **done** (`live-api` + mock) |
| 12 | Stash upload / delete | `/dashboard/stash` | `/studio/stash` | **done** (`live-api` + mock) |
| 13 | Press kit | settings/presskit | Studio → Branding | **done** (gallery upload API) |
| 14 | Green room / members | settings/* | settings sections | `partial` |
| 15 | Mentions / announcements editor | settings/* | settings sections | `partial` |
| 16 | Setup channel wizard | `/dashboard/setup-channel` | link-out | `link-out` |
| 17 | Upload from broadcast + imports | `/dashboard/upload/*` | partial | `partial` |
| 18 | Pro multitrack timeline | `/dashboard/editor` | partial | `partial` |
| 19 | Channel gallery / text-layer | `/dashboard/channel/*` | Edit design partial | `partial` |
| 20 | Listener-only dashboard | `/dashboard` | `/library` | **done** |

## Board admin — queued (historical; see FEATURES.md)

| # | Feature | Prod | Status |
|---|---------|------|--------|
| A1 | Admin shell + dashboard | `/admin`, `/admin/dashboard` | shipped in beta |
| A2 | Users | `/admin/users` | shipped in beta |
| A3 | Streams + controls | `/admin/streams` | shipped in beta |
| A4 | Radio + submissions | `/admin/radio*` | shipped in beta |
| A5 | News / announcements / top-lists / selects | various | shipped in beta |
| A6 | Support | `/admin/support` | shipped in beta |
| A7 | Storage / files | `/admin/storage`, `files` | shipped in beta |
| A8 | Financial | `/admin/financial/*` | shipped in beta |
| A9 | Governance admin | `/admin/governance/*` | shipped in beta |
| A10 | Grants / AGM / beta / vendors | various | shipped in beta |
| A11 | Reports / feature requests / status | various | shipped in beta |
| A12 | Channel archive/programme admin | `/admin/channels/...` | partial / scope-trimmed |

## Shipped elsewhere (not in queue)

Listen, auth, studio core (go-live, archive, upload, releases, collections, schedule, updates, revenue), channel design presets, fan tiers, sources hub, embeds, `/more` map.
