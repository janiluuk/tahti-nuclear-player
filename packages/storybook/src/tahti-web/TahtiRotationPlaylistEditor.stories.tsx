import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AdminSelectsItem } from '@tahti-web/api/admin';
import { TahtiRotationPlaylistEditor } from '@tahti-web/components/TahtiRotationPlaylistEditor';
import { fn } from 'storybook/test';

const meta: Meta<typeof TahtiRotationPlaylistEditor> = {
  title: 'Tahti/Studio/TahtiRotationPlaylistEditor',
  component: TahtiRotationPlaylistEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onReorder: fn(),
    onRemove: fn(),
    onPreview: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const items: AdminSelectsItem[] = [
  {
    id: 'selects-1',
    soundId: 'archive-item-1',
    title: 'Aurora',
    durationSec: 214,
    license: 'CC_BY',
    artistName: 'Northern Lights',
    channelSlug: 'northern-lights',
    addedBy: 'board-jani',
  },
  {
    id: 'selects-2',
    soundId: 'archive-item-2',
    title: 'Frost Line',
    durationSec: 198,
    license: 'CC0',
    artistName: 'Northern Lights',
    channelSlug: 'northern-lights',
    addedBy: 'board-jani',
  },
  {
    id: 'selects-3',
    soundId: 'archive-item-4',
    title: 'Midnight Frequency',
    durationSec: 301,
    license: 'ALL_RIGHTS_RESERVED',
    artistName: 'Northern Lights',
    channelSlug: 'northern-lights',
    addedBy: 'listener-liina',
  },
];

export const Default: Story = {
  args: { items },
};

export const Empty: Story = {
  args: { items: [] },
};
