import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminRadioView } from '@tahti-web/views/admin/AdminRadioView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminRadioView> = {
  title: 'Tahti/Admin/AdminRadioView',
  component: AdminRadioView,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/admin/radio'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminRadioView />
    </div>
  ),
};
