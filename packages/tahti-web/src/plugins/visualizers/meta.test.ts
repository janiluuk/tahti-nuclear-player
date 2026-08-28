import { describe, expect, it } from 'vitest';

import { VISUAL_PRESETS } from '../../api/channel-design';
import { VISUALIZER_METADATA, visualizerMetadata } from './meta';

describe('visualizer metadata registry', () => {
  it('has display metadata for every selectable preset', () => {
    expect(Object.keys(VISUALIZER_METADATA)).toEqual(
      expect.arrayContaining([...VISUAL_PRESETS]),
    );
    VISUAL_PRESETS.forEach((preset) => {
      expect(VISUALIZER_METADATA[preset].description).toBeTruthy();
      expect(VISUALIZER_METADATA[preset].Icon).toBeDefined();
    });
  });

  it('falls back to Aurora for an unknown preset id', () => {
    expect(visualizerMetadata('unknown').description).toBe(
      VISUALIZER_METADATA.AURORA.description,
    );
  });
});
