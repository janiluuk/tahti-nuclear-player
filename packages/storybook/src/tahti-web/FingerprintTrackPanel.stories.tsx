import type { Meta, StoryObj } from '@storybook/react-vite';
import type { StudioReleaseTrack } from '@tahti-web/api/studio-types';
import { FingerprintTrackPanel } from '@tahti-web/components/FingerprintTrackPanel';

const unmatchedTrack: StudioReleaseTrack = {
  id: 'track-1',
  position: 1,
  title: 'Aurora (Original Mix)',
  status: 'READY',
  durationSec: 245,
};

const matchedTrack: StudioReleaseTrack = {
  id: 'track-2',
  position: 2,
  title: 'Midnight Drive',
  status: 'READY',
  durationSec: 198,
  fingerprintMatch: {
    acoustidId: 'aid-123',
    score: 0.92,
    title: 'Midnight Drive',
    artist: 'Northern Lights',
  },
};

const meta: Meta<typeof FingerprintTrackPanel> = {
  title: 'Tahti/Studio/FingerprintTrackPanel',
  component: FingerprintTrackPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    releaseId: 'release-1',
    onUpdated: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoMatchOnFile: Story = {
  args: {
    track: unmatchedTrack,
  },
};

export const MatchOnFile: Story = {
  args: {
    track: matchedTrack,
  },
};
