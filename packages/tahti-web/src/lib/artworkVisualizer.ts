import type { VisualPreset } from '../api/channel-design';

const ARTWORK_VISUALIZER_PRESETS: readonly VisualPreset[] = [
  'WATER_RIPPLE',
  'VIDEO_KINECT',
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function resolveArtworkVisualizerPreset(seed: string): VisualPreset {
  return (
    ARTWORK_VISUALIZER_PRESETS[
      hashSeed(seed) % ARTWORK_VISUALIZER_PRESETS.length
    ] ?? 'WATER_RIPPLE'
  );
}
