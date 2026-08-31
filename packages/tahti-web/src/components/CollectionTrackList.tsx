import { Link } from '@tanstack/react-router';
import { HeartIcon, PauseIcon, PlayIcon } from 'lucide-react';

import { Button } from '@nuclearplayer/ui';

import type { TahtiPlayable } from '../api/types';
import { archiveItemIdFromPlayableId } from '../lib/archiveId';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { formatDuration } from '../lib/playableToTrack';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import { AddToPlaylistButton } from './AddToPlaylistButton';
import { WaveformSeekbar } from './tahti/WaveformSeekbar';

function TrackRow({ item, index }: { item: TahtiPlayable; index: number }) {
  const play = usePlayerStore((s) => s.play);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const currentId = usePlayerStore((s) => s.currentId);
  const status = usePlayerStore((s) => s.status);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const toggleFavoriteTrack = useLibraryStore((s) => s.toggleFavoriteTrack);
  const favorited = useLibraryStore((s) =>
    s.favoriteTracks.some((t) => t.id === item.id),
  );

  const isCurrent = currentId === item.id;
  const isPlaying = isCurrent && (status === 'playing' || status === 'loading');
  const totalDuration = (isCurrent ? duration : 0) || item.durationSec || 0;
  const elapsed = isCurrent ? currentTime : 0;
  const progress = isCurrent && totalDuration > 0 ? elapsed / totalDuration : 0;
  const archiveItemId = archiveItemIdFromPlayableId(item.id);

  const togglePlayback = () => {
    if (isCurrent) {
      setStatus(isPlaying ? 'paused' : 'playing');
      return;
    }
    play(item);
  };

  const seekFraction = (fraction: number) => {
    if (!isCurrent) {
      play(item);
      return;
    }
    if (totalDuration > 0) {
      seekTo(fraction * totalDuration);
    }
  };

  const title = archiveItemId ? (
    <Link
      to="/t/$id"
      params={{ id: archiveItemId }}
      className="hover:text-primary min-w-0 truncate font-semibold"
    >
      {item.title}
    </Link>
  ) : (
    <span className="min-w-0 truncate font-semibold">{item.title}</span>
  );

  return (
    <li
      className={
        index % 2 === 0
          ? 'bg-background-secondary/40 rounded-lg p-3'
          : 'rounded-lg p-3'
      }
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="group border-border bg-background-secondary relative size-16 shrink-0 overflow-hidden rounded-md border sm:size-20"
        >
          <img
            src={item.coverUrl ?? placeholderArtworkUrl(item.id)}
            alt=""
            className="size-full object-cover"
          />
          <span className="bg-background/40 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            {isPlaying ? (
              <PauseIcon size={22} fill="currentColor" className="text-white" />
            ) : (
              <PlayIcon
                size={22}
                fill="currentColor"
                className="ml-0.5 text-white"
              />
            )}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            {title}
            <span className="text-foreground-secondary shrink-0 text-xs tabular-nums">
              {formatDuration(item.durationSec)}
            </span>
          </div>
          <WaveformSeekbar
            trackId={item.id}
            progress={progress}
            className="mt-2 h-10 sm:h-12"
            onSeek={seekFraction}
          />
          <div className="mt-1.5 flex items-center gap-1">
            {archiveItemId ? (
              <AddToPlaylistButton
                archiveItemId={archiveItemId}
                trackTitle={item.title}
              />
            ) : null}
            <Button
              size="icon-sm"
              variant="text"
              aria-label={favorited ? 'Remove from favorites' : 'Favorite'}
              title={favorited ? 'Remove from favorites' : 'Favorite'}
              onClick={() => toggleFavoriteTrack(item)}
            >
              <HeartIcon
                size={15}
                aria-hidden
                className={
                  favorited ? 'fill-accent-red text-accent-red' : undefined
                }
              />
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Per-track waveform row list for a Set/Collection page — each track gets
 * its own scrubbable waveform and transport, rather than a single compact
 * table row. Reused as-is when a collection is opened from the artist
 * page, since that link routes into the same CollectionView. */
export function CollectionTrackList({ items }: { items: TahtiPlayable[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, index) => (
        <TrackRow key={item.id} item={item} index={index} />
      ))}
    </ul>
  );
}
