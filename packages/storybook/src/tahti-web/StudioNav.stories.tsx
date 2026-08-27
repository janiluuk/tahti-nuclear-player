import type { Meta, StoryObj } from '@storybook/react-vite';
import { StudioNav } from '@tahti-web/components/StudioNav';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof StudioNav> = {
  title: 'Tahti/Studio/StudioNav',
  component: StudioNav,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/studio')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { current: '/studio' },
};

export const PerformActive: Story = {
  args: { current: '/studio/schedule' },
};

export const LibraryActive: Story = {
  args: { current: '/studio/archive' },
};

export const GrowActive: Story = {
  args: { current: '/studio/insights/archive/1' },
};

export const ManageActive: Story = {
  args: { current: '/studio/channel' },
};

export const ManageRadioActive: Story = {
  args: { current: '/studio/channel?tab=radio' },
};

export const ManageSourcesActive: Story = {
  args: { current: '/sources' },
  decorators: [withTahtiRouter('/sources')],
};

export const NoCurrentRoute: Story = {
  args: {},
};

export const NestedPerformRoute: Story = {
  args: { current: '/studio/shows/weekly-session' },
  decorators: [withTahtiRouter('/studio/shows/weekly-session')],
};

export const MobileOverflow: Story = {
  args: { current: '/studio/channel' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
