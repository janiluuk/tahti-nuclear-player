import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminStorageView } from '@tahti-web/views/admin/AdminStorageView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminStorageView> = {
  title: 'Tahti/Admin/AdminStorageView',
  component: AdminStorageView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/storage'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminStorageView />
    </div>
  ),
};
