// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import { applyLocale, LANGUAGE_STORAGE_KEY } from '../lib/locale';
import { LanguageSwitcher } from './LanguageSwitcher';

afterEach(async () => {
  document.body.replaceChildren();
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  await applyLocale('en_US');
});

describe('LanguageSwitcher', () => {
  it('renders the language picker with the live catalog', async () => {
    await applyLocale('en_US');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(<LanguageSwitcher />);
    });

    expect(container.querySelector('label')?.textContent).toContain('Language');
    expect(container.querySelector('button')?.textContent).toContain('English');
  });
});
