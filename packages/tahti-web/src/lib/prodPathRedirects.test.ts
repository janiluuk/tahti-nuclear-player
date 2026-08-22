import { describe, expect, it } from 'vitest';

import { resolveDashboardRedirect } from './prodPathRedirects';

describe('resolveDashboardRedirect', () => {
  it.each([
    ['distribution', '/studio/distribution'],
    ['embeds', '/studio/embeds'],
    ['events', '/studio/events'],
    ['venues', '/studio/venues'],
    ['recordings', '/studio/recordings'],
    ['posts', '/studio/updates'],
    ['upload/from-broadcast', '/studio/recordings'],
    ['archive/track-1/editor', '/studio/archive/track-1/editor'],
    ['insights/archive/track-1', '/studio/insights/archive/track-1'],
    ['collections/new', '/studio/collections'],
    ['settings/media', '/settings/artist'],
    ['settings/presskit', '/settings/artist'],
    ['settings/green-room', '/settings/broadcast'],
    ['settings/moderators', '/studio/moderation'],
    ['settings/distribution', '/studio/distribution'],
  ])('maps /dashboard/%s to %s', (source, expected) => {
    expect(resolveDashboardRedirect(source)).toBe(expected);
  });
});
