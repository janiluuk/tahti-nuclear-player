import { describe, expect, it } from 'vitest';

import {
  channelLookExtrasFromVisual,
  isValidHeaderVideoUrl,
  isVisualPreset,
  mergeLookExtrasPreferApi,
  resolvePublicVisualizerPreset,
  shouldDockVisualizerTuning,
  toChannelVisualApiPatch,
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

describe('mergeLookExtrasPreferApi', () => {
  it('keeps API false/null over cache truthy values', () => {
    expect(
      mergeLookExtrasPreferApi(
        { usePlayerGradient: false, playerOverlayText: null },
        { usePlayerGradient: true, playerOverlayText: 'cached' },
      ),
    ).toEqual({
      usePlayerGradient: false,
      playerOverlayText: null,
    });
  });

  it('fills only keys the API still omits', () => {
    expect(
      mergeLookExtrasPreferApi(
        { usePlayerGradient: true },
        {
          usePlayerGradient: false,
          backgroundVisualPreset: 'AURORA',
          channelLinks: [{ label: 'Site', url: 'https://example.com' }],
        },
      ),
    ).toEqual({
      usePlayerGradient: true,
      backgroundVisualPreset: 'AURORA',
      channelLinks: [{ label: 'Site', url: 'https://example.com' }],
    });
  });
});

describe('channelLookExtrasFromVisual', () => {
  it('copies only defined look-extra fields', () => {
    expect(
      channelLookExtrasFromVisual({
        usePlayerGradient: false,
        visualPreset: 'AURORA',
      }),
    ).toEqual({ usePlayerGradient: false });
    expect(channelLookExtrasFromVisual(null)).toEqual({});
  });
});

describe('toChannelVisualApiPatch', () => {
  it('forwards look-extras the visual PATCH schema accepts; strips textOverlay*', () => {
    const patch = toChannelVisualApiPatch({
      visualPreset: 'AURORA',
      headerStyle: 'GRADIENT',
      brandAccentPreset: 'aurora',
      channelLinks: [{ label: 'Site', url: 'https://example.com' }],
      textOverlayMode: 'COSMIC_NEON',
      textOverlayText: 'Hello',
      usePlayerGradient: true,
      playerOverlayMode: 'COSMIC_NEON',
      backgroundVisualPreset: 'INTERACTIVE_POINTS',
    });
    expect(patch).toEqual({
      visualPreset: 'AURORA',
      headerStyle: 'GRADIENT',
      brandAccentPreset: 'aurora',
      channelLinks: [{ label: 'Site', url: 'https://example.com' }],
      usePlayerGradient: true,
      playerOverlayMode: 'COSMIC_NEON',
      backgroundVisualPreset: 'INTERACTIVE_POINTS',
    });
    expect(patch).not.toHaveProperty('textOverlayMode');
    expect(patch).not.toHaveProperty('textOverlayText');
  });
});

describe('mergeLookExtrasPreferApi', () => {
  it('lets API false/null win over cache true/string', () => {
    expect(
      mergeLookExtrasPreferApi(
        { usePlayerGradient: false, playerColorSchemeJson: null },
        {
          usePlayerGradient: true,
          playerColorSchemeJson: '{"accent":"#fff"}',
          backgroundVisualPreset: 'FAT_LINES',
        },
      ),
    ).toEqual({
      usePlayerGradient: false,
      playerColorSchemeJson: null,
      backgroundVisualPreset: 'FAT_LINES',
    });
  });

  it('keeps cache only for keys the API omits', () => {
    expect(
      mergeLookExtrasPreferApi(
        { useBackgroundGradient: true },
        { channelLinks: [{ label: 'Site', url: 'https://example.com' }] },
      ),
    ).toEqual({
      useBackgroundGradient: true,
      channelLinks: [{ label: 'Site', url: 'https://example.com' }],
    });
  });
});
