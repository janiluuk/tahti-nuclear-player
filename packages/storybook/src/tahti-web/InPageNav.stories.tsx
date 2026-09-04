import type { Meta, StoryObj } from '@storybook/react-vite';
import { InPageNav } from '@tahti-web/components/InPageNav';
import { HeartIcon, HistoryIcon } from 'lucide-react';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof InPageNav> = {
  title: 'Tahti/Page/InPageNav',
  component: InPageNav,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Orphan: unused in live tahti-web routes. Wraps Storybook `Tabs` + `TabLabel`. Prefer `Tabs` / `SectionTabs` for new surfaces. See docs/todo/tabs-migration.md.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [withTahtiRouter()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LinkMode: Story = {
  args: {
    'aria-label': 'Library',
    items: [
      {
        id: 'favorites',
        label: 'Favorites',
        icon: <HeartIcon size={14} />,
        to: '/library',
        active: true,
      },
      {
        id: 'history',
        label: 'History',
        icon: <HistoryIcon size={14} />,
        count: 12,
        to: '/library/history',
      },
    ],
  },
};

export const ButtonMode: Story = {
  args: {
    'aria-label': 'Filter',
    items: [
      { id: 'all', label: 'All', active: true, onSelect: () => {} },
      { id: 'live', label: 'Live', count: 3, onSelect: () => {} },
      { id: 'archive', label: 'Archive', count: 18, onSelect: () => {} },
    ],
  },
};
