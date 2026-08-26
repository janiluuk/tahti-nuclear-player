import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TahtiPlayable } from '@tahti-web/api/types';
import { PlayableTrackTable } from '@tahti-web/components/PlayableTrackTable';
import { fn } from 'storybook/test';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof PlayableTrackTable> = {
  title: 'Tahti/Track/PlayableTrackTable',
  component: PlayableTrackTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/u/northern-lights'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

const items: TahtiPlayable[] = [
  {
    id: 'archive:archive-item-1',
    kind: 'archive',
    title: 'Aurora',
    artist: 'Northern Lights',
    coverUrl: 'https://picsum.photos/seed/aurora/200/200',
    streamUrl: 'https://cdn.tahti.live/archive/aurora.mp3',
    protocol: 'https',
    channelSlug: 'northern-lights',
    durationSec: 214,
    releaseDate: '2025-11-03',
  },
  {
    id: 'archive:archive-item-2',
    kind: 'archive',
    title: 'Frost Line',
    artist: 'Northern Lights',
    coverUrl: 'https://picsum.photos/seed/frost/200/200',
    streamUrl: 'https://cdn.tahti.live/archive/frost-line.mp3',
    protocol: 'https',
    channelSlug: 'northern-lights',
    durationSec: 198,
  },
  {
    id: 'archive:archive-item-3',
    kind: 'archive',
    title: 'Imported Set',
    artist: 'Northern Lights',
    streamUrl: 'https://soundcloud.example/set.mp3',
    protocol: 'https',
    sourceProvider: 'soundcloud',
    durationSec: 1820,
  },
];

export const Default: Story = {
  args: {
    items,
    artistUsername: 'northern-lights',
  },
};

export const Editable: Story = {
  args: {
    items,
    artistUsername: 'northern-lights',
    onEdit: fn(),
  },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: 'No tracks match this filter.',
  },
};
