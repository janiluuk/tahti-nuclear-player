import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListenAddonsPanel } from '@tahti-web/components/ListenAddonsPanel';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof ListenAddonsPanel> = {
  title: 'Tahti/Widgets/ListenAddonsPanel',
  component: ListenAddonsPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Favorites plus SoundCloud, Spotify, YouTube, hearthis.at, and Bandcamp — the same Listen catalog as Settings → Add-ons. The Listen-page add-widget dialog uses the compact available-first layout.',
      },
    },
  },
  decorators: [withTahtiRouter('/'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StoreCategory: Story = {};

export const AddWidgetPicker: Story = {
  args: {
    initialTab: 'available',
    compact: true,
  },
};
