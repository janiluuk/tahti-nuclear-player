import { describe, expect, it } from 'vitest';

import { multicastProviderLabel, multicastProviders } from './providers';

describe('multicastProviders', () => {
  it('has a unique id for every provider', () => {
    const ids = multicastProviders.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes every provider tahti-org/apps/api actually accepts', () => {
    const ids = multicastProviders.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'YOUTUBE',
        'TWITCH',
        'FACEBOOK',
        'KICK',
        'TIKTOK',
        'MIXCLOUD_LIVE',
        'INSTAGRAM',
        'CUSTOM',
      ]),
    );
  });

  it('gives CUSTOM no fixed ingest URL — the API requires a user-supplied one', () => {
    const custom = multicastProviders.find((p) => p.id === 'CUSTOM');
    expect(custom?.rtmpUrlHint).toBeUndefined();
  });
});

describe('multicastProviderLabel', () => {
  it('resolves a known provider id to its display label', () => {
    expect(multicastProviderLabel('YOUTUBE')).toBe('YouTube');
    expect(multicastProviderLabel('TIKTOK')).toBe('TikTok');
  });

  it('falls back to the raw id for an unknown provider', () => {
    expect(multicastProviderLabel('SOME_FUTURE_PROVIDER')).toBe(
      'SOME_FUTURE_PROVIDER',
    );
  });
});
