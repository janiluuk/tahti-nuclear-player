import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE } from './locales';
import de_DE from './locales/de_DE.json';
import en_US from './locales/en_US.json';
import es_ES from './locales/es_ES.json';
import fi_FI from './locales/fi_FI.json';
import fr_FR from './locales/fr_FR.json';
import it_IT from './locales/it_IT.json';
import ja_JP from './locales/ja_JP.json';
import pl_PL from './locales/pl_PL.json';
import pt_BR from './locales/pt_BR.json';
import ru_RU from './locales/ru_RU.json';
import zh_CN from './locales/zh_CN.json';

export const resources = {
  en_US,
  fi_FI,
  de_DE,
  es_ES,
  fr_FR,
  it_IT,
  ja_JP,
  pl_PL,
  pt_BR,
  ru_RU,
  zh_CN,
} as const;

i18n.use(initReactI18next).init({
  showSupportNotice: false, // disables console.log advertisement spam
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: [
    'common',
    'navigation',
    'search',
    'artist',
    'themes',
    'settings',
    'dashboard',
    'plugins',
    'streaming',
    'web',
  ],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
