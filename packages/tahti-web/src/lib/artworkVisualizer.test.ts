import { describe, expect, it } from 'vitest';

import { resolveArtworkVisualizerPreset } from './artworkVisualizer';

describe('resolveArtworkVisualizerPreset', () => {
  it('returns an artwork-driven preset', () => {
    expect(['WATER_RIPPLE', 'VIDEO_KINECT']).toContain(
      resolveArtworkVisualizerPreset('release-1'),
    );
  });

  it('is stable for the same item', () => {
    expect(resolveArtworkVisualizerPreset('playlist-1')).toBe(
      resolveArtworkVisualizerPreset('playlist-1'),
    );
  });
});
