# Plugin store — mapping & extraction plan

`Settings > Plugin store` (`src/components/PluginStorePanel.tsx`) is a unified
**browser** across 7 subsystems that already behave like plugins but live
scattered through the main codebase. It does not change where any of them
run — it's a navigation/launcher layer over the existing implementations.
This doc maps where each one lives today and what actually extracting it
into a standalone, removable plugin would take.

See [`docs/PLUGINS.md`](docs/PLUGINS.md) for the contract the three
extractions below follow, and the pattern to use for the remaining four.

Ranked by extraction cost (cheapest first):

## 1. Themes — DONE

- **Lives**: `src/plugins/themes/store.ts` (moved from `src/stores/themeStore.ts`
  unchanged — same public interface). `listBasicThemes()` comes from
  `@nuclearplayer/themes`; custom themes are user-imported JSON in
  `customThemes: Record<string, AdvancedTheme>`.
- **Settings today**: `ThemesPanel` in `SettingsPanels.tsx`. The old
  `src/views/ThemesView.tsx` was found to be dead code (nothing routed to
  it — a stale duplicate of `ThemesPanel` missing the custom-theme
  import/remove UI) and deleted rather than moved.
- **Extraction done**: relocated to `src/plugins/themes/`, all 6 call
  sites updated to the new import path. No behavior change.

## 2. Audio plugins (Pro Editor chain) — second cheapest

