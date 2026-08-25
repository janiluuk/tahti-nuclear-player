import { describe, expect, it } from 'vitest';

import { VISUAL_PRESETS } from '../../api/channel-design';
import { visualizerPreset, visualizerPresets } from './index';
import { auroraPreset } from './presets/aurora';

describe('visualizerPresets registry', () => {
  it('has a unique id for every preset', () => {
    const ids = visualizerPresets.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every VISUAL_PRESETS entry except MINIMAL (no Three.js scene)', () => {
    const registered = new Set(visualizerPresets.map((p) => p.id));
    const nonMinimal = VISUAL_PRESETS.filter((id) => id !== 'MINIMAL');
    expect([...registered].sort()).toEqual([...nonMinimal].sort());
  });

  it('every preset has a non-empty description', () => {
    for (const preset of visualizerPresets) {
      expect(preset.description).toBeTruthy();
    }
  });
});

describe('visualizerPreset()', () => {
  it('looks up a registered preset by id', () => {
    expect(visualizerPreset('WATER_RIPPLE').id).toBe('WATER_RIPPLE');
  });

  it('falls back to Aurora for an unrecognized id, matching callers’ own ?? AURORA default', () => {
    expect(visualizerPreset('SOME_FUTURE_PRESET')).toBe(auroraPreset);
    expect(visualizerPreset('')).toBe(auroraPreset);
  });
});
