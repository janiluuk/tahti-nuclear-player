import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminVendorsView } from '@tahti-web/views/admin/AdminVendorsView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminVendorsView> = {
  title: 'Tahti/Admin/AdminVendorsView',
  component: AdminVendorsView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/vendors'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminVendorsView />
    </div>
  ),
};
