# Export

The list of places a release or track can be pushed out to (Spotify,
Apple Music, Tidal, Deezer, Amazon Music, YouTube Music, Bandcamp,
SoundCloud, Mixcloud, hearthis.at) — a metadata registry with a deep-link,
**not** a behavioral plugin.

## Contract

```ts
type ExportTarget = {
  id: string;
  label: string;
  note: string;
  color: string;
  to: string; // deep-link path
  supportsTracks: boolean;
};
```

`EXPORT_TARGETS: ExportTarget[]` is the whole surface. `to` points either
at `/studio/distribution` (Revelator-delivered DSPs — every one of those
targets goes through the *same* one Revelator submission regardless of
which tile was clicked) or `/sources/:id` (targets reached by connecting
them as a Source instead, e.g. Bandcamp, SoundCloud).

## Why this stops here

There is currently no per-target *behavior* to extract — no
submit/status/webhook contract exists in the API for individual DSPs.
Writing an `ExportProvider` interface (submit/status/webhook) against
nothing to implement it would be an abstraction with no real
implementation behind it, so this extraction is a relocation +
consolidation of the metadata, not a real plugin system yet. See
[`../../../PLUGIN-STORE-PLAN.md`](../../../PLUGIN-STORE-PLAN.md) §4 for
what would need to exist on the API side first.

## Consumers

`PluginStorePanel.tsx`, `TrackExportPanel.tsx`, and `ConnectionsPanel` in
`SettingsPanels.tsx` (the "Export music" section) all import
`EXPORT_TARGETS` from here — no duplicated copies remain.
