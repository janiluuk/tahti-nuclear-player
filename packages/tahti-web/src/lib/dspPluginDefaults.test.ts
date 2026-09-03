import { describe, expect, it } from 'vitest';

import {
  composeDspUrl,
  displayDspPrefix,
  dspPrefixesFromPluginConfig,
  fillAllDspUrls,
  prefixesForServices,
  spotifyArtistPageUrl,
} from './dspPluginDefaults';

describe('dspPluginDefaults', () => {
  it('builds Spotify artist URLs from the linked plugin artist id', () => {
    expect(spotifyArtistPageUrl('06HL4z0CvFAxyc27GXpf02')).toBe(
      'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02',
    );
  });

  it('prefers embed widget URLs over import profile defaults', () => {
    expect(
      dspPrefixesFromPluginConfig({
        spotifyArtistId: 'artist-1',
        soundcloudProfileUrl: 'https://soundcloud.com/from-import',
        widgetUrls: {
          spotify: 'https://open.spotify.com/playlist/abc',
          soundcloud: 'https://soundcloud.com/from-embed',
        },
      }),
    ).toEqual({
      spotify: 'https://open.spotify.com/playlist/abc',
      soundcloud: 'https://soundcloud.com/from-embed',
    });
  });

  it('falls back to import plugin profile URLs, then saved profile links', () => {
    expect(
      dspPrefixesFromPluginConfig({
        spotifyArtistId: 'artist-1',
        soundcloudProfileUrl: 'https://soundcloud.com/you',
      }),
    ).toEqual({
      spotify: 'https://open.spotify.com/artist/artist-1',
      soundcloud: 'https://soundcloud.com/you',
    });
    expect(
      dspPrefixesFromPluginConfig({
        spotifyProfileUrl: 'https://open.spotify.com/artist/from-profile',
        soundcloudProfileUrl: 'https://soundcloud.com/you',
      }),
    ).toEqual({
      spotify: 'https://open.spotify.com/artist/from-profile',
      soundcloud: 'https://soundcloud.com/you',
    });
  });

  it('does not invent Spotify or SoundCloud prefixes without plugin config', () => {
    const prefixes = prefixesForServices({});
    expect(prefixes.spotify).toBeUndefined();
    expect(prefixes.soundcloud).toBeUndefined();
    expect(prefixes.apple).toBe('https://music.apple.com/album/');
  });

  it('composes a slug onto a plugin prefix and keeps a pasted full URL', () => {
    expect(composeDspUrl('https://soundcloud.com/you', 'polar-nights')).toBe(
      'https://soundcloud.com/you/polar-nights',
    );
    expect(
      composeDspUrl(
        'https://soundcloud.com/you',
        'https://soundcloud.com/you/other-set',
      ),
    ).toBe('https://soundcloud.com/you/other-set');
  });

  it('fills Spotify and SoundCloud from plugin stream URLs without inventing paths', () => {
    expect(
      fillAllDspUrls(
        {
          spotify: 'https://open.spotify.com/artist/artist-1',
          soundcloud: 'https://soundcloud.com/you/polar-nights',
          apple: 'https://music.apple.com/album/',
        },
        'polar-nights',
      ),
    ).toEqual({
      spotify: 'https://open.spotify.com/artist/artist-1',
      soundcloud: 'https://soundcloud.com/you/polar-nights',
      apple: 'https://music.apple.com/album/polar-nights',
    });
  });

  it('shortens prefixes for the input addon', () => {
    expect(displayDspPrefix('https://soundcloud.com/you')).toBe(
      'soundcloud.com/you/',
    );
  });
});
