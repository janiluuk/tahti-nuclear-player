import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminStatusView } from '@tahti-web/views/admin/AdminStatusView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminStatusView> = {
  title: 'Tahti/Admin/AdminStatusView',
  component: AdminStatusView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/status'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminStatusView />
    </div>
  ),
};
