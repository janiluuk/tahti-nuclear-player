import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelChatPanel } from '@tahti-web/components/ChannelChatPanel';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

/**
 * ChannelChatPanel fetches history/access via the mocked API layer (fine
 * in Storybook), then opens a real WebSocket to Centrifugo for live
 * updates. There's no Centrifugo server in Storybook, so the socket will
 * fail to connect and the panel falls back to its "rest" mode — chat
 * history renders, but the "Live" badge stays off and sending shows the
 * "not connected" error unless VITE_FORCE_MOCK also flips it into local
 * echo ("mock") mode, which it does here.
 */
const meta: Meta<typeof ChannelChatPanel> = {
  title: 'Tahti/Channel/ChannelChatPanel',
  component: ChannelChatPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/northern-lights')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  decorators: [withMockAuth(null)],
  args: {
    slug: 'northern-lights',
  },
};

export const SignedIn: Story = {
  decorators: [withMockAuth()],
  args: {
    slug: 'northern-lights',
  },
};

export const Compact: Story = {
  decorators: [withMockAuth()],
  args: {
    slug: 'northern-lights',
    compact: true,
  },
};

export const Rail: Story = {
  name: 'Right-rail height',
  decorators: [withMockAuth()],
  render: (args) => (
    <div className="h-[32rem]">
      <ChannelChatPanel {...args} />
    </div>
  ),
  args: {
    slug: 'northern-lights',
    rail: true,
  },
};
