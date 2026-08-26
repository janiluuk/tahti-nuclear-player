import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminDashboardView } from '@tahti-web/views/admin/AdminDashboardView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminDashboardView> = {
  title: 'Tahti/Admin/AdminDashboardView',
  component: AdminDashboardView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminDashboardView />
    </div>
  ),
};
