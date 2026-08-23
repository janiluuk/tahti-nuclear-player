import { Trash2Icon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatArtistNames } from '@nuclearplayer/model';
import type { QueueItem } from '@nuclearplayer/model';
import { Button, cn } from '@nuclearplayer/ui';

import { usePlayerStore } from '../stores/playerStore';

function QueueChip({
  item,
  side,
  onPlay,
  onRemove,
}: {
  item: QueueItem;
  side: 'past' | 'upcoming' | 'current';
  onPlay: () => void;
  onRemove: () => void;
}) {
  const title = item.track.title;
  const artist = formatArtistNames(item.track.artists);
  const cover = item.track.artwork?.items[0]?.url;

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        onClick={onPlay}
        title={`${title} — ${artist}`}
        className={cn(
          'border-border bg-background-secondary hover:border-primary/50 flex w-[10.5rem] items-center gap-2 rounded-md border py-1.5 pr-7 pl-2 text-left transition-colors',
          side === 'current' && 'border-primary bg-primary/15',
          side === 'past' && 'opacity-70 hover:opacity-100',
        )}
      >
        <span className="bg-background size-8 shrink-0 overflow-hidden rounded">
          {cover ? (
            <img src={cover} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-foreground-secondary flex size-full items-center justify-center text-[10px]">
              ♪
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold">{title}</span>
          <span className="text-foreground-secondary block truncate text-[10px]">
            {artist}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="bg-background/90 text-foreground-secondary hover:text-accent-red absolute top-1/2 right-1 flex size-6 -translate-y-1/2 items-center justify-center rounded opacity-0 shadow-sm transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus:opacity-100"
        aria-label={`Remove ${title} from queue`}
        title="Remove from queue"
      >
        <XIcon size={13} aria-hidden />
      </button>
    </div>
  );
}

export function BottomQueueStrip({ controls }: { controls: ReactNode }) {
  const queue = usePlayerStore((s) => s.queue);
  const currentId = usePlayerStore((s) => s.currentId);
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const currentIndex = currentId
    ? queue.findIndex((item) => item.id === currentId)
    : -1;

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-1.5"
      data-testid="bottom-queue"
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
          {queue.length === 0 ? (
            <span className="text-foreground-secondary px-2 text-xs">
              Queue is empty
            </span>
          ) : (
            queue.map((item, index) => (
              <QueueChip
                key={item.id}
                item={item}
                side={
                  item.id === currentId
                    ? 'current'
                    : currentIndex >= 0 && index < currentIndex
                      ? 'past'
                      : 'upcoming'
                }
                onPlay={() => playQueueIndex(item.id)}
                onRemove={() => removeFromQueue(item.id)}
              />
            ))
          )}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <span aria-hidden />
        <div className="flex justify-center">{controls}</div>
        <Button
          size="icon-sm"
          variant="text"
          disabled={queue.length === 0}
          onClick={clearQueue}
          className="text-foreground-secondary hover:text-accent-red justify-self-end opacity-60 hover:opacity-100"
          title="Clear queue"
          aria-label="Clear queue"
          data-testid="clear-bottom-queue"
        >
          <Trash2Icon size={14} aria-hidden />
        </Button>
      </div>
    </div>
  );
}
