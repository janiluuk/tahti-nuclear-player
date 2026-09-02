import { describe, expect, it } from 'vitest';

import {
  adjacentLookElementId,
  CHANNEL_LOOK_ELEMENTS,
  isChannelLookElementId,
} from './channelLookElements';
import { CHANNEL_PAGE_ITEM_TYPES } from './channelPageLayout';

describe('CHANNEL_LOOK_ELEMENTS', () => {
  it('lists every stylable visitor-facing channel piece except chat and overlay', () => {
    const ids = CHANNEL_LOOK_ELEMENTS.map((element) => element.id);
    expect(ids).toEqual([
      'header',
      'player',
      'background',
      'actions',
      'archive',
      'about',
      'links',
      'subscribe',
      'stats',
      'events',
    ]);
    expect(ids).not.toContain('chat');
    expect(ids).not.toContain('textOverlay');
  });

  it('maps disable-able rows onto real layout types', () => {
    const layoutTypes = CHANNEL_LOOK_ELEMENTS.filter(
      (element) => element.canDisable,
    ).map((element) => element.layoutType);
    for (const type of layoutTypes) {
      expect(type).not.toBeNull();
      expect(CHANNEL_PAGE_ITEM_TYPES).toContain(type);
    }
  });
});

describe('adjacentLookElementId', () => {
  it('wraps from the last element to the first', () => {
    expect(adjacentLookElementId('events', 1)).toBe('header');
  });

  it('wraps from the first element to the last', () => {
    expect(adjacentLookElementId('header', -1)).toBe('events');
  });

  it('steps to the next listed element', () => {
    expect(adjacentLookElementId('header', 1)).toBe('player');
    expect(adjacentLookElementId('player', -1)).toBe('header');
  });

  it('falls back to the start of the list for an unknown id', () => {
    expect(adjacentLookElementId('not-a-section', 1)).toBe('player');
  });
});

describe('isChannelLookElementId', () => {
  it('accepts listed ids only', () => {
    expect(isChannelLookElementId('player')).toBe(true);
    expect(isChannelLookElementId('text-overlay')).toBe(false);
    expect(isChannelLookElementId(null)).toBe(false);
  });
});
