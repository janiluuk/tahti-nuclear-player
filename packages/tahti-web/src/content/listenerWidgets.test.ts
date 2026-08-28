import { describe, expect, it } from 'vitest';

import { listenerWidgetType, soundcloudProfileUrl } from './listenerWidgets';

describe('hearthis.at listener embed', () => {
  const hearthis = listenerWidgetType('hearthis');

  it('turns a numeric track id into the official hearthis.at widget URL', () => {
    expect(hearthis?.toEmbedUrl('12345')).toContain(
      'https://hearthis.at/embed/12345/transparent_black/',
    );
    expect(hearthis?.toEmbedUrl('12345')).toContain('autoplay=0');
  });

  it('accepts a hearthis.at embed URL', () => {
    expect(
      hearthis?.toEmbedUrl(
        'https://hearthis.at/embed/12345/transparent_black/',
      ),
    ).toContain('https://hearthis.at/embed/12345/transparent_black/');
  });

  it('rejects unrelated URLs and slug-only track pages', () => {
    expect(hearthis?.toEmbedUrl('https://example.com/12345')).toBeNull();
    expect(hearthis?.toEmbedUrl('https://hearthis.at/dj/track/')).toBeNull();
  });
});

describe('SoundCloud profile URL', () => {
  it('normalizes a SoundCloud account link', () => {
    expect(soundcloudProfileUrl('https://www.soundcloud.com/artist/')).toBe(
      'https://soundcloud.com/artist',
    );
  });

  it('rejects track and non-SoundCloud URLs', () => {
    expect(soundcloudProfileUrl('https://soundcloud.com/artist/track')).toBe(
      null,
    );
    expect(soundcloudProfileUrl('https://example.com/artist')).toBe(null);
  });
});

describe('Spotify playlist listener embed', () => {
  const spotify = listenerWidgetType('spotify');

  it('turns a Spotify playlist URL into the official playlist embed', () => {
    expect(
      spotify?.toEmbedUrl(
        'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6',
      ),
    ).toBe('https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6');
  });

  it('rejects Spotify tracks, profiles, and unrelated URLs', () => {
    expect(
      spotify?.toEmbedUrl(
        'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tjpeg',
      ),
    ).toBeNull();
    expect(spotify?.toEmbedUrl('https://spotify.com/playlist/abc')).toBeNull();
    expect(spotify?.toEmbedUrl('https://example.com/playlist/abc')).toBeNull();
  });
});
