import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreamManagerPanel } from '@tahti-web/components/StreamManagerPanel';
import { fn } from 'storybook/test';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof StreamManagerPanel> = {
  title: 'Tahti/Studio/StreamManagerPanel',
  component: StreamManagerPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/channel/northern-lights')],
  args: {
    slug: 'northern-lights',
    onPlaybackToggle: fn(),
    onMuteToggle: fn(),
    onEnded: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Self-fetches signal/stats/rotation state from the mocked API layer, so
// most of the panel's content (bitrate, listeners, rotation track) comes
// from fixtures regardless of these args.
export const Default: Story = {
  args: {
    channelState: 'LIVE',
    isPlaying: true,
    isMuted: false,
  },
  render: (args) => (
    <div className="max-w-md">
      <StreamManagerPanel {...args} />
    </div>
  ),
};

export const Offline: Story = {
  args: {
    channelState: 'OFFLINE',
    isPlaying: false,
    isMuted: false,
  },
  render: (args) => (
    <div className="max-w-md">
      <StreamManagerPanel {...args} />
    </div>
  ),
};
