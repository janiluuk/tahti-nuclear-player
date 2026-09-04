import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// The sidebar/toolbar chrome already renders dark by default in this
// Storybook build, but addon-docs' embedded "Canvas" preview cards use a
// SEPARATE manager-level theme color (`appContentBg`/`appPreviewBg`) for
// their background — unrelated to preview.ts's `data-theme`/`data-theme-id`
// globals, which only theme the actual rendered components. Left at
// Storybook's default light theme, every Docs page showed the real
// (correctly dark-themed) component previews sitting inside a jarring
// white card. Setting a `base: 'dark'` manager theme here fixes that
// wrapper's background to match — this is a static, build-time choice
// (the manager theme isn't reactive to the preview's Mode toggle), not a
// second dark-mode switch.
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Tahti',
    brandUrl: 'https://beta.tahti.live',
    brandImage: '/tahti-logo.svg',
    brandTarget: '_self',
    appBg: '#0b0d12',
    appContentBg: '#12151c',
    appPreviewBg: '#12151c',
    appBorderColor: '#262b36',
    barBg: '#0b0d12',
    barTextColor: '#a7adba',
    barSelectedColor: '#7dd3fc',
    textColor: '#e6e9f0',
    textMutedColor: '#8a90a2',
    inputBg: '#171b24',
    inputBorder: '#262b36',
    inputTextColor: '#e6e9f0',
  }),
});
