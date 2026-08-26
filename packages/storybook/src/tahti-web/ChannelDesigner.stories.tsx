import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelDesigner } from '@tahti-web/components/ChannelDesigner';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof ChannelDesigner> = {
  title: 'Tahti/Channel/ChannelDesigner',
  component: ChannelDesigner,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/studio')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    displayName: 'Northern Lights',
    username: 'northern-lights',
    channelSlug: 'northern-lights',
    bio: 'Ambient / downtempo, streaming most weeknights.',
  },
};

export const Compact: Story = {
  name: 'Compact (profile tab)',
  args: {
    displayName: 'Northern Lights',
    username: 'northern-lights',
    channelSlug: 'northern-lights',
    compact: true,
  },
};

export const LookOnly: Story = {
  name: 'Look-only (docked in layers menu)',
  args: {
    displayName: 'Northern Lights',
    username: 'northern-lights',
    channelSlug: 'northern-lights',
    lookOnly: true,
  },
};

export const NoLivePreview: Story = {
  name: 'No live preview (avoid dual WebGL contexts)',
  args: {
    displayName: 'Northern Lights',
    username: 'northern-lights',
    channelSlug: 'northern-lights',
    livePreview: false,
  },
};
