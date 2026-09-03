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
  args: { current: '/studio', global: true },
};

export const PerformActive: Story = {
  args: { current: '/studio/schedule', global: true },
};

export const LibraryActive: Story = {
  args: { current: '/library', global: true },
};

export const GrowActive: Story = {
  args: { current: '/studio/insights/archive/1', global: true },
};

export const ManageActive: Story = {
  args: { current: '/studio/channel', global: true },
};

export const ManageRadioActive: Story = {
  args: { current: '/studio/channel?tab=radio', global: true },
};

export const ManageSourcesActive: Story = {
  args: { current: '/sources', global: true },
  decorators: [withTahtiRouter('/sources')],
};

export const NoCurrentRoute: Story = {
  args: { global: true },
};

export const NestedPerformRoute: Story = {
  args: { current: '/studio/shows/weekly-session', global: true },
  decorators: [withTahtiRouter('/studio/shows/weekly-session')],
};

export const MobileOverflow: Story = {
  args: { current: '/studio/channel', global: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
