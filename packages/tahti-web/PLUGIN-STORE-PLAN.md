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

## 2. Audio plugins (Pro Editor chain) — registry done, host UI still open

- **Lives**: `src/plugins/audio-fx/` — `AudioFxPlugin` interface
  (`isEnabled`/`buildPreviewNodes`) plus one module per plugin (`eq.ts`,
  `compressor.ts`, `limiter.ts`, `filter.ts`), each with its own unit test
  against a fake `AudioContext` (`testAudioContext.ts` — vitest's node/jsdom
  environments don't implement real Web Audio).
  `src/lib/audioPreviewGraph.ts` (the live-preview host hook) now just
  loops `editList.pluginChain` and asks each enabled plugin to build its
  own nodes, instead of a hardcoded if/else per plugin id.
- **Settings today**: `src/views/studio/StudioProEditorView.tsx`
  (still ~1200 lines) — the plugin-chain UI (add/remove/reorder +
  per-plugin params) lives inside this one large view, not a separate
  settings page. Untouched by this extraction beyond swapping its
  `PLUGIN_META`/`ALL_PLUGIN_IDS` imports to the new registry.
- **Done**: the registry + preview-graph dispatch. A new plugin is a new
  module implementing `AudioFxPlugin` plus one line in
  `src/plugins/audio-fx/index.ts` — no changes to
  `useAudioPreviewGraph` or `StudioProEditorView.tsx` needed for the
  audio-graph half.
- **Still open**: the *host UI* — add/remove/reorder/per-plugin param
  controls — is still welded into `StudioProEditorView.tsx`. A real
  "audio plugin store" (arbitrary third-party plugin tiles, not just
  these four) still needs a generic plugin-chain host component factored
  out of that view first; extracting the registry didn't shrink the file
  and wasn't meant to.

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

## 4. Export — relocated, still not a behavioral plugin

- **Lives**: `src/plugins/export/` — `EXPORT_TARGETS`, 10 entries, each
  still just `{id, label, note, color, to, supportsTracks}`. Real delivery
  logic is centralized in `StudioDistributionView.tsx` (Revelator
  submission), not per-target.
- **Settings today**: `ConnectionsPanel` in `SettingsPanels.tsx`,
  `TrackExportPanel.tsx`, `PluginStorePanel.tsx` + `StudioDistributionView.tsx`.
- **Done this pass**: moved to `src/plugins/export/` (same shape as
  multicast's registry — see `docs/PLUGINS.md`'s shape A), all 3
  importers updated, one test file covering the registry invariants
  (unique ids, every Revelator-note target actually points at
  `/studio/distribution`).
- **Still not plugin-shaped, deliberately not faked**: this remains a
  flat metadata array with a deep-link, not independent implementations —
  every DSP still goes through the same one Revelator call regardless of
  which box is checked. A real `ExportProvider` interface
  (submit/status/webhook) needs API work that doesn't exist yet; writing
  one against nothing to implement it would just be an unused interface,
  so this extraction stopped at relocation rather than inventing one.

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
3. **Medium**: DONE — the `src/plugins/audio-fx/` registry + preview-graph
   dispatch (§2). Deliberately did **not** wait for a generic plugin-chain
   host component to be factored out of `StudioProEditorView.tsx` first
   (this doc originally said to) — the registry extraction turned out to
   be independently valuable (a real plugin-authoring contract, unit
   tests, no more if/else per plugin id in the preview-graph hook) even
   with the host UI unmoved. The host-UI factor-out is still open, just no
   longer a blocker for the registry half.
4. **Design work before code**: Export's registry was relocated (§4,
   `src/plugins/export/`) but still has no real per-implementation
   behavior — write the `ExportProvider` interface first, implement
   Revelator against it, *then* the extraction is actually done
   (Fingerprinting's `FingerprintProvider` half of this item already is,
   see §6).
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
