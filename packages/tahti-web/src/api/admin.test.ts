import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAdminNews } from './admin';

describe('fetchAdminNews', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts the production API array response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              id: 'news-1',
              headline: 'Platform update',
              summary: 'The latest changes.',
              authorName: 'Board',
              publishedAt: null,
              createdAt: '2026-08-23T00:00:00.000Z',
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const result = await fetchAdminNews();

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.headline).toBe('Platform update');
    expect(result.meta.source).toBe('api');
  });
});
