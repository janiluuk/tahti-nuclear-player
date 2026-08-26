import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelRadioPlaylistPanel } from '@tahti-web/components/ChannelRadioPlaylistPanel';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof ChannelRadioPlaylistPanel> = {
  title: 'Tahti/Channel/ChannelRadioPlaylistPanel',
  component: ChannelRadioPlaylistPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/studio')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
