import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddToPlaylistButton } from '@tahti-web/components/AddToPlaylistButton';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AddToPlaylistButton> = {
  title: 'Tahti/Media/AddToPlaylistButton',
  component: AddToPlaylistButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/library'), withMockAuth()],
  args: {
    archiveItemId: 'archive-item-1',
    trackTitle: 'Northern Lights — Aurora',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const IconOnly: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    iconOnly: false,
  },
};

export const SecondaryVariant: Story = {
  args: {
    iconOnly: false,
    variant: 'secondary',
  },
};
