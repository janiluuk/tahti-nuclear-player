import { describe, expect, it } from 'vitest';

import { VISUAL_PRESETS } from '../../api/channel-design';
import {
  VISUALIZER_METADATA,
  visualizerMetadata,
  visualizerSupportsAudioReactive,
} from './meta';

describe('visualizer metadata registry', () => {
  it('has display metadata for every selectable preset', () => {
    expect(Object.keys(VISUALIZER_METADATA)).toEqual(
      expect.arrayContaining([...VISUAL_PRESETS]),
    );
    VISUAL_PRESETS.forEach((preset) => {
      expect(VISUALIZER_METADATA[preset].description).toBeTruthy();
      expect(VISUALIZER_METADATA[preset].Icon).toBeDefined();
      expect(typeof VISUALIZER_METADATA[preset].audioReactive).toBe('boolean');
    });
  });

  it('falls back to Aurora for an unknown preset id', () => {
    expect(visualizerMetadata('unknown').description).toBe(
      VISUALIZER_METADATA.AURORA.description,
    );
  });

  it('labels every WebGL preset as audio-reactive and Minimal as not', () => {
    expect(visualizerSupportsAudioReactive('MINIMAL')).toBe(false);
    VISUAL_PRESETS.filter((preset) => preset !== 'MINIMAL').forEach(
      (preset) => {
        expect(visualizerSupportsAudioReactive(preset)).toBe(true);
      },
    );
  });
});
