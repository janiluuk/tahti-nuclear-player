import { type FC } from 'react';

import {
  isLocaleCode,
  SUPPORTED_LOCALES,
  useTranslation,
} from '@tahti-player/i18n';
import { Select } from '@tahti-player/ui';

import { applyLocale, currentLocale } from '../lib/locale';

export const LanguageSwitcher: FC = () => {
  const { t } = useTranslation('web');

  return (
    <Select
      id="app-language"
      label={t('language.label')}
      description={t('language.description')}
      options={SUPPORTED_LOCALES.map((locale) => ({
        id: locale.code,
        label: locale.nativeLabel,
      }))}
      value={currentLocale()}
      onValueChange={(value) => {
        if (isLocaleCode(value)) {
          void applyLocale(value);
        }
      }}
    />
  );
};
