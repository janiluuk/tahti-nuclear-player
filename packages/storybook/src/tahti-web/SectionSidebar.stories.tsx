import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SectionSidebar,
  type SectionSidebarItem,
} from '@tahti-web/components/SectionSidebar';
import { HeartIcon, LibraryIcon, RadioIcon, SettingsIcon } from 'lucide-react';

import { withTahtiRouter } from './_lib/decorators';

const ITEMS: SectionSidebarItem[] = [
  {
    id: 'library',
    to: '/library',
    label: 'Library',
    icon: <LibraryIcon size={16} aria-hidden />,
    active: true,
  },
  {
    id: 'radio',
    to: '/radio',
    label: 'Radio',
    icon: <RadioIcon size={16} aria-hidden />,
  },
  {
    id: 'favorites',
    to: '/library/favorites',
    label: 'Favorites',
    icon: <HeartIcon size={16} aria-hidden />,
  },
  {
    id: 'settings',
    to: '/settings',
    label: 'Settings',
    icon: <SettingsIcon size={16} aria-hidden />,
  },
];

const meta: Meta<typeof SectionSidebar> = {
  title: 'Tahti/Navigation/SectionSidebar',
  component: SectionSidebar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/library')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveItem: Story = {
  args: { 'aria-label': 'Library', items: ITEMS },
};

export const NoActiveItem: Story = {
  args: {
    'aria-label': 'Sections',
    items: ITEMS.map((item) => ({ ...item, active: false })),
  },
};
