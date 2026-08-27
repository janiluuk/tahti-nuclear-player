import { PauseIcon, PlayIcon, PowerIcon, RadioTowerIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  addToSelectsRotation,
  fetchAdminSelects,
  removeFromSelectsRotation,
  reorderSelectsRotation,
  searchAdminSelectsBrowse,
  startSelectsStream,
  stopSelectsStream,
  type AdminSelectsBrowseItem,
  type AdminSelectsItem,
  type AdminSelectsStream,
} from '../../../../api/admin';
import { PageLoading } from '../../../../components/PageStates';
import { StudioPanel } from '../../../../components/StudioPanel';
import { TahtiRotationPlaylistEditor } from '../../../../components/TahtiRotationPlaylistEditor';
import { usePlayerStore } from '../../../../stores/playerStore';

function fmtDuration(sec: number | null): string {
  if (!sec) {
    return '—';
  }
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Tahti Selects tab — ported as-is from the standalone admin route (see
 * AdminModerationView). Always-on curated rotation, editorial review. */
export function SelectsTab() {
  const play = usePlayerStore((s) => s.play);
  const currentId = usePlayerStore((state) => state.currentId);
  const playbackStatus = usePlayerStore((state) => state.status);
  const setPlaybackStatus = usePlayerStore((state) => state.setStatus);
  const [items, setItems] = useState<AdminSelectsItem[]>([]);
  const [stream, setStream] = useState<AdminSelectsStream>({
    state: 'OFFLINE',
    hlsUrl: null,
    nowPlaying: null,
  });
  const [loading, setLoading] = useState(true);
  const [streamBusy, setStreamBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [browse, setBrowse] = useState<AdminSelectsBrowseItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const recoveryAttempted = useRef(false);
  const selectsPlayableId = 'live:tahti-selects';
  const isStreamPlaying =
    currentId === selectsPlayableId &&
    (playbackStatus === 'playing' || playbackStatus === 'loading');

  const reload = useCallback(() => {
    void fetchAdminSelects().then((res) => {
      setItems(res.data.items);
      setStream(res.data.stream);
      setLoading(false);
    });
  }, []);

  useEffect(reload, [reload]);

  useEffect(() => {
    const intervalId = window.setInterval(reload, 4000);
    return () => window.clearInterval(intervalId);
  }, [reload]);

  useEffect(() => {
    if (
      loading ||
      stream.state !== 'OFFLINE' ||
      items.length === 0 ||
      recoveryAttempted.current
    ) {
      return;
    }
    recoveryAttempted.current = true;
    setStreamBusy(true);
    setStream((current) => ({ ...current, state: 'STARTING' }));
    void startSelectsStream().then((result) => {
      setStreamBusy(false);
      if (!result.ok) {
        setMsg(result.error);
        setStream((current) => ({ ...current, state: 'OFFLINE' }));
        return;
      }
      reload();
    });
  }, [items.length, loading, reload, stream.state]);

  useEffect(() => {
    if (!query.trim()) {
      setBrowse([]);
      return;
    }
    const handle = setTimeout(() => {
      void searchAdminSelectsBrowse(query).then((res) => setBrowse(res.data));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const inRotationIds = new Set(items.map((i) => i.archiveItemId));

  const toggleStreamPlayback = () => {
    if (!stream.hlsUrl) {
      return;
    }
    if (currentId === selectsPlayableId) {
      setPlaybackStatus(isStreamPlaying ? 'paused' : 'playing');
      return;
    }
    play({
      id: selectsPlayableId,
      kind: 'radio',
      title: stream.nowPlaying?.title ?? 'Tahti Selects',
      artist: stream.nowPlaying?.artistName ?? 'Tahti Selects',
      coverUrl: stream.nowPlaying?.artworkUrl ?? undefined,
      streamUrl: stream.hlsUrl,
      protocol: stream.hlsUrl.includes('.m3u8') ? 'hls' : 'https',
      channelSlug: 'tahti-selects',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-foreground-secondary text-sm">
          Always-on curated rotation — loops endlessly. Only public archive
          items can be added.
        </p>
        <Button
          size="sm"
          variant={stream.state === 'LIVE' ? 'secondary' : 'default'}
          disabled={streamBusy}
          onClick={() => {
            const action =
              stream.state === 'LIVE' ? stopSelectsStream : startSelectsStream;
            setStreamBusy(true);
            setStream((current) => ({
              ...current,
              state: current.state === 'LIVE' ? current.state : 'STARTING',
            }));
            void action().then((r) => {
              setStreamBusy(false);
              if (!r.ok) {
                setMsg(r.error);
              } else {
                if (stream.state === 'LIVE') {
                  setStream({
                    state: 'OFFLINE',
                    hlsUrl: null,
                    nowPlaying: null,
                  });
                } else {
                  reload();
                }
              }
            });
          }}
        >
          <PowerIcon size={16} aria-hidden className="mr-1.5" />
          {streamBusy
            ? 'Starting…'
            : stream.state === 'LIVE'
              ? 'Stop stream'
              : 'Bring stream online'}
        </Button>
      </div>

      {msg && (
        <p className="text-foreground-secondary text-sm" role="status">
          {msg}
        </p>
      )}

      <StudioPanel
        title={
          stream.state === 'LIVE'
            ? 'Stream live'
            : stream.state === 'STARTING'
              ? 'Stream starting'
              : 'Stream offline'
        }
        description={
          stream.state === 'LIVE'
            ? 'Tahti Selects is broadcasting the curated rotation.'
            : stream.state === 'STARTING'
              ? 'The rotation service is being brought online.'
              : 'The stream is unavailable. Recovery will be attempted automatically.'
        }
        action={
          stream.state === 'LIVE' && stream.hlsUrl ? (
            <Button
              size="sm"
              aria-label={
                isStreamPlaying
                  ? 'Pause Tahti Selects stream'
                  : 'Play Tahti Selects stream'
              }
              onClick={toggleStreamPlayback}
            >
              {isStreamPlaying ? (
                <PauseIcon size={16} aria-hidden className="mr-1.5" />
              ) : (
                <PlayIcon size={16} aria-hidden className="mr-1.5" />
              )}
              {isStreamPlaying ? 'Pause' : 'Listen'}
            </Button>
          ) : undefined
        }
      >
        <div className="border-border bg-background flex items-center gap-3 rounded-lg border p-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
              stream.state === 'LIVE'
                ? 'bg-accent-green/20 text-accent-green'
                : stream.state === 'STARTING'
                  ? 'bg-accent-yellow/20 text-accent-yellow'
                  : 'bg-background-secondary text-foreground-secondary'
            }`}
          >
            <RadioTowerIcon size={20} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
              {stream.state === 'LIVE' ? 'Now playing' : 'Playback state'}
            </p>
            <p className="truncate font-semibold">
              {stream.nowPlaying?.title ??
                (stream.state === 'STARTING'
                  ? 'Connecting rotation…'
                  : 'No active track')}
            </p>
            {stream.nowPlaying ? (
              <p className="text-foreground-secondary truncate text-sm">
                {stream.nowPlaying.artistName}
              </p>
            ) : null}
          </div>
        </div>
      </StudioPanel>

      <StudioPanel title={`Current rotation (${items.length})`}>
        {loading ? (
          <PageLoading label="Loading Selects rotation…" />
        ) : items.length === 0 ? (
          <p className="text-foreground-secondary py-4 text-center text-sm">
            Nothing in rotation yet — add tracks below.
          </p>
        ) : (
          <TahtiRotationPlaylistEditor
            items={items}
            onPreview={(item) => {
              if (!item.audioUrl) {
                return;
              }
              play({
                id: `archive:${item.archiveItemId}`,
                kind: 'archive',
                title: item.title,
                artist: item.artistName,
                streamUrl: item.audioUrl,
                protocol: item.audioUrl.includes('.m3u8') ? 'hls' : 'https',
                channelSlug: item.channelSlug,
              });
            }}
            onReorder={(next) => {
              const previous = items;
              setItems(next);
              void reorderSelectsRotation(next.map((item) => item.id)).then(
                (result) => {
                  if (!result.ok) {
                    setItems(previous);
                    setMsg(result.error);
                  }
                },
              );
            }}
            onRemove={(item) => {
              void removeFromSelectsRotation(item.id).then((result) => {
                if (!result.ok) {
                  setMsg(result.error);
                } else {
                  reload();
                }
              });
            }}
          />
        )}
      </StudioPanel>

      <StudioPanel title="Add from artist archives">
        <Input
          placeholder="Search public archive items by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        {query.trim() && (
          <ul className="divide-border mt-3 divide-y">
            {browse.length === 0 ? (
              <li className="text-foreground-secondary py-3 text-sm">
                No public archive items match &ldquo;{query}&rdquo;.
              </li>
            ) : (
              browse.map((item) => {
                const already = inRotationIds.has(item.id);
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-foreground-secondary text-xs">
                        {item.artistName} · {fmtDuration(item.durationSec)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {item.audioUrl && (
                        <Button
                          size="icon-sm"
                          variant="text"
                          aria-label={`Preview ${item.title}`}
                          title="Preview"
                          onClick={() => {
                            play({
                              id: `archive:${item.id}`,
                              kind: 'archive',
                              title: item.title,
                              artist: item.artistName,
                              streamUrl: item.audioUrl!,
                              protocol: 'https',
                              channelSlug: item.channelSlug,
                            });
                          }}
                        >
                          <PlayIcon size={16} aria-hidden />
                        </Button>
                      )}
                      {already ? (
                        <span className="text-foreground-secondary text-xs">
                          In rotation
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            void addToSelectsRotation(item).then((r) => {
                              if (!r.ok) {
                                setMsg(r.error);
                              } else {
                                reload();
                              }
                            });
                          }}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </StudioPanel>
    </div>
  );
}
