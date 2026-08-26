import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  MediaIconActions,
  playQueueFavoriteActions,
} from '@tahti-web/components/MediaIconActions';

const meta: Meta<typeof MediaIconActions> = {
  title: 'Tahti/Media/MediaIconActions',
  component: MediaIconActions,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions: playQueueFavoriteActions({
      onPlay: () => {},
      onQueue: () => {},
      onFavorite: () => {},
    }),
  },
};

export const Queued: Story = {
  args: {
    actions: playQueueFavoriteActions({
      onPlay: () => {},
      onQueue: () => {},
      onFavorite: () => {},
      queued: true,
    }),
  },
};

export const Favorited: Story = {
  args: {
    actions: playQueueFavoriteActions({
      onPlay: () => {},
      onQueue: () => {},
      onFavorite: () => {},
      favorited: true,
    }),
  },
};

export const NoFavorite: Story = {
  args: {
    actions: playQueueFavoriteActions({
      onPlay: () => {},
      onQueue: () => {},
    }),
  },
};
