import type { Meta, StoryObj } from '@storybook/react-vite';
import { InPageNav } from '@tahti-web/components/InPageNav';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof InPageNav> = {
  title: 'Tahti/Page/InPageNav',
  component: InPageNav,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LinkMode: Story = {
  args: {
    'aria-label': 'Library',
    items: [
      { id: 'favorites', label: 'Favorites', to: '/library', active: true },
      { id: 'history', label: 'History', to: '/library/history' },
    ],
  },
};

export const ButtonMode: Story = {
  args: {
    'aria-label': 'Filter',
    items: [
      { id: 'all', label: 'All', active: true, onSelect: () => {} },
      { id: 'live', label: 'Live', onSelect: () => {} },
      { id: 'archive', label: 'Archive', onSelect: () => {} },
    ],
  },
};
