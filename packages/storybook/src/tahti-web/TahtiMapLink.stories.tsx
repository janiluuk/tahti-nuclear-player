import type { Meta, StoryObj } from '@storybook/react-vite';
import { TahtiMapLink } from '@tahti-web/components/TahtiMapLink';

import { withTahtiRouter } from './_lib/decorators';

/**
 * Renders `null` unless `diagnosticsEnabled` (`import.meta.env.DEV ||
 * VITE_ENABLE_DIAGNOSTICS === '1'`) — true while running `storybook dev`,
 * but false in a static `storybook build` since Storybook's Vite config
 * doesn't set `VITE_ENABLE_DIAGNOSTICS`. So this story renders the link in
 * dev mode and renders nothing in the published/static build.
 */
const meta: Meta<typeof TahtiMapLink> = {
  title: 'Tahti/Misc/TahtiMapLink',
  component: TahtiMapLink,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: {
    label: '← Back to feature map',
  },
};
