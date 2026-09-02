import { describe, expect, it } from 'vitest';

import { getHelpArticle } from './help';

describe('artist gallery help', () => {
  it('moves gallery how-to into the artist guide', () => {
    const article = getHelpArticle('for-artists');
    const gallery = article?.sections.find(
      (section) => section.heading === 'Artist gallery',
    );

    expect(gallery).toBeDefined();
    expect(
      gallery?.body.some((line) => line.includes('Branding → Gallery')),
    ).toBe(true);
    expect(
      gallery?.body.some((line) => line.includes('Drag a photo to reorder')),
    ).toBe(true);
    expect(
      gallery?.body.some((line) =>
        line.includes('no separate Add images button'),
      ),
    ).toBe(true);
  });

  it('points channel design help at Studio Branding Channel Designer', () => {
    const article = getHelpArticle('channel-design');
    const look = article?.sections.find(
      (section) => section.heading === 'Choose a look',
    );

    expect(look).toBeDefined();
    expect(
      look?.body.some((line) => line.includes('Branding → Channel Designer')),
    ).toBe(true);
  });
});
