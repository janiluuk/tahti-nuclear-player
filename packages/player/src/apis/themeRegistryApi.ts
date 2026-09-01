import {
  AdvancedThemeSchema,
  MarketplaceThemeRegistrySchema,
} from '@tahti-player/themes';

import { ApiClient } from './ApiClient';

class ThemeRegistryApi extends ApiClient {
  constructor() {
    super('https://raw.githubusercontent.com/janiluuk/tahti-registry/master');
  }

  async getThemes() {
    const registry = await this.fetch(
      '/themes.json',
      MarketplaceThemeRegistrySchema,
    );
    return registry.themes;
  }

  async getThemeFile(path: string) {
    return this.fetch(`/${path}`, AdvancedThemeSchema);
  }
}

export const themeRegistryApi = new ThemeRegistryApi();
