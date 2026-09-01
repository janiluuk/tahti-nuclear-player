import type { Meta } from '@storybook/react-vite';
import { ComponentProps } from 'react';
import { fn } from 'storybook/test';

import { TahtiJam } from '@tahti-player/ui';

const meta = {
  title: 'Remote/TahtiJam/Controls',
  component: TahtiJam.Controls,
  tags: ['autodocs'],
} satisfies Meta<typeof TahtiJam.Controls>;

export default meta;

const defaultProps: ComponentProps<typeof TahtiJam.Controls> = {
  isPlaying: false,
  shuffleActive: false,
  repeatMode: 'off',
  progress: 35,
  elapsedSeconds: 88,
  remainingSeconds: 163,
  onPlayPause: fn(),
  onNext: fn(),
  onPrevious: fn(),
  onShuffleToggle: fn(),
  onRepeatToggle: fn(),
  onSeek: fn(),
};

export const Playing = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Controls {...defaultProps} isPlaying />
    </div>
  ),
};

export const TogglesActive = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Controls
        {...defaultProps}
        shuffleActive
        repeatMode="all"
        isDiscoveryActive
      />
    </div>
  ),
};

export const Loading = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Controls
        {...defaultProps}
        isLoading
        progress={0}
        elapsedSeconds={0}
        remainingSeconds={0}
      />
    </div>
  ),
};

export const RepeatOne = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Controls
        {...defaultProps}
        isPlaying
        repeatMode="one"
        progress={80}
        elapsedSeconds={247}
        remainingSeconds={62}
      />
    </div>
  ),
};
