import type * as THREE from 'three';

export type VisualizerScheme = {
  accent: string;
  highlight: string;
  bg: string;
  text: string;
  muted: string;
};

/** One running Three.js scene's per-frame hook. `elapsed` is seconds
 * scaled by the user's speed setting; `level` is the current audio
 * envelope (0–1) scaled by the user's intensity setting. */
export type PresetScene = {
  update: (elapsed: number, level: number) => void;
};

/**
 * A channel visualizer preset. Owns its Three.js scene-building logic and
 * its own display copy — `ThreeVisualizer.tsx` (the WebGL host) doesn't
 * know how any individual preset renders, it just calls `build()` and
 * drives the returned `PresetScene` every frame. `MINIMAL` is a real,
 * selectable preset (see `api/channel-design.ts`'s `VISUAL_PRESETS`) but
 * has no entry here — it's a CSS-only fallback with nothing to build; see
 * `ChannelVisualizer.tsx`.
 */
export interface VisualizerPreset {
  id: string;
  description: string;
  build(
    scene: THREE.Scene,
    scheme: VisualizerScheme,
    artworkUrl?: string | null,
    /** Shared perspective camera, positioned by the host at (0, 0,
     * CAMERA_DISTANCE) — optional 4th param, only presets that move the
     * camera itself (e.g. a beat-reactive nudge) need to accept it. Reset on
     * every preset switch since `ThreeVisualizer.tsx` recreates the camera
     * per effect run. */
    camera?: THREE.PerspectiveCamera,
  ): PresetScene;
}
