import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddToPlaylistPanel } from '@tahti-web/components/AddToPlaylistPanel';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AddToPlaylistPanel> = {
  title: 'Tahti/Media/AddToPlaylistPanel',
  component: AddToPlaylistPanel,
  parameters: { layout: 'centered' },
  decorators: [withTahtiRouter('/library')],
  args: {
    isOpen: true,
    archiveItemId: 'archive-item-1',
    trackTitle: 'Northern Lights — Aurora',
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  decorators: [withMockAuth()],
};

export const SignedOut: Story = {
  decorators: [withMockAuth(null)],
};
