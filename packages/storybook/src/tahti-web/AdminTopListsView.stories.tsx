import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminTopListsView } from '@tahti-web/views/admin/AdminTopListsView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminTopListsView> = {
  title: 'Tahti/Admin/AdminTopListsView',
  component: AdminTopListsView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/top-lists'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminTopListsView />
    </div>
  ),
};
