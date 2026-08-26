import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { RightRailPanel } from '@tahti-web/components/RightRailPanel';
import { useLayoutStore } from '@tahti-web/stores/layoutStore';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

/** Seeds layoutStore's chat context before render — RightRailPanel reads it
 * directly via `useLayoutStore` rather than through props. */
function withChatContext(
  ctx: {
    chatSlug: string | null;
    chatEnabled: boolean;
    chatDisabledReason?: string | null;
  } = { chatSlug: null, chatEnabled: false },
): Decorator {
  return (Story) => {
    useLayoutStore.setState({
      chatSlug: ctx.chatSlug,
      chatEnabled: ctx.chatEnabled,
      chatDisabledReason: ctx.chatDisabledReason ?? null,
    });
    return <Story />;
  };
}

const meta: Meta<typeof RightRailPanel> = {
  title: 'Tahti/Misc/RightRailPanel',
  component: RightRailPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  decorators: [withChatContext()],
  args: { isCollapsed: true },
};

export const NoChannelOpen: Story = {
  name: 'Chat unavailable',
  decorators: [
    withChatContext({
      chatSlug: null,
      chatEnabled: false,
      chatDisabledReason: 'Open a channel with chat enabled.',
    }),
  ],
  args: { isCollapsed: false },
  render: (args) => (
    <div className="h-[32rem]">
      <RightRailPanel {...args} />
    </div>
  ),
};

/** Chat history/access fetch through the mocked API layer; there's no
 * Centrifugo server in Storybook, so the socket fails and the panel falls
 * back to local-echo ("mock") mode — see ChannelChatPanel.stories.tsx. */
export const ChatOpen: Story = {
  decorators: [
    withMockAuth(),
    withChatContext({ chatSlug: 'northern-lights', chatEnabled: true }),
  ],
  args: { isCollapsed: false },
  render: (args) => (
    <div className="h-[32rem]">
      <RightRailPanel {...args} />
    </div>
  ),
};
