import {
  HeartIcon,
  ListEndIcon,
  ListPlusIcon,
  ListStartIcon,
  PlayIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { QueueItem, Track } from '@tahti-player/model';
import { TrackContextMenu } from '@tahti-player/ui';

import { soundIdFromPlayableId } from '../lib/archiveId';
import { useLibraryStore } from '../stores/libraryStore';
import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';
import { AddToPlaylistPanel } from './AddToPlaylistPanel';

/** Per-row context menu for `PlayableTrackTable` — matches the Nuclear
 * desktop player's track menu (play now / play next / queue / favorite /
 * add to playlist). Radio/live rows have no archive item to save to a
 * playlist, so that action is omitted for them. */
export function PlayableTrackContextMenu({
  track,
  children,
}: {
  track: Track;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const toggleFavoriteTrack = useLibraryStore((s) => s.toggleFavoriteTrack);
  const isFavorite = useLibraryStore((s) =>
    s.favoriteTracks.some((t) => t.id === track.source.id),
  );
  const soundId = soundIdFromPlayableId(track.source.id);

  const toPlayable = () => {
    const qi: QueueItem = {
      id: track.source.id,
      track,
      status: 'idle',
      addedAtIso: new Date().toISOString(),
    };
    return playableFromQueueItem(qi);
  };

  return (
    <>
      <TrackContextMenu>
        <TrackContextMenu.Trigger>{children}</TrackContextMenu.Trigger>
        <TrackContextMenu.Content>
          <TrackContextMenu.Action
            icon={<PlayIcon size={16} />}
            onClick={() => {
              const playable = toPlayable();
              if (playable) {
                play(playable);
              }
            }}
          >
            Play now
          </TrackContextMenu.Action>
          <TrackContextMenu.Action
            icon={<ListStartIcon size={16} />}
            onClick={() => {
              const playable = toPlayable();
              if (playable) {
                playNext(playable);
              }
            }}
          >
            Play next
          </TrackContextMenu.Action>
          <TrackContextMenu.Action
            icon={<ListEndIcon size={16} />}
            onClick={() => {
              const playable = toPlayable();
              if (playable) {
                enqueue(playable);
              }
            }}
          >
            Add to queue
          </TrackContextMenu.Action>
          <TrackContextMenu.Action
            icon={
              <HeartIcon
                size={16}
                className={
                  isFavorite ? 'text-accent-red fill-current' : undefined
                }
              />
            }
            onClick={() => {
              const playable = toPlayable();
              if (playable) {
                toggleFavoriteTrack(playable);
              }
            }}
          >
            {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </TrackContextMenu.Action>
          {soundId && (
            <TrackContextMenu.Action
              icon={<ListPlusIcon size={16} />}
              onClick={() => setOpen(true)}
            >
              Add to playlist
            </TrackContextMenu.Action>
          )}
        </TrackContextMenu.Content>
      </TrackContextMenu>
      {soundId && (
        <AddToPlaylistPanel
          isOpen={open}
          soundId={soundId}
          trackTitle={track.title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
