import type { Meta, StoryObj } from '@storybook/react-vite';
import { FavoritesPanel } from '@tahti-web/components/FavoritesPanel';

const meta = {
  title: 'Tahti/Library/FavoritesPanel',
  component: FavoritesPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Left-side library panel for newest-first saved tracks, playlists, channels, and artists. Playlist and artist entries can show the New state until opened.',
      },
    },
  },
} satisfies Meta<typeof FavoritesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
