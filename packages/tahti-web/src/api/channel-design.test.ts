import { describe, expect, it } from 'vitest';

import {
  isValidHeaderVideoUrl,
  isVisualPreset,
  resolvePublicVisualizerPreset,
  shouldDockVisualizerTuning,
} from './channel-design';

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

describe('resolvePublicVisualizerPreset', () => {
  it('uses a lively fallback when a channel has no public visual preset', () => {
    expect(resolvePublicVisualizerPreset(undefined)).toBe('AURORA');
    expect(resolvePublicVisualizerPreset(null)).toBe('AURORA');
    expect(resolvePublicVisualizerPreset('MINIMAL')).toBe('AURORA');
  });

  it('preserves an explicitly selected lively preset', () => {
    expect(resolvePublicVisualizerPreset('REACTIVE_GRID')).toBe(
      'REACTIVE_GRID',
    );
  });
});

describe('isValidHeaderVideoUrl', () => {
  it('accepts HTTPS .mp4 and .webm files', () => {
    expect(isValidHeaderVideoUrl('https://cdn.example.com/loop.mp4')).toBe(
      true,
    );
    expect(isValidHeaderVideoUrl('https://cdn.example.com/loop.webm')).toBe(
      true,
    );
  });

  it('accepts a query string after the extension', () => {
    expect(isValidHeaderVideoUrl('https://cdn.example.com/loop.mp4?v=2')).toBe(
      true,
    );
  });

  it('accepts YouTube watch links for iframe-backed video loops', () => {
    expect(
      isValidHeaderVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe(true);
  });

  it('rejects non-HTTPS, non-video, empty, and null/undefined input', () => {
    expect(isValidHeaderVideoUrl('http://cdn.example.com/loop.mp4')).toBe(
      false,
    );
    expect(isValidHeaderVideoUrl('https://cdn.example.com/loop.mp3')).toBe(
      false,
    );
    expect(isValidHeaderVideoUrl('')).toBe(false);
    expect(isValidHeaderVideoUrl(null)).toBe(false);
    expect(isValidHeaderVideoUrl(undefined)).toBe(false);
  });
});
