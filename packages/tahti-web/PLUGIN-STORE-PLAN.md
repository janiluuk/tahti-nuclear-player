# Plugin store — mapping & extraction plan

`Settings > Plugin store` (`src/components/PluginStorePanel.tsx`) is a unified
**browser** across 7 subsystems that already behave like plugins but live
scattered through the main codebase. It does not change where any of them
run — it's a navigation/launcher layer over the existing implementations.
This doc maps where each one lives today and what actually extracting it
into a standalone, removable plugin would take.

Ranked by extraction cost (cheapest first):

## 1. Themes — cheapest, do first

- **Lives**: `src/stores/themeStore.ts` (275 lines). `listBasicThemes()`
  comes from `@nuclearplayer/themes`; custom themes are user-imported JSON
  in `customThemes: Record<string, AdvancedTheme>`.
- **Settings today**: `src/views/ThemesView.tsx` + `ThemesPanel` in
  `SettingsPanels.tsx`.
- **Already plugin-shaped**: yes, closest of all 7 to a real registry —
  `importCustomTheme`/`removeCustomTheme` is already dynamic add/remove.
- **What extraction means**: package `themeStore` + `ThemesView` as
  `@tahti/plugin-themes`, keep the store's public interface
  (`themeId`, `setTheme`, `importCustomTheme`) as the plugin contract. Low
  risk — 7 importers, no deep coupling elsewhere.

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

## 3. Multicast (RTMP targets)

- **Lives**: `src/api/broadcast.ts` (578 lines) — `RtmpTarget` CRUD.
- **Settings today**: `StudioGoLiveView.tsx` (multistream section) and a
  duplicated subset UI in `StreamManagerPanel.tsx`.
- **Already plugin-shaped**: partially — each target is already an
  independent, enable/disable-able instance, but `provider` is a free-text
  string, not a typed per-provider config (no distinct YouTube vs Twitch
  fields).
- **What extraction means**: define a `MulticastProvider` type (id, label,
  config schema) and make `RtmpTarget.provider` reference one, instead of
  free text. Real work is de-duplicating the two settings UIs into one
  before anything can be called a clean plugin surface.

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

## 6. Fingerprinting

- **Lives**: `src/api/studio.ts` — `runTrackFingerprint`/
  `refingerprintTrack`/`checkTrackFingerprint`, AcoustID hardcoded, no
  abstraction for a second provider.
- **Settings today**: none — `FingerprintTrackPanel.tsx` (117 lines) is a
  per-track action widget on `StudioReleaseDetailView.tsx`, not a Settings
  surface. `PluginStorePanel`'s fingerprinting tab is the first place this
  is browsable at all.
- **Already plugin-shaped**: no — single hardcoded provider.
- **What extraction means**: lowest priority (no user-facing multiplicity
  to justify it yet) unless/until a second provider is planned. If one is,
  define a `FingerprintProvider` interface (`match(audio) → candidates`)
  before adding it, rather than hardcoding a second `if`.

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
   delete `IMPORT_SERVICES` duplication in favor of `SOURCE_DEFS`;
   extract `themeStore`+`ThemesView` as a standalone package.
3. **Medium**: lift `proEditorPlugins.ts`+`audioPreviewGraph.ts` as a
   package once (and only once) a generic plugin-chain host component is
   factored out of `StudioProEditorView.tsx` — don't extract the registry
   while its only consumer is still one 1173-line view.
4. **Design work before code**: Export and Fingerprinting have no real
   per-implementation behavior to extract yet — write the
   `ExportProvider`/`FingerprintProvider` interfaces first, implement
   AcoustID/Revelator against them, *then* extract.
5. **Largest, do last**: Import (993 lines, 7 importers) and Visualizers
   (a real per-preset WebGL refactor) — both need internal restructuring
   before "remove from main codebase" is even meaningful, not just a file
   move.
