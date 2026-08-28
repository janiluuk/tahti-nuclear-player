import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminMissedShowsView } from '@tahti-web/views/admin/AdminMissedShowsView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminMissedShowsView> = {
  title: 'Tahti/Admin/AdminMissedShowsView',
  component: AdminMissedShowsView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/admin/missed-shows'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Queue: Story = {};
