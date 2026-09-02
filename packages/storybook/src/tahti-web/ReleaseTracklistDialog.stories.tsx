import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PublicProfileRelease } from '@tahti-web/api/types';
import { ReleaseTracklistDialog } from '@tahti-web/components/ReleaseTracklistDialog';

const meta: Meta<typeof ReleaseTracklistDialog> = {
  title: 'Tahti/Track/ReleaseTracklistDialog',
  component: ReleaseTracklistDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: () => {},
    artistName: 'Northern Lights',
    channelSlug: 'northern-lights',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const release: PublicProfileRelease = {
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
};

export const Default: Story = {
  args: { release },
};

export const NoTracklist: Story = {
  args: {
    release: {
      ...release,
      id: 'release-3',
      title: 'Live at Tahti Radio',
      tracks: [],
    },
  },
};
