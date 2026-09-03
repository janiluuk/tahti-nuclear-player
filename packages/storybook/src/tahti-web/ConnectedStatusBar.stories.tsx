import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBarContent } from '@tahti-web/components/ConnectedStatusBar';

import { BottomBar } from '@tahti-player/ui';

import { withPageSurface } from './_lib/decorators';

const meta: Meta = {
  title: 'Tahti/Layout/ConnectedStatusBar',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shown when the compact player bar is hidden (signed-in). Matches Storybook Layout/BottomBar StatusBar: library totals + inbox chips left, encoding progress right.',
      },
    },
  },
  decorators: [withPageSurface()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  render: () => (
    <BottomBar className="px-5">
      <StatusBarContent
        soundCount={42}
        unreadNotifications={0}
        unreadMessages={0}
        encodingLabel={null}
      />
    </BottomBar>
  ),
};

export const Encoding: Story = {
  render: () => (
    <BottomBar className="px-5">
      <StatusBarContent
        soundCount={128}
        unreadNotifications={3}
        unreadMessages={1}
        encodingLabel="Encoding “Midnight Drift”…"
      />
    </BottomBar>
  ),
};
