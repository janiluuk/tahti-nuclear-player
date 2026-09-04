import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./mode', () => ({
  isForceMock: () => true,
}));

describe('integrations mock client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('installs and lists listenbrainz under force mock', async () => {
    const {
      fetchMeIntegrations,
      installMeIntegration,
      uninstallMeIntegration,
    } = await import('./integrations');

    const before = await fetchMeIntegrations();
    expect(
      before.data.find((row) => row.slug === 'listenbrainz')?.installed,
    ).toBe(false);

    const bad = await installMeIntegration('listenbrainz', {
      userToken: 'bad',
    });
    expect(bad.ok).toBe(false);

    const ok = await installMeIntegration('listenbrainz', {
      userToken: 'valid-token',
    });
    expect(ok).toEqual({ ok: true });

    const mid = await fetchMeIntegrations();
    expect(mid.data.find((row) => row.slug === 'listenbrainz')?.installed).toBe(
      true,
    );

    await uninstallMeIntegration('listenbrainz');
    const after = await fetchMeIntegrations();
    expect(
      after.data.find((row) => row.slug === 'listenbrainz')?.installed,
    ).toBe(false);
  });
});
