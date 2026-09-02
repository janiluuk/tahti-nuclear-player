import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PublicProfileRelease } from '@tahti-web/api/types';
import { ReleasesPanel } from '@tahti-web/components/ReleasesPanel';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof ReleasesPanel> = {
  title: 'Tahti/Studio/ReleasesPanel',
  component: ReleasesPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/u/northern-lights')],
};

export default meta;
type Story = StoryObj<typeof meta>;

const releases: PublicProfileRelease[] = [
  {
    id: 'release-1',
    title: 'Polar Nights EP',
    type: 'EP',
    artworkUrl: 'https://picsum.photos/seed/polar/200/200',
    releaseDate: '2025-09-12',
    tracks: [
      {
        position: 1,
        title: 'Polar Nights',
        durationSec: 214,
        soundId: 'archive-item-1',
        playUrl: 'https://cdn.tahti.live/archive/polar-nights.mp3',
      },
      {
        position: 2,
        title: 'Frost Line',
        durationSec: 198,
        soundId: 'archive-item-2',
        playUrl: 'https://cdn.tahti.live/archive/frost-line.mp3',
      },
      {
        position: 3,
        title: 'Aurora (Reprise)',
        durationSec: 240,
        soundId: 'archive-item-3',
        playUrl: 'https://cdn.tahti.live/archive/aurora-reprise.mp3',
      },
    ],
  },
  {
    id: 'release-2',
    title: 'Midnight Frequency',
    type: 'Single',
    releaseDate: '2025-06-01',
    tracks: [
      {
        position: 1,
        title: 'Midnight Frequency',
        durationSec: 301,
        soundId: 'archive-item-4',
        playUrl: 'https://cdn.tahti.live/archive/midnight-frequency.mp3',
      },
    ],
  },
  {
    id: 'release-3',
    title: 'Live at Tahti Radio',
    type: 'Live album',
    releaseDate: '2024-12-20',
    tracks: [],
  },
];

export const Default: Story = {
  args: {
    releases,
    artist: 'Northern Lights',
    slug: 'northern-lights',
  },
};

export const Empty: Story = {
  args: {
    releases: [],
    artist: 'Northern Lights',
    slug: 'northern-lights',
  },
};
