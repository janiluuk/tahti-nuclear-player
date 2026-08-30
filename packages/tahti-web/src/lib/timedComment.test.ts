import { describe, expect, it } from 'vitest';

import {
  clockToSeconds,
  formatTimedCommentBody,
  parseTimedComment,
} from './timedComment';

describe('timedComment', () => {
  it('parses a leading clock stamp from a comment body', () => {
    expect(parseTimedComment('[11:01] love this break')).toEqual({
      timestamp: '11:01',
      seconds: 661,
      text: 'love this break',
    });
  });

  it('parses hour-long stamps', () => {
    expect(parseTimedComment('[1:27:29] closer')).toEqual({
      timestamp: '1:27:29',
      seconds: 5249,
      text: 'closer',
    });
  });

  it('leaves unstamped comments unchanged', () => {
    expect(parseTimedComment('Thanks for joining!')).toEqual({
      timestamp: null,
      seconds: null,
      text: 'Thanks for joining!',
    });
  });

  it('formats a stamp prefix for posting', () => {
    expect(formatTimedCommentBody('11:01', 'nice')).toBe('[11:01] nice');
  });

  it('converts clocks to seconds', () => {
    expect(clockToSeconds('0:00')).toBe(0);
    expect(clockToSeconds('3:40')).toBe(220);
    expect(clockToSeconds('not-a-clock')).toBeNull();
  });
});
