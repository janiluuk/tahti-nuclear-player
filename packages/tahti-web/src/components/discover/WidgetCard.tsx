import { Link } from '@tanstack/react-router';
import { ChevronDownIcon, ChevronUpIcon, InboxIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button, EmptyState, Loader } from '@nuclearplayer/ui';

import type { DiscoverArtistOfWeek } from '../../api/discover';
import type { DiscoverTrackItem } from '../../api/types';
import type { DiscoverWidgetId } from '../../stores/discoverStore';
import { WidgetTrackRow } from './WidgetTrackRow';

const MAX_ROWS = 8;

export function WidgetCard({
  id,
  title,
  subtitle,
  loading,
  items,
  artist,
  showRank,
  emptyMessage,
  canMoveUp,
  canMoveDown,
  onMove,
  onRemove,
}: {
  id: DiscoverWidgetId;
  title: string;
  subtitle?: ReactNode;
  loading: boolean;
  items: DiscoverTrackItem[];
  artist?: DiscoverArtistOfWeek;
  showRank?: boolean;
  emptyMessage: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (id: DiscoverWidgetId, direction: 'up' | 'down') => void;
  onRemove: (id: DiscoverWidgetId) => void;
}) {
  return (
    <section className="border-border bg-background-secondary flex min-h-[280px] flex-col gap-3 rounded-md border-(length:--border-width) p-4">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-foreground-secondary truncate text-xs">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="icon-sm"
            variant="text"
            disabled={!canMoveUp}
            onClick={() => onMove(id, 'up')}
            title="Move earlier"
            aria-label="Move earlier"
          >
            <ChevronUpIcon size={14} />
          </Button>
          <Button
            size="icon-sm"
            variant="text"
            disabled={!canMoveDown}
            onClick={() => onMove(id, 'down')}
            title="Move later"
            aria-label="Move later"
          >
            <ChevronDownIcon size={14} />
          </Button>
          <Button
            size="icon-sm"
            variant="text"
            onClick={() => onRemove(id)}
            title="Remove widget"
            aria-label="Remove widget"
            className="text-foreground-secondary hover:text-accent-red"
          >
            <XIcon size={14} />
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader size="sm" />
        </div>
      ) : artist ? (
        <div className="flex flex-1 flex-col items-center text-center">
          {artist.avatarUrl ? (
            <img
              src={artist.avatarUrl}
              alt={`${artist.displayName} profile`}
              className="bg-background-secondary size-40 rounded-full object-cover"
            />
          ) : (
            <div className="bg-background-secondary text-foreground-secondary flex size-40 items-center justify-center rounded-full text-4xl font-bold">
              {artist.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <h4 className="mt-4 text-lg font-semibold">{artist.displayName}</h4>
          <p className="text-foreground-secondary mt-2 line-clamp-4 max-w-xl text-sm">
            {artist.bio ?? 'Discover this artist’s music on Tahti.'}
          </p>
          <Link
            to="/channel/$slug"
            params={{ slug: artist.channelSlug }}
            className="mt-4"
          >
            <Button size="sm">Listen to their music</Button>
          </Link>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<InboxIcon size={20} aria-hidden />}
          title={emptyMessage}
        />
      ) : (
        <div className="flex flex-col gap-0.5">
          {items.slice(0, MAX_ROWS).map((item, index) => (
            <WidgetTrackRow
              key={item.id}
              item={item}
              rank={showRank ? index + 1 : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
