import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';

import { i18n } from '@tahti-player/i18n';

import { applyLocale, LANGUAGE_STORAGE_KEY } from '../lib/locale';
import { LanguageSwitcher } from './LanguageSwitcher';

afterEach(async () => {
  cleanup();
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  await applyLocale('en_US');
});

describe('LanguageSwitcher', () => {
  it('lists Finnish and switches the live catalog', async () => {
    await applyLocale('en_US');
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>,
    );

    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'English' }));
    await user.click(screen.getByRole('option', { name: 'Suomi' }));

    expect(i18n.language).toBe('fi_FI');
    expect(screen.getByLabelText('Kieli')).toBeInTheDocument();
  });
});
