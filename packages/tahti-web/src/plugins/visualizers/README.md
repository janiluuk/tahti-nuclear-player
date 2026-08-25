# Visualizers

The ten WebGL-backed channel visualizer presets (Water Ripple, Waveform
Bars, Particle Field, Aurora, Reactive Grid, Cloudscape, Line Tangle,
Backdrop Box, Lens Flares, IES Spotlight) — the full per-preset Three.js
scene-building logic, not just their labels.

## Contract

```ts
interface VisualizerPreset {
  id: string;
  description: string;
  build(
    scene: THREE.Scene,
    scheme: VisualizerScheme,
    artworkUrl?: string | null,
  ): PresetScene;
}

type PresetScene = {
  update: (elapsed: number, level: number) => void;
};
```

`build()` populates the given `THREE.Scene` (adds meshes/points/sprites/
lights — whatever the preset needs) and returns a `PresetScene` whose
`update()` is called every animation frame with elapsed time (seconds,
scaled by the user's speed setting) and the current audio envelope (0–1,
scaled by intensity).

## MINIMAL has no entry here

`MINIMAL` is a real, selectable preset (see `VISUAL_PRESETS` in
`../../api/channel-design.ts`) but has **no** Three.js scene — it's a
CSS-only gradient fallback. `ChannelVisualizer.tsx` never mounts
`ThreeVisualizer` for it at all, so it was never in this registry.
`visualizerPreset('MINIMAL')` would fall through to the Aurora default
(see below) — don't call it with `'MINIMAL'`.

## Files

One module per preset under `presets/`. `shared.ts` has the two things
multiple presets genuinely reuse: `createGlowTexture()` (a radial-gradient
sprite texture, used by Particle Field / Cloudscape / Lens Flares) and the
`TAU` constant. `index.ts` is the registry: `visualizerPresets` (array)
and `visualizerPreset(id)` (lookup, **falls back to Aurora** for an
unrecognized id — matches every caller's own `?? 'AURORA'` default in
`ChannelView.tsx`/`ChannelDesigner.tsx`, so don't rely on this throwing
for a typo'd id).

## Consumers

`src/components/visuals/ThreeVisualizer.tsx` — the WebGL host. It owns
the renderer/camera/scene bootstrap, the render loop (reading the
player's live `AnalyserNode` for the audio level), and disposal on
unmount. It calls `visualizerPreset(preset).build(scene, scheme,
artworkUrl)` once per mount and drives the returned `update()` every
frame — it has no idea what any individual preset actually renders.

## A known, unmerged duplication

`ChannelDesigner.tsx`'s "Visualizer" tab has its own `PRESET_META` —
description + `LucideIcon` per preset — with wording that differs from
this registry's `description` (e.g. Water Ripple: "Soft ripple distortion
synced to audio level." there vs. "Concentric ripples reacting to the
beat." here). `PluginStorePanel.tsx` sources its descriptions from this
registry; `ChannelDesigner.tsx` does not. Left as-is deliberately —
picking a winning wording across three surfaces is a content decision,
not something to resolve silently in a refactor. See
[`../../../PLUGIN-STORE-PLAN.md`](../../../PLUGIN-STORE-PLAN.md) §7.

## Extending

A new preset: a new module in `presets/` implementing `VisualizerPreset`,
one line added to `visualizerPresets` in `index.ts`, and an entry in
`VISUAL_PRESETS` (`../../api/channel-design.ts`) so it's a recognized
preset id at all. Test with a real `THREE.Scene` — no WebGL context is
needed for scene-graph construction, only `WebGLRenderer` (which this
registry never touches) needs an actual canvas. See
`presets/waveformBars.test.ts` for the pattern.
