import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminNewsView } from '@tahti-web/views/admin/AdminNewsView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminNewsView> = {
  title: 'Tahti/Admin/AdminNewsView',
  component: AdminNewsView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/news'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminNewsView />
    </div>
  ),
};
