import { auroraPreset } from './presets/aurora';
import { backdropBoxPreset } from './presets/backdropBox';
import { cloudscapePreset } from './presets/cloudscape';
import { iesSpotlightPreset } from './presets/iesSpotlight';
import { lensFlaresPreset } from './presets/lensFlares';
import { lineTanglePreset } from './presets/lineTangle';
import { particleFieldPreset } from './presets/particleField';
import { reactiveGridPreset } from './presets/reactiveGrid';
import { waterRipplePreset } from './presets/waterRipple';
import { waveformBarsPreset } from './presets/waveformBars';
import type { VisualizerPreset } from './types';

export type { PresetScene, VisualizerPreset, VisualizerScheme } from './types';
export { VISUALIZER_METADATA, visualizerMetadata } from './meta';
export type { VisualizerMetadata } from './meta';

/** Every WebGL-backed preset. `MINIMAL` (see `api/channel-design.ts`'s
 * `VISUAL_PRESETS`) isn't here — it's a CSS-only fallback with no Three.js
 * scene, handled directly in `ChannelVisualizer.tsx`. */
export const visualizerPresets: VisualizerPreset[] = [
  waterRipplePreset,
  waveformBarsPreset,
  particleFieldPreset,
  auroraPreset,
  reactiveGridPreset,
  cloudscapePreset,
  lineTanglePreset,
  backdropBoxPreset,
  lensFlaresPreset,
  iesSpotlightPreset,
];

const presetById = new Map(visualizerPresets.map((p) => [p.id, p]));

/** Falls back to Aurora for an unrecognized preset id, matching every
 * caller's own `?? 'AURORA'` default (`ChannelView.tsx`,
 * `ChannelDesigner.tsx`). */
export function visualizerPreset(id: string): VisualizerPreset {
  return presetById.get(id) ?? auroraPreset;
}
