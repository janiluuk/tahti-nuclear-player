import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelView } from '@tahti-web/views/ChannelView';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof ChannelView> = {
  title: 'Tahti/Channel/ChannelView',
  component: ChannelView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The public channel page, assembled from the eight Channel Designer blocks (`hero`, `actions`, `archive`, `chat`, `about`, `links`, `textOverlay`, `subscribe` — see `../lib/channelPageLayout.ts`). Each block is rendered by `ChannelView`’s own `renderBlock` switch, not a standalone component per block.',
      },
    },
  },
  args: { slug: 'northern-lights' },
  decorators: [withTahtiRouter('/channel/northern-lights')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Visitor: Story = {
  decorators: [withMockAuth(MOCK_USERS.listener)],
};

// Signed in as the channel owner. Click "Edit design" in the header to open
// the live Channel Designer layout editor (add/reorder/show-hide for all
// eight blocks, including the Subscribe CTA).
export const Owner: Story = {
  decorators: [withMockAuth(MOCK_USERS.artist)],
};
