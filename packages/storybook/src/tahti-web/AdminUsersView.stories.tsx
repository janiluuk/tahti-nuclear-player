import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminUsersView } from '@tahti-web/views/admin/AdminUsersView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminUsersView> = {
  title: 'Tahti/Admin/AdminUsersView',
  component: AdminUsersView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/users'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminUsersView />
    </div>
  ),
};
