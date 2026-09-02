export const DEFAULT_LOCALE = 'en_US';

export const SUPPORTED_LOCALES = [
  { code: 'en_US', nativeLabel: 'English' },
  { code: 'fi_FI', nativeLabel: 'Suomi' },
  { code: 'de_DE', nativeLabel: 'Deutsch' },
  { code: 'es_ES', nativeLabel: 'Español' },
  { code: 'fr_FR', nativeLabel: 'Français' },
  { code: 'it_IT', nativeLabel: 'Italiano' },
  { code: 'ja_JP', nativeLabel: '日本語' },
  { code: 'pl_PL', nativeLabel: 'Polski' },
  { code: 'pt_BR', nativeLabel: 'Português (Brasil)' },
  { code: 'ru_RU', nativeLabel: 'Русский' },
  { code: 'zh_CN', nativeLabel: '简体中文' },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['code'];

export function isLocaleCode(
  value: string | null | undefined,
): value is LocaleCode {
  return SUPPORTED_LOCALES.some((locale) => locale.code === value);
}

export function toBcp47(locale: LocaleCode): string {
  return locale.replaceAll('_', '-');
}

function normalizeTag(value: string): string {
  return value.trim().replaceAll('-', '_');
}

export function matchBrowserLocales(languages: readonly string[]): LocaleCode {
  for (const language of languages) {
    const normalized = normalizeTag(language);
    if (!normalized) {
      continue;
    }
    const exact = SUPPORTED_LOCALES.find(
      (locale) => locale.code.toLowerCase() === normalized.toLowerCase(),
    );
    if (exact) {
      return exact.code;
    }
    const languagePrefix = normalized.split('_')[0]?.toLowerCase();
    if (!languagePrefix) {
      continue;
    }
    const byPrefix = SUPPORTED_LOCALES.find((locale) =>
      locale.code.toLowerCase().startsWith(`${languagePrefix}_`),
    );
    if (byPrefix) {
      return byPrefix.code;
    }
  }
  return DEFAULT_LOCALE;
}
