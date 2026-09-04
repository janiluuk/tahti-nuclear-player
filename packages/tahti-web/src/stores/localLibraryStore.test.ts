import { describe, expect, it } from 'vitest';

import {
  fileStem,
  isAudioFile,
  playableFromLocalTrack,
} from './localLibraryStore';

describe('localLibraryStore helpers', () => {
  it('strips the extension from a file name', () => {
    expect(fileStem('Blue Hour.flac')).toBe('Blue Hour');
    expect(fileStem('riff')).toBe('riff');
  });

  it('accepts audio by MIME type or extension', () => {
    expect(isAudioFile(new File([], 'take.flac'))).toBe(true);
    expect(isAudioFile(new File([], 'take.mp3', { type: 'audio/mpeg' }))).toBe(
      true,
    );
    expect(isAudioFile(new File([], 'cover.jpg', { type: 'image/jpeg' }))).toBe(
      false,
    );
  });

  it('builds a blob playable for the shared player', () => {
    const playable = playableFromLocalTrack({
      id: 'abc',
      title: 'Blue Hour',
      artist: 'Local file',
      fileName: 'Blue Hour.flac',
      objectUrl: 'blob:http://localhost/1',
      addedAt: '2026-09-04T00:00:00.000Z',
    });
    expect(playable.id).toBe('local:abc');
    expect(playable.streamUrl).toBe('blob:http://localhost/1');
    expect(playable.sourceProvider).toBe('local');
    expect(playable.protocol).toBe('https');
  });
});
