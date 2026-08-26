import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminActivityView } from '@tahti-web/views/admin/AdminActivityView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminActivityView> = {
  title: 'Tahti/Admin/AdminActivityView',
  component: AdminActivityView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/activity'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminActivityView />
    </div>
  ),
};
