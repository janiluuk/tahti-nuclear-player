import { describe, expect, it } from 'vitest';

import {
  LISTENER_WIDGET_TYPES,
  listenerWidgetType,
  resolveListenerWidgetInput,
  soundcloudProfileUrl,
} from './listenerWidgets';

describe('Listen store catalog', () => {
  it('lists every streaming add-on the Listen store and add-widget picker share', () => {
    expect(LISTENER_WIDGET_TYPES.map((type) => type.id)).toEqual([
      'soundcloud',
      'youtube',
      'spotify',
      'hearthis',
      'bandcamp',
    ]);
  });
});

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

describe('resolveListenerWidgetInput', () => {
  it('accepts a SoundCloud profile and marks it to save on the account', () => {
    expect(
      resolveListenerWidgetInput('soundcloud', 'https://soundcloud.com/artist'),
    ).toEqual({
      ok: true,
      input: 'https://soundcloud.com/artist',
      saveSoundcloudProfile: true,
    });
  });

  it('accepts a SoundCloud track URL without treating it as a profile', () => {
    expect(
      resolveListenerWidgetInput(
        'soundcloud',
        'https://soundcloud.com/artist/track',
      ),
    ).toEqual({
      ok: true,
      input: 'https://soundcloud.com/artist/track',
      saveSoundcloudProfile: false,
    });
  });

  it('rejects an unrecognized YouTube URL instead of saving a broken embed', () => {
    expect(
      resolveListenerWidgetInput('youtube', 'https://example.com/watch'),
    ).toEqual({
      ok: false,
      error: expect.stringContaining("Couldn't recognize this YouTube link"),
    });
  });

  it('accepts a YouTube watch URL', () => {
    expect(
      resolveListenerWidgetInput(
        'youtube',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      ),
    ).toEqual({
      ok: true,
      input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      saveSoundcloudProfile: false,
    });
  });
});

describe('Bandcamp listener embed', () => {
  const bandcamp = listenerWidgetType('bandcamp');

  it('accepts the official EmbeddedPlayer URL', () => {
    expect(
      bandcamp?.toEmbedUrl(
        'https://bandcamp.com/EmbeddedPlayer/album=1234567890/size=large/tracklist=false/',
      ),
    ).toBe(
      'https://bandcamp.com/EmbeddedPlayer/album=1234567890/size=large/tracklist=false/',
    );
  });

  it('rejects a plain Bandcamp page URL — no derivable numeric id', () => {
    expect(
      bandcamp?.toEmbedUrl('https://artist.bandcamp.com/album/some-album'),
    ).toBeNull();
  });

  it('rejects unrelated URLs', () => {
    expect(
      bandcamp?.toEmbedUrl('https://example.com/EmbeddedPlayer/'),
    ).toBeNull();
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
