import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminLogsView } from '@tahti-web/views/admin/AdminLogsView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminLogsView> = {
  title: 'Tahti/Admin/AdminLogsView',
  component: AdminLogsView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/logs'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminLogsView />
    </div>
  ),
};
