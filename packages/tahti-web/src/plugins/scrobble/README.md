# Scrobble — ListenBrainz

Settings → Add-ons → **Scrobbling**. Submit-listens only — not charts or
dashboards (those stay out of scope / constitutionally blocked).

## Contract

Sibling API owns credentials and the outbound ListenBrainz call:

| Step | Route / behavior |
| --- | --- |
| List | `GET /api/me/integrations` — `listenbrainz` with `scope: SCROBBLE` |
| Install | `POST /api/me/integrations/listenbrainz/install` `{ fields: { userToken } }` — validates via ListenBrainz `GET /1/validate-token`, then encrypts |
| Uninstall | `DELETE /api/me/integrations/listenbrainz` |
| Scrobble | After `POST /api/listen-events` returns `recorded: true` for a signed-in user with ListenBrainz installed, the API fire-and-forgets `submit-listens` |

Full API note: `../tahti/docs/technical/scrobble-plugin-contracts.md` and
`integration-credential-lifecycle.md`.

## Nuclear files

| Path | Role |
| --- | --- |
| `src/api/integrations.ts` | List / install / uninstall client (+ force-mock) |
| `src/plugins/scrobble/ListenBrainzAddonCard.tsx` | Configure dialog (Save and enable / Disconnect) |
| `src/content/pluginStoreCategories.ts` | `scrobbling` category |
| `PluginStorePanel.tsx` | Mounts the card under Scrobbling |

Listen pulse already goes through `postListenEvent` in `AudioEngine` —
no client-side ListenBrainz HTTP. Secrets never return from list.

## Out of scope

- `listenbrainz-dashboard` charts
- Last.fm scrobble (same SCROBBLE scope later)
- OmniSource / Bandcamp–Deezer discovery dashboards
