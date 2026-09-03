import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Tahti/Settings/RadioBrowserDirectory',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Add-ons → Radio → Radio Browser directory. ConfigurableCard + Activate; Configure opens Browser | Stations tabs. Browser: Input startAddon SearchIcon, FilterChips multi-genre, flag country Select. Stations: favourites + Finnish suggestions. Missing states: SaveButton → Listen radio tiles; standalone story (card is file-private inside PluginStorePanel).',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const DocsOnly: Story = {
  render: () => (
    <p className="text-foreground-secondary max-w-lg text-sm">
      Production lives under Settings → Add-ons → Radio. Open Configure on Radio
      Browser directory to exercise Browser and Stations tabs.
    </p>
  ),
};
