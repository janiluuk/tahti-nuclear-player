# Import Sources

Wraps each `SourceDef` in `../../api/sources.ts` (bandcamp, soundcloud,
google-drive, mixcloud, spotify, hearthis, url, upload, stash, radio) with
the one behavior genuinely uniform across all ten: checking whether the
source is connected.

## Contract

```ts
type ImportSourcePlugin = SourceDef & {
  oauthUrl: string | null; // full authorize URL, only for oauth-kind sources
  checkStatus(): Promise<{ data: ConnectionStatus; meta: FetchMeta }>;
};
```

Every source also declares `capabilities` with `connect`, `search`,
`import`, and `playback` flags. The registry test requires every source to
declare all four so a future UI can expose only operations backed by the
provider contract.

`importSourcePlugins: ImportSourcePlugin[]` — every source.
`importSourcePlugin(id)` — look up one by id.

## Why this is a partial extraction — read before extending

This is **deliberately not** a full `start/status/import` plugin system.
The ten sources split into three real kinds that don't share enough shape
to justify one forced interface:

- **oauth** (bandcamp, soundcloud, google-drive, mixcloud) — a real
  connect/disconnect lifecycle. `checkStatus()` covers this.
- **search** (spotify, hearthis) — search-then-add, not "import" in the
  connect sense. No connection state to speak of.
- **tool** (url, radio) — paste-a-link, no connection state at all.

Each source's actual bespoke logic (SoundCloud track listing, Spotify
search, hearthis search+import, Google Drive picker, Bandcamp album
import, OAuth callbacks) stays in `../../api/sources.ts` — it shares that
file's private `requestJson`/mock-fallback plumbing with everything else
there, same reasoning as fingerprinting leaving AcoustID's HTTP calls in
`api/studio.ts`. `SourcesView.tsx` (the actual per-source connect/manage
screen, 700+ lines) still calls `fetchConnectionStatus`/`oauthStartUrl`/
`disconnectIntegration` directly, not through this plugin — rewriting its
live per-source flows without being able to exercise each provider's real
OAuth round-trip is genuine regression risk, deliberately left alone.

See [`../../../PLUGIN-STORE-PLAN.md`](../../../PLUGIN-STORE-PLAN.md) §5
for the full reasoning and what a real split would need — likely three
smaller interfaces (one per kind), not one `ImportSourcePlugin` covering
everything.

## Consumers

`PluginStorePanel.tsx`'s `IMPORT_SERVICE_PLUGINS` derives from
`importSourcePlugins` instead of raw `SOURCE_DEFS`.
