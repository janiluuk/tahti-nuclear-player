import {
  ChevronDownIcon,
  ListMusicIcon,
  Maximize2Icon,
  PlayIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatArtistNames } from '@nuclearplayer/model';
import { Button, cn, PlayerBar } from '@nuclearplayer/ui';

import { useIsMobile } from '../hooks/useIsMobile';
import { archiveItemIdFromPlayableId } from '../lib/archiveId';
import { useThemeStore } from '../plugins/themes';
import { useAmbientStore } from '../stores/ambientStore';
import { useLayoutStore } from '../stores/layoutStore';
import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';
import { AddToPlaylistButton } from './AddToPlaylistButton';
import { BottomQueueStrip } from './BottomQueueStrip';
import { ChannelVisualizer } from './ChannelVisualizer';
import { HearthisEmbedSurface } from './HearthisEmbedSurface';
import { ConnectedSeekBar, PlayerLiveBadge } from './PlayerSeekBar';
import { isThemeVisualizationEnabled } from './ThemeVisualizationSettings';

const QUEUE_ANIMATION_MS = 200;

export function ConnectedPlayerBar() {
  const isMobile = useIsMobile();
  const queue = usePlayerStore((s) => s.queue);
  const currentId = usePlayerStore((s) => s.currentId);
  const status = usePlayerStore((s) => s.status);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const isLive = usePlayerStore((s) => s.isLive);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const playerBarVisible = usePlayerStore((s) => s.playerBarVisible);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const queueOpen = useLayoutStore((s) => s.bottomQueueOpen);
  const setBottomQueueOpen = useLayoutStore((s) => s.setBottomQueueOpen);
  const setFullScreenPlayerOpen = useLayoutStore(
    (s) => s.setFullScreenPlayerOpen,
  );
  const ambientEnabled = useAmbientStore((state) => state.enabled);
  const ambientPreset = useAmbientStore((state) => state.preset);
  const ambientOpacity = useAmbientStore((state) => state.opacity);
  const ambientAudioReactive = useAmbientStore((state) => state.audioReactive);
  const themeId = useThemeStore((state) => state.themeId);

  // Keep the queue strip mounted through its closing fade so the layout
  // doesn't snap back to the compact bar before the animation finishes.
  const [queueMounted, setQueueMounted] = useState(queueOpen);
  const [queueVisible, setQueueVisible] = useState(queueOpen);

  useEffect(() => {
    if (queueOpen) {
      setQueueMounted(true);
      const raf = requestAnimationFrame(() => setQueueVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setQueueVisible(false);
    const t = setTimeout(() => setQueueMounted(false), QUEUE_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [queueOpen]);

  const current = queue.find((q) => q.id === currentId);
  const playable = current ? playableFromQueueItem(current) : null;
  const isPlaying = status === 'playing' || status === 'loading';
  const hearthisEmbed = playable?.embed;

  if (!playerBarVisible || (isMobile && isPlaying)) {
    return null;
  }

  if (!playable) {
    const showVisualization =
      ambientEnabled && isThemeVisualizationEnabled(themeId);
    return (
      <div
        className="border-border bg-background-secondary relative flex h-14 w-full items-center justify-between overflow-hidden border-t px-3"
        aria-label="Player ready"
      >
        {showVisualization ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ opacity: ambientOpacity }}
            aria-hidden
          >
            <ChannelVisualizer
              preset={ambientPreset}
              audioReactive={ambientAudioReactive}
              className="h-full w-full"
            />
          </div>
        ) : null}
        <div className="relative min-w-0">
          <p className="truncate text-xs font-semibold">Nothing playing</p>
          <p className="text-foreground-secondary text-[11px]">Player ready</p>
        </div>
        <div className="relative flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="text"
            disabled={queue.length === 0}
            onClick={next}
            aria-label="Play queued track"
            title="Play queued track"
          >
            <PlayIcon size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="text"
            onClick={() => setFullScreenPlayerOpen(true)}
            aria-label="Expand player"
            title="Expand player"
            data-testid="expand-idle-player"
          >
            <ChevronDownIcon size={18} />
          </Button>
        </div>
      </div>
    );
  }

  const title = playable?.title ?? 'Nothing playing';
  const provider =
    playable?.sourceProvider && playable.sourceProvider !== 'tahti'
      ? playable.sourceProvider
      : current?.track.source.provider &&
          current.track.source.provider !== 'tahti'
        ? current.track.source.provider
        : null;
  const artistBase =
    playable?.artist ??
    (current
      ? formatArtistNames(current.track.artists)
      : 'Pick a channel to listen');
  const artist = provider ? `${artistBase}, ${provider}` : artistBase;
  const archiveItemId = archiveItemIdFromPlayableId(playable?.id ?? currentId);

  const controls = (
    <div className="flex flex-col items-center gap-1">
      <PlayerBar.Controls
        isPlaying={isPlaying}
        isShuffleActive={!isLive && shuffle}
        repeatMode={isLive ? 'off' : repeatMode}
        showDiscovery={false}
        labels={{
          shuffleOn: isLive ? 'Shuffle (archive only)' : 'Shuffle on',
          shuffleOff: isLive ? 'Shuffle (archive only)' : 'Shuffle off',
          repeatOff: isLive ? 'Repeat (archive only)' : 'Repeat off',
          repeatAll: 'Repeat all',
          repeatOne: 'Repeat one',
        }}
        onPlayPause={() => {
          if (!playable) {
            return;
          }
          if (isPlaying) {
            setStatus('paused');
          } else {
            setStatus('playing');
          }
        }}
        onNext={next}
        onPrevious={previous}
        onShuffleToggle={toggleShuffle}
        onRepeatToggle={cycleRepeat}
      />
      {isLive && status === 'error' ? (
        <div className="text-foreground-secondary text-xs tracking-wide uppercase">
          Error
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex w-full flex-col">
      {isLive ? null : <ConnectedSeekBar className="px-4" />}
      {hearthisEmbed ? (
        <div className="bg-background-secondary px-4 py-2">
          <HearthisEmbedSurface
            embedUri={hearthisEmbed.embedUri}
            title={title}
            autoplay={isPlaying}
            compact
          />
          <p className="text-foreground-secondary mt-1 text-center text-[11px]">
            Playback is controlled by the hearthis.at widget.
          </p>
        </div>
      ) : null}
      <PlayerBar
        className={cn(
          'transition-all duration-200',
          queueMounted && 'h-auto min-h-16 items-stretch py-2',
        )}
        left={
          queueMounted ? undefined : (
            <div className="flex min-w-0 items-center gap-2">
              <PlayerBar.NowPlaying
                title={title}
                artist={artist}
                coverUrl={
                  playable?.coverUrl ?? current?.track.artwork?.items[0]?.url
                }
                action={isLive ? <PlayerLiveBadge /> : undefined}
              />
              {archiveItemId && playable && (
                <AddToPlaylistButton
                  archiveItemId={archiveItemId}
                  trackTitle={playable.title}
                  variant="secondary"
                />
              )}
            </div>
          )
        }
        center={
          <div
            className={cn(
              'flex w-full flex-col items-center',
              queueMounted ? 'max-w-none min-w-0' : 'max-w-xl',
            )}
          >
            {queueMounted ? (
              <div
                className={cn(
                  'w-full transition-all duration-200 ease-out',
                  queueVisible
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-1 opacity-0',
                )}
              >
                <BottomQueueStrip controls={controls} />
              </div>
            ) : (
              controls
            )}
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="text"
              disabled={!playable}
              onClick={() => setFullScreenPlayerOpen(true)}
              title="Full screen"
              aria-label="Full screen"
              data-testid="expand-full-screen-player"
            >
              <Maximize2Icon size={16} />
            </Button>
            <PlayerBar.Volume
              value={muted ? 0 : Math.round(volume * 100)}
              onValueChange={(v) => setVolume(v / 100)}
              muted={muted}
              onMuteToggle={toggleMute}
            />
            <div className="relative">
              <Button
                size="icon-sm"
                variant={queueOpen ? 'secondary' : 'text'}
                onClick={() => setBottomQueueOpen(!queueOpen)}
                aria-label={
                  queueOpen
                    ? 'Collapse queue'
                    : queue.length > 1
                      ? `Expand queue, ${queue.length} in queue`
                      : 'Expand queue'
                }
                aria-pressed={queueOpen}
                data-testid={
                  queueOpen ? 'close-bottom-queue' : 'open-bottom-queue'
                }
              >
                <ListMusicIcon size={16} />
              </Button>
              {queue.length > 1 ? (
                <span className="bg-primary text-primary-foreground pointer-events-none absolute -top-0.5 -right-0.5 min-w-4 rounded-full px-1 text-center text-[9px] font-bold tabular-nums">
                  {queue.length}
                </span>
              ) : null}
            </div>
          </div>
        }
      />
    </div>
  );
}
