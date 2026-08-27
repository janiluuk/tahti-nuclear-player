import { describe, expect, it } from 'vitest';

import { matchesSectionRoute } from './sectionNavigation';

describe('matchesSectionRoute', () => {
  it('matches a section root and its nested routes', () => {
    expect(
      matchesSectionRoute('/studio/shows/episodes/1', ['/studio/shows']),
    ).toBe(true);
  });

  it('matches one of several section prefixes', () => {
    expect(
      matchesSectionRoute('/studio/distribution', [
        '/studio/stats',
        '/studio/distribution',
      ]),
    ).toBe(true);
  });

  it('does not match a similarly named route', () => {
    expect(matchesSectionRoute('/studio/stats-extra', ['/studio/stats'])).toBe(
      false,
    );
  });

  it('does not match an absent route', () => {
    expect(matchesSectionRoute(undefined, ['/studio'])).toBe(false);
  });
});
