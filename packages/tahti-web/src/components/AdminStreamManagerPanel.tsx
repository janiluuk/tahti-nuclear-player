import { useCallback, useEffect, useState } from 'react';

import { Button, Dialog } from '@nuclearplayer/ui';

import {
  fetchAdminStreams,
  forceStreamOffline,
  pauseStream,
  restartStream,
  resumeStream,
  skipStreamTrack,
  type AdminLiveStreamRow,
} from '../api/admin';
import {
  fetchChannelManageStats,
  type ChannelManageStats,
} from '../api/broadcast';
import { PageLoading } from './PageStates';
import { StudioPanel } from './StudioPanel';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

export function AdminStreamManagerPanel({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  const [streams, setStreams] = useState<AdminLiveStreamRow[]>([]);
  const [streamStats, setStreamStats] = useState<
    Record<string, ChannelManageStats>
  >({});
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [detailsStream, setDetailsStream] = useState<AdminLiveStreamRow | null>(
    null,
  );

  const reload = useCallback(() => {
    void fetchAdminStreams().then(async (result) => {
      setStreams(result.data);
      const stats = await Promise.all(
        result.data.map(async (stream) => {
          const response = await fetchChannelManageStats(stream.slug);
          return response.data ? ([stream.slug, response.data] as const) : null;
        }),
      );
      setStreamStats(
        Object.fromEntries(
          stats.filter(
            (entry): entry is [string, ChannelManageStats] => entry !== null,
          ),
        ),
      );
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const run = (
    slug: string,
    action: (
      streamSlug: string,
    ) => Promise<{ ok: true } | { ok: false; error: string }>,
    confirmText?: string,
  ) => {
    if (confirmText && !window.confirm(confirmText)) {
      return;
    }
    setBusySlug(slug);
    void action(slug).then((result) => {
      setBusySlug(null);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(null);
      reload();
    });
  };

  const content = loading ? (
    <PageLoading label="Loading streams…" />
  ) : streams.length === 0 ? (
    <p className="text-foreground-secondary py-4 text-center text-sm">
      No channels are live right now.
    </p>
  ) : (
    <ul className="divide-border divide-y">
      {streams.map((stream) => (
        <li key={stream.slug} className="py-3 first:pt-0 last:pb-0">
          {(() => {
            const stats = streamStats[stream.slug];
            return (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">
                      {stream.artistName}
                      {stream.isRotation && (
                        <span className="text-foreground-secondary font-normal">
                          {' '}
                          · rotation
                        </span>
                      )}
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      /c/{stream.slug} · live{' '}
                      {formatDuration(stream.elapsedSec)}
                      {stream.goneLiveAt
                        ? ` since ${new Date(stream.goneLiveAt).toLocaleTimeString()}`
                        : ''}
                    </div>
                    {stats ? (
                      <div className="text-foreground-secondary mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        <span>
                          {stats.listeners.toLocaleString()} listeners
                        </span>
                        <span>{stats.listenerPeak.toLocaleString()} peak</span>
                        {stats.liveDurationSec != null ? (
                          <span>
                            {formatDuration(stats.liveDurationSec)} tracked
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    {stream.hlsUrl && (
                      <a
                        href={stream.hlsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                      >
                        Listen
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => setDetailsStream(stream)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busySlug === stream.slug}
                    onClick={() =>
                      run(
                        stream.slug,
                        restartStream,
                        `Restart audio for ${stream.slug}? The channel stays live; listeners may briefly reconnect.`,
                      )
                    }
                  >
                    Restart
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busySlug === stream.slug}
                    onClick={() => run(stream.slug, skipStreamTrack)}
                  >
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busySlug === stream.slug}
                    onClick={() => run(stream.slug, pauseStream)}
                  >
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busySlug === stream.slug}
                    onClick={() => run(stream.slug, resumeStream)}
                  >
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="text"
                    disabled={busySlug === stream.slug}
                    onClick={() =>
                      run(
                        stream.slug,
                        forceStreamOffline,
                        `Force ${stream.slug} offline? This ends the broadcast immediately.`,
                      )
                    }
                  >
                    Force offline
                  </Button>
                </div>
              </>
            );
          })()}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {showHeading ? (
        <StudioPanel
          title={`Live streams (${streams.length})`}
          description="Monitor active channels and control their live audio."
        >
          {message && (
            <p className="text-foreground-secondary mb-3 text-sm" role="status">
              {message}
            </p>
          )}
          {content}
        </StudioPanel>
      ) : (
        <>
          {message && (
            <p className="text-foreground-secondary mb-3 text-sm" role="status">
              {message}
            </p>
          )}
          {content}
        </>
      )}
      <Dialog.Root
        isOpen={detailsStream !== null}
        onClose={() => setDetailsStream(null)}
        className="max-w-lg"
      >
        {detailsStream ? (
          <>
            <Dialog.Title>{detailsStream.artistName}</Dialog.Title>
            <Dialog.Description>
              Live channel details for /c/{detailsStream.slug}.
            </Dialog.Description>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-foreground-secondary">Username</dt>
              <dd>{detailsStream.username}</dd>
              <dt className="text-foreground-secondary">Duration</dt>
              <dd>{formatDuration(detailsStream.elapsedSec)}</dd>
              {streamStats[detailsStream.slug] ? (
                <>
                  <dt className="text-foreground-secondary">Listeners</dt>
                  <dd>
                    {streamStats[
                      detailsStream.slug
                    ]!.listeners.toLocaleString()}
                  </dd>
                  <dt className="text-foreground-secondary">Listener peak</dt>
                  <dd>
                    {streamStats[
                      detailsStream.slug
                    ]!.listenerPeak.toLocaleString()}
                  </dd>
                </>
              ) : null}
              <dt className="text-foreground-secondary">Mode</dt>
              <dd>
                {detailsStream.isRotation ? 'Rotation' : 'Live broadcast'}
              </dd>
              {detailsStream.goneLiveAt ? (
                <>
                  <dt className="text-foreground-secondary">Started</dt>
                  <dd>{new Date(detailsStream.goneLiveAt).toLocaleString()}</dd>
                </>
              ) : null}
              {detailsStream.hlsUrl ? (
                <>
                  <dt className="text-foreground-secondary">Stream</dt>
                  <dd className="min-w-0 break-all">{detailsStream.hlsUrl}</dd>
                </>
              ) : null}
            </dl>
            <Dialog.Actions>
              <Dialog.Close>Close</Dialog.Close>
              <a
                href={`/c/${detailsStream.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button>Open channel</Button>
              </a>
            </Dialog.Actions>
          </>
        ) : null}
      </Dialog.Root>
    </>
  );
}
