import { describe, expect, it } from 'vitest';

import { listenerWidgetType } from './listenerWidgets';

describe('hearthis.at listener embed', () => {
  const hearthis = listenerWidgetType('hearthis');

  it('turns a numeric track id into the official hearthis.at widget URL', () => {
    expect(hearthis?.toEmbedUrl('12345')).toContain(
      'https://hearthis.at/embed/12345/transparent_black/',
    );
    expect(hearthis?.toEmbedUrl('12345')).toContain('autoplay=0');
  });

  it('accepts a hearthis.at embed URL', () => {
    expect(
      hearthis?.toEmbedUrl(
        'https://hearthis.at/embed/12345/transparent_black/',
      ),
    ).toContain('https://hearthis.at/embed/12345/transparent_black/');
  });

  it('rejects unrelated URLs and slug-only track pages', () => {
    expect(hearthis?.toEmbedUrl('https://example.com/12345')).toBeNull();
    expect(hearthis?.toEmbedUrl('https://hearthis.at/dj/track/')).toBeNull();
  });
});
