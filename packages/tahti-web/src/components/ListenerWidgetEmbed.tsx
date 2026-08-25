import { Trash2Icon } from 'lucide-react';

import { Button } from '@nuclearplayer/ui';

import { listenerWidgetType } from '../content/listenerWidgets';
import type { ListenerWidgetInstance } from '../stores/listenerWidgetsStore';

/** Renders one enabled SoundCloud/YouTube widget instance using that
 * platform's real embedded player (an iframe) — this app can't legally or
 * technically proxy audio out of those platforms, so "playing" their
 * content here means embedding the official widget, same as any website. */
export function ListenerWidgetEmbed({
  instance,
  onRemove,
}: {
  instance: ListenerWidgetInstance;
  onRemove: () => void;
}) {
  const type = listenerWidgetType(instance.typeId);
  const embedUrl = type?.toEmbedUrl(instance.input);

  return (
    <div className="border-border bg-background-secondary/40 flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium">
          {instance.label}
        </span>
        <Button
          size="icon-sm"
          variant="text"
          aria-label={`Remove ${instance.label}`}
          onClick={onRemove}
        >
          <Trash2Icon size={14} aria-hidden />
        </Button>
      </div>
      {embedUrl && type ? (
        <iframe
          title={instance.label}
          src={embedUrl}
          width="100%"
          height={type.embedHeight}
          style={{ border: 0 }}
          allow="autoplay"
          loading="lazy"
        />
      ) : (
        <p className="text-foreground-secondary text-xs" role="alert">
          Couldn&apos;t recognize this URL — remove it and try pasting the
          {type ? ` ${type.name}` : ''} link again.
        </p>
      )}
    </div>
  );
}
