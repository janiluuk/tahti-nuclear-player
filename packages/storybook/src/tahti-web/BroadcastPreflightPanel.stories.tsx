import type { Meta, StoryObj } from '@storybook/react-vite';
import { BroadcastPreflightPanel } from '@tahti-web/components/BroadcastPreflightPanel';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof BroadcastPreflightPanel> = {
  title: 'Tahti/Studio/BroadcastPreflightPanel',
  component: BroadcastPreflightPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Broadcast readiness and show metadata panel. Lives on Studio → Go Live.',
      },
    },
  },
  decorators: [withTahtiRouter('/studio/go-live'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadyForBroadcast: Story = {};
