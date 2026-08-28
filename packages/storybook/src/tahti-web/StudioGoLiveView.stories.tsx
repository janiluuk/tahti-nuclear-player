import type { Meta, StoryObj } from '@storybook/react-vite';
import { StudioGoLiveView } from '@tahti-web/views/studio/StudioGoLiveView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof StudioGoLiveView> = {
  title: 'Tahti/Studio/StudioGoLiveView',
  component: StudioGoLiveView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Broadcast setup and live-control surface. Lives on Studio → Go Live.',
      },
    },
  },
  decorators: [withTahtiRouter('/studio/go-live'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
