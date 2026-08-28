import { describe, expect, it } from 'vitest';

import { parseYouTubeLikedSongs } from './parser';

describe('parseYouTubeLikedSongs', () => {
  it('extracts liked-song renderer fields from a YouTube Music response', () => {
    const songs = parseYouTubeLikedSongs({
      contents: [
        {
          musicResponsiveListItemRenderer: {
            playlistItemData: { videoId: 'abc123' },
            flexColumns: [
              {
                musicResponsiveListItemFlexColumnRenderer: {
                  text: { runs: [{ text: 'Signal Bloom' }] },
                },
              },
              {
                musicResponsiveListItemFlexColumnRenderer: {
                  text: {
                    runs: [
                      { text: 'Northern Lights' },
                      { text: ' • ' },
                      { text: 'Album' },
                    ],
                  },
                },
              },
            ],
            thumbnail: {
              musicThumbnailRenderer: {
                thumbnail: { thumbnails: [{ url: 'small' }, { url: 'large' }] },
              },
            },
          },
        },
      ],
    });

    expect(songs).toEqual([
      {
        title: 'Signal Bloom',
        artist: 'Northern Lights',
        videoId: 'abc123',
        artworkUrl: 'large',
      },
    ]);
  });

  it('ignores renderers without a video id or title', () => {
    expect(
      parseYouTubeLikedSongs({ musicResponsiveListItemRenderer: {} }),
    ).toEqual([]);
  });
});
