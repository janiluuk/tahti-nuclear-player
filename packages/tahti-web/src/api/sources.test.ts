import { afterEach, describe, expect, it, vi } from 'vitest';

import { importHearthisTracks, type HearthisTrack } from './sources';

const track: HearthisTrack = {
  id: 'hearthis-track',
  url: 'https://hearthis.at/artist/track/',
  title: 'Imported track',
  username: 'artist',
  durationSec: 180,
  coverUrl: 'https://images.hearthis.at/cover.jpg',
};

describe('importHearthisTracks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores source cover art on every imported archive item', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            archiveItemId: 'archive-1',
            track: { coverUrl: track.coverUrl },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ url: '/stored-cover.jpg' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await importHearthisTracks('collection-1', [track]);

    expect(result).toEqual({ imported: 1, failed: 0, artworkFailed: 0 });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/tahti-api/api/me/archive/archive-1/banner/from-url',
      expect.objectContaining({
        body: JSON.stringify({ sourceUrl: track.coverUrl }),
        method: 'POST',
      }),
    );
  });
});