- **Lives**: `src/lib/proEditorPlugins.ts` (51 lines, `PLUGIN_META` +
  `ALL_PLUGIN_IDS`) and `src/lib/audioPreviewGraph.ts` (143 lines, builds
  the live Web Audio graph from the user's drag-ordered chain).
- **Settings today**: `src/views/studio/StudioProEditorView.tsx`
  (1173 lines) — the plugin-chain UI (add/remove/reorder + per-plugin
  params) lives inside this one large view, not a separate settings page.
- **Already plugin-shaped**: yes — `PLUGIN_META` is an id→{label,
  description, icon} tile registry, functionally identical in shape to
  `LISTENER_WIDGET_TYPES`. Chain is already reorderable/insertable.
- **What extraction means**: the two lib files (194 lines total, only 1
  importer each) can lift out cleanly as `@tahti/plugin-audio-fx`. The
  hard part isn't the plugin code — it's that its *host UI* is welded
  into `StudioProEditorView.tsx`. Extracting the plugin registry doesn't
  shrink that 1173-line file; a real "audio plugin store" would need a
  generic plugin-chain host component factored out of it first.

## 3. Multicast (RTMP targets) — partially done

- **Lives**: `src/api/broadcast.ts` (578 lines) — `RtmpTarget` CRUD — plus
  the new `src/plugins/multicast/` (`MulticastProvider` type + a typed
  registry of the 8 providers the API actually supports).
- **Settings today**: `StudioGoLiveView.tsx` (multistream section, now
  sourcing its provider dropdown + display labels from the registry) and
  `StreamManagerPanel.tsx` (read-only target list, same registry for
  labels).
- **Done this pass**: the registry itself, built from
  `PROVIDER_RTMP_URLS` in `tahti-org/apps/api/src/routes/me/rtmp-targets.ts`
  (the real source of truth) rather than guessed — which caught a real
  drift bug: the frontend dropdown only offered
  YOUTUBE/TWITCH/KICK/FACEBOOK/CUSTOM while the API has supported TIKTOK,
  MIXCLOUD_LIVE, and INSTAGRAM with no way to pick them in the UI. Fixed.
- **Still open**: `RtmpTarget.provider` on the wire/type is still a plain
  `string`, not typed against `MulticastProvider['id']`, and
  `StudioGoLiveView`'s add-destination form and `StreamManagerPanel`'s
  display are still two separate components reading the same registry
  rather than one shared host UI — de-duplicating those is the remaining
  "real work" this doc originally flagged.

## 4. Export

- **Lives**: `src/lib/exportTargets.ts` (91 lines) — `EXPORT_TARGETS`,
  10 entries, each just `{id, label, note, color, to, supportsTracks}`.
  Real delivery logic is centralized in `StudioDistributionView.tsx`
  (Revelator submission), not per-target.
- **Settings today**: `ConnectionsPanel` in `SettingsPanels.tsx` +
  `StudioDistributionView.tsx`.
- **Already plugin-shaped**: no — it's a flat metadata array with a
  deep-link, not independent implementations. Every DSP goes through the
  same one Revelator call regardless of which box is checked.
- **What extraction means**: there's nothing to extract yet, because
  there's no per-target *behavior* to move — extraction here really means
  designing a real `ExportProvider` interface first (submit/status/
  webhook), which today doesn't exist even inside the main codebase.

## 5. Import (Sources)

- **Lives**: `src/api/sources.ts` (993 lines, largest of the 7) —
  `SOURCE_DEFS` (10 entries) plus the actual OAuth-flow/import-job calls,
  co-located in the same file.
- **Settings today**: `SettingsPanels.tsx` keeps a **second, manually
  synced** copy — `IMPORT_SERVICES` (with a comment admitting it "mirrors
  SOURCE_DEFS ... minus upload/stash/broadcast/radio"). `PluginStorePanel`
  reads `SOURCE_DEFS` directly instead of this duplicate, which is the
  first small step of this whole plan already taken.
- **Already plugin-shaped**: no — `kind: 'oauth'|'upload'|'search'|'tool'`
  is a weak discriminator; every source still needs bespoke UI/route.
- **What extraction means**: highest cost of the 7 (993 lines, 7
  importers). Before extraction: (a) delete `IMPORT_SERVICES` and derive
  everything from `SOURCE_DEFS` (quick win, do independently of the rest
  of this plan), (b) split the 10 sources' OAuth/import logic out of the
  one file into one module per source behind a common
  `ImportSourcePlugin` interface (start/status/import).

## 6. Fingerprinting — DONE (interface only, still one provider)

- **Lives**: `src/plugins/fingerprinting/` — `FingerprintProvider`
  interface (`match`/`check`) plus `acoustIdProvider`, which wraps the
  existing `runTrackFingerprint`/`refingerprintTrack`/`checkTrackFingerprint`
  calls in `src/api/studio.ts` (left in place — they share that file's
  `requestJson`/mock-fallback plumbing with the rest of the studio API
  surface, not worth pulling out on their own).
- **Settings today**: none — `FingerprintTrackPanel.tsx` (117 lines) is a
  per-track action widget on `StudioReleaseDetailView.tsx`, not a Settings
  surface, and now calls `acoustIdProvider.match`/`.check` instead of the
  raw functions. `PluginStorePanel`'s fingerprinting tab is the first place
  this is browsable at all.
- **Extraction done**: the interface exists now, so a second provider is a
  sibling module implementing it, not a branch inside `runTrackFingerprint`.
  Still only one provider (`acoustIdProvider`) — that was true before this
  pass too, nothing user-facing changed.

## 7. Visualizers

- **Lives**: `src/components/visuals/ThreeVisualizer.tsx` (567 lines,
  lazy WebGL) + `ChannelVisualizer.tsx` (143 lines, settings-parsing
  wrapper). Preset ids in `VISUAL_PRESETS` (`src/api/channel-design.ts`).
- **Settings today**: `ChannelDesigner.tsx`'s "Visualizer" tab
  (576-line file) — enable toggle, preset grid, per-preset speed/
  intensity, plus a separate "Colors" tab for the shared color scheme.
- **Already plugin-shaped**: no — `VISUAL_PRESETS` is a flat string
  array with no per-preset metadata object (the picker derives labels
  from the id itself; `PluginStorePanel`'s descriptions are new, written
  for this store, not sourced from existing code).
- **What extraction means**: highest implementation cost of the 7 — each
  preset is a real WebGL render mode inside one 567-line Three.js
  component, not an independent module. A `VisualizerPlugin` interface
  would need `{id, meta, render(ctx, params)}`, and `ThreeVisualizer.tsx`
  would need to dispatch to per-preset renderer modules instead of one
  big switch — a genuine refactor, not a relocation.

## Suggested order

1. **Now** — done: `PluginStorePanel` browses all 7 via existing data,
   no main-codebase changes.
2. **Quick wins** (each independent, no dependency on the others):
   - DONE — `themeStore` extracted to `src/plugins/themes/` (§1), dead
     `ThemesView.tsx` deleted rather than moved.
   - DONE — `MulticastProvider` registry extracted to
     `src/plugins/multicast/` (§3), fixing a real provider-list drift bug
     in the process. `RtmpTarget.provider` typing + UI de-dup still open.
   - DONE — `FingerprintProvider` interface extracted to
     `src/plugins/fingerprinting/` (§6), wrapping the existing AcoustID
     calls.
   - Still open: delete `IMPORT_SERVICES` duplication in favor of
     `SOURCE_DEFS` (§5's quick win, independent of the larger Import
     extraction below).
3. **Medium**: lift `proEditorPlugins.ts`+`audioPreviewGraph.ts` as a
   package once (and only once) a generic plugin-chain host component is
   factored out of `StudioProEditorView.tsx` — don't extract the registry
   while its only consumer is still one 1173-line view.
4. **Design work before code**: Export has no real per-implementation
   behavior to extract yet — write the `ExportProvider` interface first,
   implement Revelator against it, *then* extract (Fingerprinting's
   `FingerprintProvider` half of this item is done, see §6).
5. **Largest, do last**: Import (993 lines, 7 importers) and Visualizers
   (a real per-preset WebGL refactor) — both need internal restructuring
   before "remove from main codebase" is even meaningful, not just a file
   move.

## Pending — Nuclear plugin-registry gap follow-up

- **Kick / Twitch**: already fully wired, not a gap — `tahti/apps/api`'s
  `rtmp-targets.ts` has real ingest URLs baked in for both
  (`PROVIDER_RTMP_URLS`), and both are already options in
  `StudioGoLiveView`'s multistream provider dropdown.
- **mikseri.net**: requested, spec not provided yet — do not build a UI
  stub without one; pick this up once specced.
- **Skipped per explicit direction**: NetEase Cloud Music, KHInsider (not
  a fit for this audience).
