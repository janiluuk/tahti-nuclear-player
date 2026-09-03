import { describe, expect, it } from 'vitest';

import {
  imageUploadTypeError,
  resolveImageUploadContentType,
} from './imageUploadContentType';

describe('resolveImageUploadContentType', () => {
  it('accepts jpeg/png/webp MIME types and normalizes image/jpg', () => {
    expect(
      resolveImageUploadContentType(
        new File([], 'a.jpg', { type: 'image/jpeg' }),
      ),
    ).toBe('image/jpeg');
    expect(
      resolveImageUploadContentType(
        new File([], 'a.jpg', { type: 'image/jpg' }),
      ),
    ).toBe('image/jpeg');
    expect(
      resolveImageUploadContentType(
        new File([], 'a.png', { type: 'image/png' }),
      ),
    ).toBe('image/png');
    expect(
      resolveImageUploadContentType(
        new File([], 'a.webp', { type: 'image/webp' }),
      ),
    ).toBe('image/webp');
  });

  it('falls back to the file extension when MIME is missing', () => {
    expect(
      resolveImageUploadContentType(new File([], 'cover.JPEG', { type: '' })),
    ).toBe('image/jpeg');
    expect(
      resolveImageUploadContentType(new File([], 'cover.png', { type: '' })),
    ).toBe('image/png');
  });

  it('rejects svg/gif/heic instead of pretending they are png', () => {
    expect(
      resolveImageUploadContentType(
        new File([], 'logo.svg', { type: 'image/svg+xml' }),
      ),
    ).toBeNull();
    expect(
      resolveImageUploadContentType(
        new File([], 'logo.gif', { type: 'image/gif' }),
      ),
    ).toBeNull();
    expect(
      resolveImageUploadContentType(new File([], 'logo.heic', { type: '' })),
    ).toBeNull();
    expect(imageUploadTypeError(new File([], 'logo.svg'))).toMatch(/JPEG/);
  });
});
