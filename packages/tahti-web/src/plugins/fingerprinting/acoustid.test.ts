import { afterEach, describe, expect, it, vi } from 'vitest';

import { acoustIdProvider } from './acoustid';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('acoustIdProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has stable id/label', () => {
    expect(acoustIdProvider.id).toBe('acoustid');
    expect(acoustIdProvider.label).toBe('AcoustID');
  });

  it('match() posts to the fingerprint endpoint and returns the match', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        fingerprint: 'abc123',
        match: { acoustidId: 'aid-1', score: 0.9 },
        persisted: true,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await acoustIdProvider.match('release-1', 'track-1');

    expect(result).toEqual({
      ok: true,
      data: {
        fingerprint: 'abc123',
        match: { acoustidId: 'aid-1', score: 0.9 },
        persisted: true,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/tahti-api/api/me/releases/release-1/tracks/track-1/fingerprint',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('check() hits the check sub-path and never overwrites the stored match', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ fingerprint: 'abc123', match: null, persisted: false }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await acoustIdProvider.check('release-1', 'track-1');

    expect(result).toEqual({
      ok: true,
      data: { fingerprint: 'abc123', match: null, persisted: false },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/tahti-api/api/me/releases/release-1/tracks/track-1/fingerprint/check',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('surfaces a request failure as ok: false', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'boom' }, 500));
    vi.stubGlobal('fetch', fetchMock);

    const result = await acoustIdProvider.match('release-1', 'track-1');

    expect(result).toEqual({ ok: false, error: 'boom' });
  });
});
