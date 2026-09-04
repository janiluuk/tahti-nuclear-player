import { LibraryIcon, PlayIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button, EmptyState, FilePicker, Tooltip } from '@tahti-player/ui';

import {
  playableFromLocalTrack,
  useLocalLibraryStore,
} from '../stores/localLibraryStore';
import { usePlayerStore } from '../stores/playerStore';

const FILE_LABELS = {
  title: 'Add audio files',
  description:
    'Files stay on this device for this session. Reloading the page clears the list. Uploading to your Tahti archive is Studio → Upload.',
  browse: 'Choose files',
};

export function DesktopLibraryPanel() {
  const tracks = useLocalLibraryStore((s) => s.tracks);
  const addFiles = useLocalLibraryStore((s) => s.addFiles);
  const remove = useLocalLibraryStore((s) => s.remove);
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);

  const onFiles = (files: readonly File[]) => {
    const added = addFiles(files);
    if (added.length === 0) {
      toast.error('Choose an audio file.');
      return;
    }
    toast.success(
      added.length === 1
        ? `Added “${added[0]?.title}”.`
        : `Added ${added.length} files.`,
    );
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3 p-2"
      data-testid="desktop-library-panel"
    >
      <FilePicker
        accept="audio/*"
        multiple
        labels={FILE_LABELS}
        onFiles={onFiles}
      />
      {tracks.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<LibraryIcon size={28} className="opacity-50" />}
          title="Local library"
          description="Import files to play them in the Tahti player. Soulseek search lands here after the desktop add-on is connected."
          className="flex-1"
        />
      ) : (
        <ul className="tahti-hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {tracks.map((track) => (
            <li
              key={track.id}
              className="border-border flex items-center gap-2 rounded-md border px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{track.title}</p>
                <p className="text-foreground-secondary truncate text-xs">
                  {track.artist}
                </p>
              </div>
              <Tooltip content="Play" side="top">
                <Button
                  size="icon-sm"
                  variant="text"
                  aria-label={`Play ${track.title}`}
                  onClick={() => play(playableFromLocalTrack(track))}
                >
                  <PlayIcon size={14} aria-hidden />
                </Button>
              </Tooltip>
              <Tooltip content="Add to queue" side="top">
                <Button
                  size="sm"
                  variant="text"
                  aria-label={`Queue ${track.title}`}
                  onClick={() => {
                    enqueue(playableFromLocalTrack(track));
                    toast.success(`Queued “${track.title}”.`);
                  }}
                >
                  Queue
                </Button>
              </Tooltip>
              <Tooltip content="Remove" side="top">
                <Button
                  size="icon-sm"
                  variant="text"
                  intent="danger"
                  aria-label={`Remove ${track.title}`}
                  onClick={() => {
                    remove(track.id);
                    toast.success(`Removed “${track.title}”.`);
                  }}
                >
                  <TrashIcon size={14} aria-hidden />
                </Button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
