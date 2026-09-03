import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FC } from 'react';

import { Button } from './Button';
import { Tooltip } from './Tooltip';

type TopBarNavigationProps = {
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
};

export const TopBarNavigation: FC<TopBarNavigationProps> = ({
  onBack,
  onForward,
  canGoBack = true,
  canGoForward = true,
}) => (
  <div className="flex flex-row items-center gap-2">
    <Tooltip content="Back" side="top">
      <Button
        size="icon-sm"
        disabled={!canGoBack}
        onClick={onBack}
        aria-label="Back"
      >
        <ChevronLeft size={16} />
      </Button>
    </Tooltip>
    <Tooltip content="Forward" side="top">
      <Button
        size="icon-sm"
        disabled={!canGoForward}
        onClick={onForward}
        aria-label="Forward"
      >
        <ChevronRight size={16} />
      </Button>
    </Tooltip>
  </div>
);
