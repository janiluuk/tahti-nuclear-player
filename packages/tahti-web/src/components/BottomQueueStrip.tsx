import { ListMusicIcon, Trash2Icon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Badge, Button, QueueItem as QueueItemView } from '@tahti-player/ui';

import { usePlayerStore } from '../stores/playerStore';
import { ClearQueueConfirmDialog } from './ClearQueueConfirmDialog';

export function BottomQueueStrip({ controls }: { controls: ReactNode }) {
  const queue = usePlayerStore((s) => s.queue);
  const currentId = usePlayerStore((s) => s.currentId);
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-1.5"
      data-testid="bottom-queue"
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {queue.length === 0 ? (
            <div className="text-foreground-secondary flex items-center gap-2 px-2 text-xs">
              <ListMusicIcon size={16} aria-hidden />
              <span>Nothing queued — add tracks to line them up here.</span>
            </div>
          ) : (
            queue.map((item) => {
              const isCurrent = item.id === currentId;
              return (
                <div
                  key={item.id}
                  className={isCurrent ? 'w-[13rem] shrink-0' : 'shrink-0'}
                >
                  <QueueItemView
                    track={item.track}
                    status={isCurrent ? item.status : 'idle'}
                    isCurrent={isCurrent}
                    isCollapsed={!isCurrent}
                    onSelect={() => playQueueIndex(item.id)}
                    onRemove={() => removeFromQueue(item.id)}
                    labels={{ removeButton: 'Remove from queue' }}
                  />
                </div>
              );
            })
          )}
        </div>
        {queue.length > 0 && (
          <Badge
            variant="pill"
            color="secondary"
            className="shrink-0 text-[10px]"
            title={`${queue.length} in queue`}
          >
            {queue.length}
          </Badge>
        )}
        <Button
          size="icon-sm"
          variant="text"
          disabled={queue.length === 0}
          onClick={() => setConfirmingClear(true)}
          className="text-foreground-secondary hover:text-accent-red shrink-0 opacity-60 hover:opacity-100"
          title="Clear queue"
          aria-label="Clear queue"
          data-testid="clear-bottom-queue"
        >
          <Trash2Icon size={14} aria-hidden />
        </Button>
      </div>
      <div className="flex justify-center">{controls}</div>
      <ClearQueueConfirmDialog
        isOpen={confirmingClear}
        count={queue.length}
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => {
          clearQueue();
          setConfirmingClear(false);
        }}
      />
    </div>
  );
}
