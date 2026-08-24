import { Volume2, VolumeX } from 'lucide-react';
import { FC } from 'react';

import { Button, Slider } from '..';
import { cn } from '../../utils';

type PlayerBarVolumeProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  muted?: boolean;
  onMuteToggle?: () => void;
  disabled?: boolean;
  className?: string;
};

export const PlayerBarVolume: FC<PlayerBarVolumeProps> = ({
  value,
  defaultValue,
  onValueChange,
  muted = false,
  onMuteToggle,
  disabled,
  className = '',
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        size="icon"
        variant="text"
        disabled={disabled}
        onClick={onMuteToggle}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
      <div className="w-24" data-testid="player-volume-slider">
        {/* Slider.Header supplies the accessible name (aria-labelledby) the
         * range input needs — kept in the DOM but visually hidden so the
         * compact player bar doesn't grow a visible "Volume" line. */}
        <Slider
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <span className="sr-only">
            <Slider.Header label="Volume" showValue={false} />
          </span>
          <Slider.Surface>
            <Slider.Track />
            <Slider.RangeInput />
          </Slider.Surface>
        </Slider>
      </div>
    </div>
  );
};
