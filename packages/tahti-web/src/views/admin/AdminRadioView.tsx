import { PauseIcon, PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import {
  fetchAdminRadio,
  fetchAdminSelects,
  radioMoveToFront,
  radioOptOut,
  radioRemoveOptOut,
  removeFromSelectsRotation,
  reorderSelectsRotation,
  type AdminRadioData,
  type AdminSelectsItem,
} from '../../api/admin';
import { fetchRadioStation } from '../../api/client';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { TahtiRotationPlaylistEditor } from '../../components/TahtiRotationPlaylistEditor';
import { usePlayerStore } from '../../stores/playerStore';

function fmt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminRadioView() {
  const play = usePlayerStore((state) => state.play);
  const currentId = usePlayerStore((state) => state.currentId);
  const playbackStatus = usePlayerStore((state) => state.status);
  const setPlaybackStatus = usePlayerStore((state) => state.setStatus);
  const [data, setData] = useState<AdminRadioData | null>(null);
  const [rotation, setRotation] = useState<AdminSelectsItem[]>([]);
  const [station, setStation] = useState<Awaited<
    ReturnType<typeof fetchRadioStation>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void Promise.all([
      fetchAdminRadio(),
      fetchAdminSelects(),
      fetchRadioStation(),
    ]).then(([radioResult, rotationResult, stationResult]) => {
      setData(radioResult.data);
      setRotation(rotationResult.data.items);
      setStation(stationResult);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const stationPlayableId = 'radio:tahti-radio';
  const stationPlaying =
    currentId === stationPlayableId &&
    (playbackStatus === 'playing' || playbackStatus === 'loading');
  const togglePlayback = () => {
    if (!station?.playable) {
      return;
    }
    if (currentId === stationPlayableId) {
      setPlaybackStatus(stationPlaying ? 'paused' : 'playing');
      return;
    }
    play({ ...station.playable, id: stationPlayableId });
  };

  const preview = (item: AdminSelectsItem) => {
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
  };

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/radio" />
        <StudioPageHeader
          title="Tahti Radio"
          subtitle="Fair-rotation meta-stream — member channels, no editorial picks."
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        {loading || !data ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : (
          <>
            <StudioPanel
              title="Station monitor"
              description="The public Tahti Radio output, whether a guest is live or the curated rotation is carrying the station."
              action={
                station?.playable ? (
                  <Button
                    size="sm"
                    aria-label={
                      stationPlaying
                        ? 'Pause Tahti Radio stream'
                        : 'Play Tahti Radio stream'
                    }
                    onClick={togglePlayback}
                  >
                    {stationPlaying ? (
                      <PauseIcon size={15} aria-hidden className="mr-1.5" />
                    ) : (
                      <PlayIcon size={15} aria-hidden className="mr-1.5" />
                    )}
                    {stationPlaying ? 'Pause' : 'Listen'}
                  </Button>
                ) : undefined
              }
            >
              {station?.data.hlsUrl && station.data.nowPlaying ? (
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className="bg-accent-green size-2 rounded-full"
                    aria-hidden
                  />
                  <div>
                    <p className="text-accent-green text-xs font-semibold tracking-wide uppercase">
                      {data.nowPlaying.live
                        ? 'Live guest on air'
                        : 'Rotation on air'}
                    </p>
                    <p className="font-semibold">
                      {station.data.nowPlaying.title}
                    </p>
                    <p className="text-foreground-secondary">
                      {station.data.nowPlaying.artistName}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-foreground-secondary text-sm">
                  Station output is unavailable. This is truly offline, not
                  merely between live guests.
                </p>
              )}
              <p className="text-foreground-secondary mt-3 text-xs">
                Member relay:{' '}
                {data.nowPlaying.live && data.nowPlaying.artistName
                  ? `${data.nowPlaying.artistName} · /c/${data.nowPlaying.slug}`
                  : 'no live member channel · rotation should continue'}
              </p>
            </StudioPanel>

            <StudioPanel
              title="Tahti Radio rotation"
              description="Drag tracks into the exact order listeners will hear between live shows."
            >
              {rotation.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  Nothing is in rotation yet.
                </p>
              ) : (
                <TahtiRotationPlaylistEditor
                  items={rotation}
                  onPreview={preview}
                  onReorder={(next) => {
                    const previous = rotation;
                    setRotation(next);
                    void reorderSelectsRotation(
                      next.map((item) => item.id),
                    ).then((result) => {
                      if (!result.ok) {
                        setRotation(previous);
                        setMsg(result.error);
                      }
                    });
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

            <StudioPanel title={`Eligible channels (${data.eligible.length})`}>
              {data.eligible.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No member channels are live right now.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {data.eligible.map((ch) => (
                    <li
                      key={ch.channelId}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">{ch.artistName}</div>
                        <div className="text-foreground-secondary text-xs">
                          /c/{ch.slug} ·{' '}
                          {ch.lastFeaturedAt
                            ? `last featured ${fmt(ch.lastFeaturedAt)}`
                            : 'never featured'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            void radioMoveToFront(ch.channelId).then((r) => {
                              if (!r.ok) {
                                setMsg(r.error);
                              } else {
                                reload();
                              }
                            });
                          }}
                        >
                          Move to front
                        </Button>
                        <Button
                          size="sm"
                          variant="text"
                          onClick={() => {
                            void radioOptOut(ch.channelId).then((r) => {
                              if (!r.ok) {
                                setMsg(r.error);
                              } else {
                                reload();
                              }
                            });
                          }}
                        >
                          Opt out
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>

            {data.optedOut.length > 0 && (
              <StudioPanel title={`Opted out (${data.optedOut.length})`}>
                <ul className="divide-border divide-y">
                  {data.optedOut.map((ch) => (
                    <li
                      key={ch.channelId}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <span>{ch.artistName}</span>
                        <span className="text-foreground-secondary text-xs">
                          /c/{ch.slug}
                        </span>
                        {ch.isLive && (
                          <Badge variant="pill" color="green">
                            Live
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          void radioRemoveOptOut(ch.channelId).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              reload();
                            }
                          });
                        }}
                      >
                        Re-enable
                      </Button>
                    </li>
                  ))}
                </ul>
              </StudioPanel>
            )}

            <StudioPanel title="Feature history">
              {data.history.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No history yet.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {data.history.map((item, i) => (
                    <li
                      key={`${item.channelId}-${i}`}
                      className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
                    >
                      <span>{item.artistName}</span>
                      <span className="text-foreground-secondary text-xs">
                        {fmt(item.featuredAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>
          </>
        )}
      </div>
    </AdminGate>
  );
}
