import { describe, expect, it } from 'vitest';

import { parsePublicTracklist } from './publicTracklist';

describe('parsePublicTracklist', () => {
  it('returns an empty list for missing or invalid payloads', () => {
    expect(parsePublicTracklist(null)).toEqual([]);
    expect(parsePublicTracklist({})).toEqual([]);
    expect(parsePublicTracklist(['nope'])).toEqual([]);
  });

  it('keeps titled cues and drops rows without a title', () => {
    expect(
      parsePublicTracklist([
        {
          id: 'a',
          title: 'Head In The Clouds',
          artist: 'Ben Buitendijk',
          startSec: 0,
        },
        { title: '   ' },
        {
          title: 'Replay',
          artistUsername: 'yaniho',
          startSec: 186,
        },
      ]),
    ).toEqual([
      {
        id: 'a',
        title: 'Head In The Clouds',
        artist: 'Ben Buitendijk',
        artistUsername: null,
        startSec: 0,
      },
      {
        id: 'cue-2',
        title: 'Replay',
        artist: null,
        artistUsername: 'yaniho',
        startSec: 186,
      },
    ]);
  });
});
