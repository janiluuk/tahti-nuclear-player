import { describe, expect, it } from 'vitest';

import { isVisualPreset, shouldDockVisualizerTuning } from './channel-design';

describe('isVisualPreset', () => {
  it('accepts every known preset id', () => {
    expect(isVisualPreset('AURORA')).toBe(true);
    expect(isVisualPreset('MINIMAL')).toBe(true);
    expect(isVisualPreset('WAVEFORM_BARS')).toBe(true);
  });

  it('rejects unknown strings', () => {
    expect(isVisualPreset('NOT_A_PRESET')).toBe(false);
    expect(isVisualPreset('')).toBe(false);
  });
});

describe('shouldDockVisualizerTuning', () => {
  it('docks tuning for a real preset while the Visualizer tab is active', () => {
    expect(
      shouldDockVisualizerTuning({
        preset: 'AURORA',
        visualizerEnabled: true,
        activeTab: 'visualizer',
      }),
    ).toBe(true);
  });

  it('hides tuning on other tabs, even with a valid preset selected', () => {
    expect(
      shouldDockVisualizerTuning({
        preset: 'AURORA',
        visualizerEnabled: true,
        activeTab: 'colors',
      }),
    ).toBe(false);
  });

  it('hides tuning when the visualizer is switched off', () => {
    expect(
      shouldDockVisualizerTuning({
        preset: 'AURORA',
        visualizerEnabled: false,
        activeTab: 'visualizer',
      }),
    ).toBe(false);
  });

  it('hides tuning for MINIMAL, which has nothing to tune', () => {
    expect(
      shouldDockVisualizerTuning({
        preset: 'MINIMAL',
        visualizerEnabled: true,
        activeTab: 'visualizer',
      }),
    ).toBe(false);
  });

  it('hides tuning for an unrecognized preset string', () => {
    expect(
      shouldDockVisualizerTuning({
        preset: 'SOME_FUTURE_PRESET',
        visualizerEnabled: true,
        activeTab: 'visualizer',
      }),
    ).toBe(false);
  });
});
