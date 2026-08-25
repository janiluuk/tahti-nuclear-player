import { afterEach, describe, expect, it, vi } from 'vitest';

import { importSourcePlugin, importSourcePlugins } from './registry';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('importSourcePlugins', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has a unique id for every source', () => {
    const ids = importSourcePlugins.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('builds a full oauth URL only for oauth-kind sources', () => {
    for (const plugin of importSourcePlugins) {
      if (plugin.kind === 'oauth') {
        expect(plugin.oauthUrl).toBeTruthy();
        expect(plugin.oauthUrl).toContain(plugin.oauthStartPath);
      } else {
        expect(plugin.oauthUrl).toBeNull();
      }
    }
  });

  it('importSourcePlugin looks up a source by id', () => {
    expect(importSourcePlugin('soundcloud')?.name).toBe('SoundCloud');
    expect(importSourcePlugin('bogus-id' as never)).toBeUndefined();
  });

  it('checkStatus() delegates to this source’s own connection-status endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ connected: true, configured: true, username: 'me' }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const soundcloud = importSourcePlugin('soundcloud')!;
    const result = await soundcloud.checkStatus();

    expect(result.data).toEqual({
      connected: true,
      configured: true,
      username: 'me',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/tahti-api/api/me/soundcloud',
      expect.anything(),
    );
  });
});
