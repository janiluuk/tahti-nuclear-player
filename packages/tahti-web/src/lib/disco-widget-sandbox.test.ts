import { describe, expect, it } from 'vitest';

import {
  DISCO_WIDGET_ROOT_ELEMENT_ID,
  isWidgetToHostMessage,
} from './disco-widget-protocol';
import { sandboxDocumentHtml } from './disco-widget-sandbox';
import {
  bundleHashToIntegrity,
  isValidBundleHashHex,
} from './disco-widget-sri';

const HASH = 'a'.repeat(64);

describe('disco-widget SRI', () => {
  it('accepts a 64-char hex hash and rejects anything else', () => {
    expect(isValidBundleHashHex(HASH)).toBe(true);
    expect(isValidBundleHashHex('not-a-hash')).toBe(false);
    expect(isValidBundleHashHex(`${HASH}a`)).toBe(false);
  });

  it('encodes the integrity attribute as sha256-base64', () => {
    expect(bundleHashToIntegrity(HASH)).toMatch(/^sha256-[A-Za-z0-9+/]+=*$/);
  });
});

describe('sandboxDocumentHtml', () => {
  it('returns null for an invalid hash', () => {
    expect(sandboxDocumentHtml('nope')).toBeNull();
  });

  it('pins the bundle by SRI and mounts into the SDK root id', () => {
    const html = sandboxDocumentHtml(HASH);
    expect(html).toContain(`id="${DISCO_WIDGET_ROOT_ELEMENT_ID}"`);
    expect(html).toContain(`/widget-sandbox/bundle/${HASH}`);
    expect(html).toContain(`integrity="${bundleHashToIntegrity(HASH)}"`);
  });
});

describe('isWidgetToHostMessage', () => {
  it('accepts ready messages from the disco-widget source', () => {
    expect(
      isWidgetToHostMessage({ source: 'disco-widget', type: 'ready' }),
    ).toBe(true);
  });

  it('rejects messages from any other source', () => {
    expect(isWidgetToHostMessage({ source: 'other', type: 'ready' })).toBe(
      false,
    );
  });
});
