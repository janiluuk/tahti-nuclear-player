import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminNav } from '@tahti-web/components/AdminNav';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminNav> = {
  title: 'Tahti/Admin/AdminNav',
  component: AdminNav,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/admin')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    current: '/admin',
  },
};

export const ModerationActive: Story = {
  args: {
    current: '/admin/moderation',
  },
};

export const NestedModerationRoute: Story = {
  args: {
    current: '/admin/moderation/feature-requests',
  },
  decorators: [withTahtiRouter('/admin/moderation/feature-requests')],
};
