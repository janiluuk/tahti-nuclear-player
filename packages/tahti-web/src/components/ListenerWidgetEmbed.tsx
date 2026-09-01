import { XIcon } from 'lucide-react';

import { Box, Button } from '@tahti-player/ui';

import { listenerWidgetType } from '../content/listenerWidgets';
import type { ListenerWidgetInstance } from '../stores/listenerWidgetsStore';

/** Renders one enabled external widget instance using that
 * platform's real embedded player (an iframe) — this app can't legally or
 * technically proxy audio out of those platforms, so "playing" their
 * content here means embedding the official widget, same as any website. */
export function ListenerWidgetEmbed({
  instance,
  onRemove,
}: {
  instance: ListenerWidgetInstance;
  /** Called when the hover X is clicked — the caller owns confirmation,
   * this component doesn't remove anything itself. */
  onRemove?: () => void;
}) {
  const type = listenerWidgetType(instance.typeId);
  const embedUrl = type?.toEmbedUrl(instance.input);

  return (
    <Box
      variant="tertiary"
      className="group relative h-auto w-auto flex-col gap-2 rounded-lg p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium">
          {instance.label}
        </span>
        {onRemove ? (
          <Button
            size="icon-sm"
            variant="text"
            aria-label={`Remove ${instance.label}`}
            onClick={onRemove}
            className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <XIcon size={14} aria-hidden />
          </Button>
        ) : null}
      </div>
      {embedUrl && type ? (
        <iframe
          title={instance.label}
          src={embedUrl}
          width="100%"
          height={type.embedHeight}
          style={{ border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <p className="text-foreground-secondary text-xs" role="alert">
          Couldn&apos;t recognize this URL — remove it and try pasting the
          {type ? ` ${type.name}` : ''} link again.
        </p>
      )}
    </Box>
  );
}
