import type { TahtiPlugin, TahtiPluginAPI } from '@tahti-player/plugin-sdk';

const SETTING_ID = 'showWelcome';

const plugin: TahtiPlugin = {
  async onLoad(api: TahtiPluginAPI) {
    await api.Settings.register([
      {
        id: SETTING_ID,
        title: 'Show welcome message',
        description: 'Display a short message when the plugin is enabled.',
        category: 'Example plugin',
        kind: 'boolean',
        default: true,
        widget: { type: 'toggle' },
      },
    ]);
  },

  async onEnable(api: TahtiPluginAPI) {
    const enabled = await api.Settings.get<boolean>(SETTING_ID);
    if (enabled) {
      api.Logger.info('Example settings plugin enabled.');
    }
  },

  onDisable(api: TahtiPluginAPI) {
    api.Logger.info('Example settings plugin disabled.');
  },
};

export default plugin;
