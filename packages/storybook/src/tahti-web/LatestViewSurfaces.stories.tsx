import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminContentView } from '@tahti-web/views/admin/AdminContentView';
import { AdminMissedShowsView } from '@tahti-web/views/admin/AdminMissedShowsView';
import { AdminSelectsView } from '@tahti-web/views/admin/AdminSelectsView';
import { StudioScheduleView } from '@tahti-web/views/studio/StudioScheduleView';
import { StudioStatsView } from '@tahti-web/views/studio/StudioStatsView';
import { StudioUploadView } from '@tahti-web/views/studio/StudioUploadView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta = {
  title: 'Tahti/Reference/Latest view surfaces',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Rendered route-level surfaces added or reorganized in the latest Tahti pass. Each story documents the page where the surface lives.',
      },
    },
  },
  decorators: [withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AdminContent: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Admin → Content.' } },
  },
  decorators: [withTahtiRouter('/admin/content')],
  render: () => <AdminContentView />,
};

export const AdminMissedShows: Story = {
  parameters: {
    docs: {
      description: { story: 'Lives on Admin → Moderation → Missed shows.' },
    },
  },
  decorators: [withTahtiRouter('/admin/moderation?tab=missed-shows')],
  render: () => <AdminMissedShowsView />,
};

export const AdminSelects: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Admin → Manage → Selects.' } },
  },
  decorators: [withTahtiRouter('/admin/selects')],
  render: () => <AdminSelectsView />,
};

export const StudioSchedule: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Schedule.' } },
  },
  decorators: [withTahtiRouter('/studio/schedule'), withMockAuth()],
  render: () => <StudioScheduleView />,
};

export const StudioStats: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Stats.' } },
  },
  decorators: [withTahtiRouter('/studio/stats'), withMockAuth()],
  render: () => <StudioStatsView />,
};

export const StudioUpload: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Upload.' } },
  },
  decorators: [withTahtiRouter('/studio/upload'), withMockAuth()],
  render: () => <StudioUploadView />,
};
