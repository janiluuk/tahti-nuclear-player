import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@tahti-player/ui';

import {
  fetchStatsPlays,
  type StatsPlays,
  type StatsPlaysRange,
} from '../../api/studio-extras';
import { ChannelAnnouncementsPanel } from '../../components/ChannelAnnouncementsPanel';
import { ChannelDesigner } from '../../components/ChannelDesigner';
import { ChannelRadioPlaylistPanel } from '../../components/ChannelRadioPlaylistPanel';
import { PageLoading } from '../../components/PageStates';
import { PinnedAnnouncementsPanel } from '../../components/PinnedAnnouncementsPanel';
import { StreamManagerPanel } from '../../components/StreamManagerPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { StudioRadioSubmissionPanel } from '../../components/StudioRadioSubmissionPanel';
import { useAuthStore } from '../../stores/authStore';
import { useChannelSetupModalStore } from '../../stores/channelSetupModalStore';
import { SelectsTab } from '../admin/moderation/tabs/SelectsTab';
import { BroadcastPanel } from '../settings/SettingsPanels';

type Tab =
  | 'setup'
  | 'design'
  | 'radio'
  | 'green-room'
  | 'multicast'
  | 'selects';
type RadioTab =
  | 'stream'
  | 'rotation'
  | 'announcements'
  | 'pinned'
  | 'tahti-radio';

const RADIO_STATS_RANGES: StatsPlaysRange[] = ['1', '7', '30'];

const isTab = (value: string | undefined): value is Tab =>
  ['setup', 'design', 'radio', 'green-room', 'multicast', 'selects'].includes(
    value ?? '',
  );

function ChannelOverallStats() {
  const [stats, setStats] = useState<
    Partial<Record<StatsPlaysRange, StatsPlays>>
  >({});

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      RADIO_STATS_RANGES.map((range) => fetchStatsPlays(range)),
    ).then((results) => {
      if (cancelled) {
        return;
      }
      const next: Partial<Record<StatsPlaysRange, StatsPlays>> = {};
      results.forEach((result, index) => {
        const range = RADIO_STATS_RANGES[index];
        if (range) {
          next[range] = result.data;
        }
      });
      setStats(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StudioPanel title="Overall statistics">
      {RADIO_STATS_RANGES.every((range) => !stats[range]) ? (
        <PageLoading label="Loading statistics…" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {RADIO_STATS_RANGES.map((range) => {
            const periodStats = stats[range];
            return (
              <div
                key={range}
                className="border-border bg-background-secondary/40 rounded-lg border p-3"
              >
                <p className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
                  Last {range} day{range === '1' ? '' : 's'}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {periodStats?.totalPlays.toLocaleString() ?? '—'}
                </p>
                <p className="text-foreground-secondary text-xs">
                  plays · {periodStats?.totalDownloads.toLocaleString() ?? '—'}{' '}
                  downloads
                </p>
              </div>
            );
          })}
        </div>
      )}
    </StudioPanel>
  );
}

export function StudioChannelView() {
  const search = useSearch({ strict: false }) as { tab?: string };
  const user = useAuthStore((s) => s.user);
  const openChannelSetup = useChannelSetupModalStore((s) => s.open);
  const channel = user?.channel;
  const [tab, setTab] = useState<Tab>(channel ? 'design' : 'setup');
  const [radioTab, setRadioTab] = useState<RadioTab>('stream');

  useEffect(() => {
    if (isTab(search.tab) && (search.tab !== 'setup' || !channel)) {
      setTab(search.tab);
    } else if (!channel) {
      setTab('setup');
    } else {
      setTab('design');
    }
  }, [channel, search.tab]);

  return (
    <StudioGate requireChannel={false}>
      <div
        className={`studio-page-layout mx-auto flex flex-col gap-6 px-1 py-2 ${
          tab === 'design' ? 'w-full max-w-none' : 'max-w-5xl'
        }`}
      >
        <StudioNav
          current={
            search.tab ? `/studio/channel?tab=${search.tab}` : '/studio/channel'
          }
        />
        <StudioPageHeader
          title={
            tab === 'radio'
              ? 'Radio'
              : tab === 'multicast'
                ? 'Multicast'
                : 'Channel design'
          }
          subtitle={
            tab === 'radio'
              ? 'Manage your stream and 24/7 rotation.'
              : tab === 'multicast'
                ? 'Manage the services that mirror your live broadcast.'
                : 'Design your channel, background media, visualizer, and header.'
          }
        />

        {tab === 'setup' && !channel && (
          <StudioPanel title="Channel setup">
            <div className="flex flex-col items-start gap-3">
              <p className="text-foreground-secondary text-sm">
                Create {user?.username ?? 'your-name'}.tahti.live to unlock
                broadcasting, uploads, and your public channel.
              </p>
              <Button disabled={!user} onClick={openChannelSetup}>
                Create {user?.username ?? 'your-name'}.tahti.live
              </Button>
            </div>
          </StudioPanel>
        )}

        {tab === 'design' && user && (
          <ChannelDesigner
            displayName={user.displayName}
            username={user.username}
            channelSlug={channel?.slug}
            avatarUrl={user.avatarUrl}
          />
        )}

        {tab === 'radio' && (
          <div className="flex flex-col gap-4">
            <nav
              className="border-border flex w-fit flex-wrap gap-1 rounded-lg border p-1"
              role="tablist"
              aria-label="Radio settings"
            >
              {(
                [
                  ['stream', 'Stream'],
                  ['rotation', '24/7'],
                  ['announcements', 'Announcements'],
                  ['pinned', 'Pinned'],
                  ['tahti-radio', 'Tahti Radio'],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant="text"
                  role="tab"
                  aria-selected={radioTab === id}
                  onClick={() => setRadioTab(id)}
                  className={
                    radioTab === id
                      ? 'bg-primary text-primary-foreground rounded-md'
                      : 'text-foreground-secondary rounded-md'
                  }
                >
                  {label}
                </Button>
              ))}
            </nav>
            {radioTab === 'stream' ? (
              channel?.slug ? (
                <>
                  <StreamManagerPanel
                    slug={channel.slug}
                    channelState={channel.state}
                  />
                  <ChannelOverallStats />
                </>
              ) : (
                <StudioPanel title="Stream manager">
                  <p className="text-foreground-secondary text-sm">
                    Create your channel first to manage its stream.
                  </p>
                </StudioPanel>
              )
            ) : radioTab === 'rotation' ? (
              <ChannelRadioPlaylistPanel />
            ) : radioTab === 'announcements' ? (
              <ChannelAnnouncementsPanel />
            ) : radioTab === 'pinned' ? (
              channel?.slug ? (
                <PinnedAnnouncementsPanel slug={channel.slug} />
              ) : null
            ) : radioTab === 'tahti-radio' ? (
              <StudioRadioSubmissionPanel />
            ) : null}
          </div>
        )}

        {tab === 'green-room' && <BroadcastPanel section="green-room" />}

        {tab === 'multicast' && <BroadcastPanel section="multistream" />}

        {tab === 'selects' && <SelectsTab />}
      </div>
    </StudioGate>
  );
}
