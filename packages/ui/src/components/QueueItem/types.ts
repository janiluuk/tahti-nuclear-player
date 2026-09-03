import { type VariantProps } from 'class-variance-authority';

import type { Track } from '@tahti-player/model';

import { queueItemVariants } from './variants';

export type QueueItemLabels = {
  removeButton?: string;
  playbackError?: string;
};

export type QueueItemProps = VariantProps<typeof queueItemVariants> & {
  track: Track;
  onSelect?: () => void;
  onRemove?: () => void;
  errorMessage?: string;
  labels: QueueItemLabels;
  /** Clicking the title navigates instead of selecting the item for
   * playback — omit to keep the title inert (default, existing behavior). */
  onTitleClick?: () => void;
  /** Omit to hide the like control entirely (default, existing behavior). */
  isLiked?: boolean;
  onToggleLike?: () => void;
  classes?: {
    root?: string;
    thumbnail?: string;
    content?: string;
    title?: string;
    artist?: string;
    duration?: string;
    error?: string;
    removeButton?: string;
    likeButton?: string;
  };
};
