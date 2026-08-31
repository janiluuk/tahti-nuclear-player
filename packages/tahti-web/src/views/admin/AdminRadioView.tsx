import { PauseIcon, PlayIcon, RadioTowerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import {
  fetchAdminRadio,
  fetchAdminRadioRotation,
  radioMoveToFront,
  radioOptOut,
  radioRemoveOptOut,
  type AdminRadioData,
  type AdminSelectsItem,
} from '../../api/admin';
import { fetchRadioStation } from '../../api/client';
import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
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
      fetchAdminRadioRotation(),
      fetchRadioStation(),
    ]).then(([radioResult, rotationResult, stationResult]) => {
      setData(radioResult.data);
      setRotation(rotationResult.data);
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
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/radio">
          <div className="flex max-w-4xl flex-col gap-6">
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
                <PageLoading label="Loading radio…" />
              </StudioPanel>
            ) : (
              <>
                <StudioPanel
                  title={
                    station?.data.hlsUrl && station.data.nowPlaying
                      ? 'Stream live'
                      : 'Stream offline'
                  }
                  description={
                    station?.data.hlsUrl && station.data.nowPlaying
                      ? 'Tahti Radio is broadcasting the member rotation or a live guest channel.'
                      : 'The Tahti Radio stream is currently unavailable.'
                  }
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
                  <div className="border-border bg-background flex items-center gap-3 rounded-lg border p-3">
                    <div className="bg-background-secondary text-foreground-secondary flex size-10 shrink-0 items-center justify-center rounded-full">
                      <RadioTowerIcon size={20} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
                        {station?.data.hlsUrl && station.data.nowPlaying
                          ? data.nowPlaying.live
                            ? 'Live guest on air'
                            : 'Rotation on air'
                          : 'Playback state'}
                      </p>
                      <p className="truncate font-semibold">
                        {station?.data.nowPlaying?.title ?? 'No active track'}
                      </p>
                      {station?.data.nowPlaying ? (
                        <p className="text-foreground-secondary truncate text-sm">
                          {station.data.nowPlaying.artistName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-foreground-secondary mt-3 text-xs">
                    Member relay:{' '}
                    {data.nowPlaying.live && data.nowPlaying.artistName
                      ? `${data.nowPlaying.artistName} · /c/${data.nowPlaying.slug}`
                      : 'no live member channel · rotation should continue'}
                  </p>
                </StudioPanel>

                <StudioPanel
                  title={`Current rotation (${rotation.length})`}
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
                      readOnly
                      onReorder={() => undefined}
                      onRemove={() => undefined}
                    />
                  )}
                </StudioPanel>

                <StudioPanel
                  title={`Eligible channels (${data.eligible.length})`}
                >
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
                                void radioMoveToFront(ch.channelId).then(
                                  (r) => {
                                    if (!r.ok) {
                                      setMsg(r.error);
                                    } else {
                                      reload();
                                    }
                                  },
                                );
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
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
