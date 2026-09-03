import { describe, expect, it } from 'vitest';

import { getStudioPrimaryRoute, SUBMENUS } from './StudioNav';

describe('StudioNav section coverage', () => {
  // A submenu link whose own path doesn't resolve back to the primary
  // section it lives under falls back to StudioNavigation's '/studio'
  // default: landing on that page highlights no top-level tab (Studio /
  // Perform) and no submenu item, even though the page renders a
  // real subtabs bar. This caught /studio/branding shipping unregistered.
  for (const [section, items] of Object.entries(SUBMENUS)) {
    for (const item of items) {
      it(`"${item.to}" (under ${section}) resolves back to ${section}`, () => {
        expect(getStudioPrimaryRoute(item.to)).toBe(section);
      });
    }
  }

  it('keeps multicast under Radio instead of a Perform sibling', () => {
    const destinations = SUBMENUS['/studio/go-live'].map((item) => item.to);
    expect(destinations).not.toContain('/studio/channel?tab=multicast');
    expect(destinations).toContain('/studio/channel?tab=radio');
  });

  it('folds Library into Studio and keeps /library routes on Studio', () => {
    expect(SUBMENUS).not.toHaveProperty('/library');
    const destinations = SUBMENUS['/studio'].map((item) => item.to);
    expect(destinations).toEqual(
      expect.arrayContaining([
        '/library',
        '/library/sounds',
        '/library/collections',
        '/studio/releases',
        '/library/upload',
        '/studio/editor',
      ]),
    );
    expect(getStudioPrimaryRoute('/library')).toBe('/studio');
    expect(getStudioPrimaryRoute('/library/sounds')).toBe('/studio');
    expect(getStudioPrimaryRoute('/library/collections')).toBe('/studio');
    expect(getStudioPrimaryRoute('/library/upload')).toBe('/studio');
    expect(getStudioPrimaryRoute('/studio/releases')).toBe('/studio');
    expect(getStudioPrimaryRoute('/studio/go-live')).toBe('/studio/go-live');
  });
});
