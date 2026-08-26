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

/** A tool-group route auto-expands the "Studio tools" panel on mount. */
export const ToolActive: Story = {
  args: { current: '/studio/schedule' },
};

export const NoCurrentRoute: Story = {
  args: {},
};
