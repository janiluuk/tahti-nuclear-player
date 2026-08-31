import { Link } from '@tanstack/react-router';
import { HeartIcon, LoaderCircleIcon, MusicIcon, PlayIcon } from 'lucide-react';
import { useState } from 'react';

import { fetchTrackDetail } from '../../api/client';
import type { DiscoverTrackItem } from '../../api/types';
import { usePlayerStore } from '../../stores/playerStore';

function toPlayable(item: DiscoverTrackItem) {
  if (!item.audioUrl) {
    return null;
  }
  return {
    id: item.id,
    kind: 'archive' as const,
    title: item.title,
    artist: item.artist,
    coverUrl: item.coverUrl ?? undefined,
    streamUrl: item.audioUrl,
    protocol: item.audioUrl.includes('.m3u8')
      ? ('hls' as const)
      : ('https' as const),
    channelSlug: item.channelSlug,
  };
}

export function WidgetTrackRow({
  item,
  rank,
  onSelect,
}: {
  item: DiscoverTrackItem;
  rank?: number;
  onSelect?: (item: DiscoverTrackItem) => void;
}) {
  const play = usePlayerStore((s) => s.play);
  const [loading, setLoading] = useState(false);
  const playable = toPlayable(item);

  const handlePlay = async () => {
    if (playable) {
      play(playable);
      return;
    }
    setLoading(true);
    const result = await fetchTrackDetail(item.id.replace(/^archive:/, ''));
    setLoading(false);
    const detail = result.data;
    if (!detail?.audioUrl) {
      return;
    }
    play({
      id: item.id,
      kind: 'archive',
      title: detail.title,
      artist: detail.artistName,
      coverUrl: detail.bannerUrl ?? undefined,
      streamUrl: detail.audioUrl,
      protocol: detail.audioUrl.includes('.m3u8') ? 'hls' : 'https',
      channelSlug: detail.channelSlug,
      durationSec: detail.durationSec,
    });
  };

  const artwork = (
    <span className="bg-background relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded">
      {item.coverUrl ? (
        <img src={item.coverUrl} alt="" className="size-full object-cover" />
      ) : (
        <MusicIcon
          size={16}
          className="text-foreground-secondary"
          aria-hidden
        />
      )}
      {
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void handlePlay();
          }}
          className="bg-background/70 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 disabled:opacity-100"
          disabled={loading}
          title={`Play ${item.title}`}
          aria-label={`Play ${item.title}`}
        >
          {loading ? (
            <LoaderCircleIcon
              size={16}
              className="text-foreground animate-spin"
              aria-hidden
            />
          ) : (
            <PlayIcon size={16} className="text-foreground" aria-hidden />
          )}
        </button>
      }
    </span>
  );

  return (
    <Link
      to="/channel/$slug"
      params={{ slug: item.channelSlug }}
      onClick={
        onSelect
          ? (event) => {
              event.preventDefault();
              onSelect(item);
            }
          : undefined
      }
      className="hover:bg-background flex items-center gap-3 rounded px-1.5 py-1.5 transition-colors"
    >
      {rank !== undefined && (
        <span className="text-foreground-secondary w-4 shrink-0 text-right text-xs tabular-nums">
          {rank}
        </span>
      )}
      {artwork}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        <span className="text-foreground-secondary block truncate text-xs">
          {item.artist}
        </span>
      </span>
      {item.listens !== undefined && (
        <span className="text-foreground-secondary shrink-0 text-xs tabular-nums">
          {item.listens.toLocaleString()} plays
        </span>
      )}
      {item.loves !== undefined && (
        <span className="text-foreground-secondary flex shrink-0 items-center gap-1 text-xs tabular-nums">
          <HeartIcon size={12} aria-hidden />
          {item.loves.toLocaleString()}
        </span>
      )}
    </Link>
  );
}
