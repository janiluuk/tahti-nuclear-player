import { afterEach, describe, expect, it, vi } from 'vitest';

import { allowMockFallback, isForceMock } from './mode';

describe('isForceMock', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is true only when VITE_FORCE_MOCK is exactly "1"', () => {
    vi.stubEnv('VITE_FORCE_MOCK', '1');
    expect(isForceMock()).toBe(true);

    vi.stubEnv('VITE_FORCE_MOCK', 'true');
    expect(isForceMock()).toBe(false);

    vi.unstubAllEnvs();
    expect(isForceMock()).toBe(false);
  });
});

describe('allowMockFallback', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is always true when force-mock is on', () => {
    vi.stubEnv('VITE_FORCE_MOCK', '1');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', '0');
    expect(allowMockFallback()).toBe(true);
  });

  it('is true when explicitly opted in via VITE_ALLOW_MOCK_FALLBACK=1', () => {
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', '1');
    expect(allowMockFallback()).toBe(true);
  });

  it('is false when explicitly opted out via VITE_ALLOW_MOCK_FALLBACK=0, even in dev', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', '0');
    expect(allowMockFallback()).toBe(false);
  });

  it('falls back to DEV when neither flag is set -- the production-safety default', () => {
    vi.stubEnv('DEV', false);
    expect(allowMockFallback()).toBe(false);

    vi.stubEnv('DEV', true);
    expect(allowMockFallback()).toBe(true);
  });
});
