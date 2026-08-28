import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminContentView } from '@tahti-web/views/admin/AdminContentView';
import { AdminMissedShowsView } from '@tahti-web/views/admin/AdminMissedShowsView';
import { AdminSelectsView } from '@tahti-web/views/admin/AdminSelectsView';
import { StudioArchiveItemView } from '@tahti-web/views/studio/StudioArchiveItemView';
import { StudioBrandingView } from '@tahti-web/views/studio/StudioBrandingView';
import { StudioChannelView } from '@tahti-web/views/studio/StudioChannelView';
import { StudioCollectionsView } from '@tahti-web/views/studio/StudioCollectionsView';
import { StudioDistributionView } from '@tahti-web/views/studio/StudioDistributionView';
import { StudioEventsView } from '@tahti-web/views/studio/StudioEventsView';
import { StudioModerationView } from '@tahti-web/views/studio/StudioModerationView';
import { StudioReleasesView } from '@tahti-web/views/studio/StudioReleasesView';
import { StudioRevenueView } from '@tahti-web/views/studio/StudioRevenueView';
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

export const StudioArchiveItem: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Lives on Studio → Music → Sounds → track editor.',
      },
    },
  },
  decorators: [withTahtiRouter('/studio/archive/track-northern-signals')],
  render: () => <StudioArchiveItemView id="track-northern-signals" />,
};

export const StudioCollections: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Music → Collections.' } },
  },
  decorators: [withTahtiRouter('/studio/collections')],
  render: () => <StudioCollectionsView />,
};

export const StudioReleases: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Music → Releases.' } },
  },
  decorators: [withTahtiRouter('/studio/releases')],
  render: () => <StudioReleasesView />,
};

export const StudioRevenue: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Revenue.' } },
  },
  decorators: [withTahtiRouter('/studio/revenue')],
  render: () => <StudioRevenueView />,
};

export const StudioDistribution: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Distribution.' } },
  },
  decorators: [withTahtiRouter('/studio/distribution')],
  render: () => <StudioDistributionView />,
};

export const StudioChannel: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Manage → Channel.' } },
  },
  decorators: [withTahtiRouter('/studio/channel')],
  render: () => <StudioChannelView />,
};

export const StudioBranding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Lives on Settings → Artist → Branding and Studio → Manage → Branding.',
      },
    },
  },
  decorators: [withTahtiRouter('/studio/branding')],
  render: () => <StudioBrandingView />,
};

export const StudioModeration: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Manage → Moderation.' } },
  },
  decorators: [withTahtiRouter('/studio/moderation')],
  render: () => <StudioModerationView />,
};

export const StudioEvents: Story = {
  parameters: {
    docs: { description: { story: 'Lives on Studio → Events.' } },
  },
  decorators: [withTahtiRouter('/studio/events')],
  render: () => <StudioEventsView />,
};
