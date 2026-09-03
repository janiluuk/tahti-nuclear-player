// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { i18n } from '@tahti-player/i18n';

import {
  applyLocale,
  currentLocale,
  detectLocale,
  LANGUAGE_STORAGE_KEY,
} from './locale';

describe('web locale', () => {
  it('prefers a stored Finnish locale over the browser', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fi_FI');
    expect(detectLocale(['en-US'])).toBe('fi_FI');
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  });

  it('falls back to the browser language when nothing is stored', () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    expect(detectLocale(['fi-FI', 'en'])).toBe('fi_FI');
  });

  it('applies the locale to i18n and the document', async () => {
    await applyLocale('fi_FI');
    expect(currentLocale()).toBe('fi_FI');
    expect(i18n.t('web:nav.listen')).toBe('Kuuntele');
    expect(document.documentElement.lang).toBe('fi-FI');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('fi_FI');
    await applyLocale('en_US');
  });
});
