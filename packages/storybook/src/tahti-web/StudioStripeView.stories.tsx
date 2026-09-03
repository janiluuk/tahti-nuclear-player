import type { Meta, StoryObj } from '@storybook/react-vite';
import { StudioStripeView } from '@tahti-web/views/studio/StudioStripeView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof StudioStripeView> = {
  title: 'Tahti/Studio/StudioStripeView',
  component: StudioStripeView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Payout-account dashboard: Connect status, Express login, and charges. Studio nav only lists it when Stripe is configured. Lives on Studio → Stripe.',
      },
    },
  },
  decorators: [withTahtiRouter('/studio/stripe'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {};
