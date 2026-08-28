import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ProgrammeItem } from '@tahti-web/api/studio-extras';
import { ChannelRotationEditor } from '@tahti-web/components/ChannelRotationEditor';
import { fn } from 'storybook/test';

const items: ProgrammeItem[] = [
  {
    id: 'rotation-1',
    title: 'Northern Signals',
    status: 'PUBLISHED',
    durationSec: 246,
    isFallback: false,
    fallbackOrder: null,
  },
  {
    id: 'rotation-2',
    title: 'Static Bloom',
    status: 'PUBLISHED',
    durationSec: 198,
    isFallback: false,
    fallbackOrder: null,
  },
];

const meta: Meta<typeof ChannelRotationEditor> = {
  title: 'Tahti/Studio/ChannelRotationEditor',
  component: ChannelRotationEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Five-item rotation editor with reordering and library groups. Lives on Studio → Manage → Radio and channel radio management.',
      },
    },
  },
  args: {
    items,
    onReorder: fn(),
    onRemove: fn(),
    onAdd: fn(),
    onPlay: fn(),
    availableItems: items,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveRotation: Story = {};

export const WithLibraryGroups: Story = {
  args: {
    libraryGroups: [
      { id: 'album', label: 'Album', items },
      { id: 'clips', label: 'Clips', items: [items[1]!] },
    ],
    onAddGroup: fn(),
  },
};
