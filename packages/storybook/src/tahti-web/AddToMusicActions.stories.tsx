import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddToMusicActions } from '@tahti-web/components/AddToMusicActions';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AddToMusicActions> = {
  title: 'Tahti/Studio/AddToMusicActions',
  component: AddToMusicActions,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/music')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Centered: Story = {
  args: {
    align: 'center',
  },
};

export const Compact: Story = {
  args: {
    size: 'sm',
    align: 'start',
  },
};
