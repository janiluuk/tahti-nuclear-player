import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminStreamManagerPanel } from '@tahti-web/components/AdminStreamManagerPanel';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminStreamManagerPanel> = {
  title: 'Tahti/Admin/AdminStreamManagerPanel',
  component: AdminStreamManagerPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Shared live-stream operations surface. Lives on Admin → Overview and Admin → Streams.',
      },
    },
  },
  decorators: [withTahtiRouter('/admin/streams'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FullPanel: Story = {};

export const EmbeddedWithoutHeading: Story = {
  args: { showHeading: false },
};
