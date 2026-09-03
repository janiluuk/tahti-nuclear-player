import {
  BoomBox,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { FC } from 'react';

import { RepeatMode } from '@tahti-player/model';

import { Button } from '..';
import { cn } from '../../utils';
import { Tooltip } from '../Tooltip';

type PlayerBarControlsLabels = {
  shuffleOn?: string;
  shuffleOff?: string;
  repeatOff?: string;
  repeatAll?: string;
  repeatOne?: string;
  discoveryOn?: string;
  discoveryOff?: string;
};

const REPEAT_LABEL_KEY: Record<RepeatMode, keyof PlayerBarControlsLabels> = {
  off: 'repeatOff',
  all: 'repeatAll',
  one: 'repeatOne',
};

type PlayerBarControlsProps = {
  isPlaying?: boolean;
  isShuffleActive?: boolean;
  isDiscoveryActive?: boolean;
  repeatMode?: RepeatMode;
  labels: PlayerBarControlsLabels;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onDiscoveryToggle?: () => void;
  showDiscovery: boolean;
  className?: string;
};

export const PlayerBarControls: FC<PlayerBarControlsProps> = ({
  isPlaying = false,
  isShuffleActive = false,
  isDiscoveryActive = false,
  repeatMode = 'off',
  labels,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffleToggle,
  onRepeatToggle,
  onDiscoveryToggle,
  showDiscovery,
  className = '',
}) => (
  <div className={cn('flex items-center justify-center gap-1.5', className)}>
    <Tooltip
      content={isShuffleActive ? labels?.shuffleOn : labels?.shuffleOff}
      side="top"
    >
      <Button
        size="icon"
        variant={isShuffleActive ? 'default' : 'text'}
        className="rounded-full"
        onClick={onShuffleToggle}
        aria-label={isShuffleActive ? labels?.shuffleOn : labels?.shuffleOff}
        aria-pressed={isShuffleActive}
        data-testid="player-shuffle-button"
      >
        <Shuffle size={16} />
      </Button>
    </Tooltip>
    <Tooltip content="Previous" side="top">
      <Button
        size="icon"
        variant="text"
        className="rounded-full"
        onClick={onPrevious}
        aria-label="Previous"
      >
        <SkipBack size={16} />
      </Button>
    </Tooltip>
    <Tooltip content={isPlaying ? 'Pause' : 'Play'} side="top">
      <Button
        size="icon"
        onClick={onPlayPause}
        className={cn(
          'active:bg-accent-green size-10 rounded-full shadow-md active:text-black',
          isPlaying && 'bg-accent-green text-black',
        )}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        aria-pressed={isPlaying}
        data-testid={isPlaying ? 'player-pause-button' : 'player-play-button'}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>
    </Tooltip>
    <Tooltip content="Next" side="top">
      <Button
        size="icon"
        variant="text"
        className="rounded-full"
        onClick={onNext}
        aria-label="Next"
        data-testid="player-next-button"
      >
        <SkipForward size={16} />
      </Button>
    </Tooltip>
    <Tooltip content={labels?.[REPEAT_LABEL_KEY[repeatMode]]} side="top">
      <Button
        size="icon"
        variant={repeatMode !== 'off' ? 'default' : 'text'}
        className="rounded-full"
        onClick={onRepeatToggle}
        aria-label={labels?.[REPEAT_LABEL_KEY[repeatMode]]}
        aria-pressed={repeatMode !== 'off'}
        data-testid="player-repeat-button"
      >
        {repeatMode === 'one' && <Repeat1 size={16} />}
        {repeatMode !== 'one' && <Repeat size={16} />}
      </Button>
    </Tooltip>
    {showDiscovery && (
      <Tooltip
        content={isDiscoveryActive ? labels?.discoveryOn : labels?.discoveryOff}
        side="top"
      >
        <Button
          size="icon"
          variant={isDiscoveryActive ? 'default' : 'text'}
          className="rounded-full"
          onClick={onDiscoveryToggle}
          aria-label={
            isDiscoveryActive ? labels?.discoveryOn : labels?.discoveryOff
          }
          aria-pressed={isDiscoveryActive}
          data-testid="player-discovery-button"
        >
          <BoomBox size={16} />
        </Button>
      </Tooltip>
    )}
  </div>
);
