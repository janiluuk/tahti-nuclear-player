import type {
  NuclearPlugin,
  NuclearPluginAPI,
} from '@nuclearplayer/plugin-sdk';

const SETTING_ID = 'showWelcome';

const plugin: NuclearPlugin = {
  async onLoad(api: NuclearPluginAPI) {
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

  async onEnable(api: NuclearPluginAPI) {
    const enabled = await api.Settings.get<boolean>(SETTING_ID);
    if (enabled) {
      api.Logger.info('Example settings plugin enabled.');
    }
  },

  onDisable(api: NuclearPluginAPI) {
    api.Logger.info('Example settings plugin disabled.');
  },
};

export default plugin;
