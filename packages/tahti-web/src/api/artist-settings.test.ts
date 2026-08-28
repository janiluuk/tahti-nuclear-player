import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  addModerator,
  banChatFingerprint,
  fetchChatBans,
  fetchModerators,
  removeModerator,
  unbanChatFingerprint,
} from './artist-settings';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('channel moderation API', () => {
  it('maps delegated moderators to the shared moderation capabilities', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse([
        {
          userId: 'user-1',
          username: 'mod-one',
          displayName: 'Mod One',
          grantedAt: '2026-08-28T10:00:00.000Z',
        },
      ]),
    );

    const result = await fetchModerators();

    expect(result.data).toEqual([
      {
        id: 'user-1',
        username: 'mod-one',
        displayName: 'Mod One',
        canTimeout: true,
        canDelete: true,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      '/tahti-api/api/me/channel/moderators',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('uses the owner-scoped moderator assignment endpoints', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        jsonResponse({
          userId: 'user-2',
          username: 'new-mod',
          displayName: 'New Mod',
          grantedAt: '2026-08-28T10:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(jsonResponse(undefined, 204));

    const added = await addModerator('new-mod');
    const removed = await removeModerator('user-2');

    expect(added.ok).toBe(true);
    expect(removed).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/tahti-api/api/me/channel/moderators',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'new-mod' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/tahti-api/api/me/channel/moderators/user-2',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('uses the channel-scoped chat ban endpoints', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse(undefined, 204))
      .mockResolvedValueOnce(
        jsonResponse([{ fingerprintHash: 'hash-1', bannedAt: '2026-08-28' }]),
      );

    await banChatFingerprint('my-channel', 'hash-1');
    await unbanChatFingerprint('my-channel', 'hash-1');
    const bans = await fetchChatBans('my-channel');

    expect(bans.data).toEqual([
      { fingerprintHash: 'hash-1', bannedAt: '2026-08-28' },
    ]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/tahti-api/api/me/moderate/my-channel/chat/ban',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ fingerprintHash: 'hash-1' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/tahti-api/api/me/moderate/my-channel/chat/ban/hash-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/tahti-api/api/me/moderate/my-channel/chat/bans',
      expect.objectContaining({ credentials: 'include' }),
    );
  });
});
