import { Navigate, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@tahti-player/ui';

import {
  fetchStatsPlays,
  type StatsPlays,
  type StatsPlaysRange,
} from '../../api/studio-extras';
import { ChannelAnnouncementsPanel } from '../../components/ChannelAnnouncementsPanel';
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

type Tab = 'setup' | 'radio' | 'green-room' | 'selects';
type RadioTab =
  | 'stream'
  | 'rotation'
  | 'announcements'
  | 'pinned'
  | 'tahti-radio'
  | 'multicast';

const RADIO_STATS_RANGES: StatsPlaysRange[] = ['1', '7', '30'];

const isTab = (value: string | undefined): value is Tab =>
  ['setup', 'radio', 'green-room', 'selects'].includes(value ?? '');

const DESIGNER_TABS = new Set(['design', 'profile']);

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
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openChannelSetup = useChannelSetupModalStore((s) => s.open);
  const channel = user?.channel;
  const [tab, setTab] = useState<Tab>(channel ? 'green-room' : 'setup');
  const [radioTab, setRadioTab] = useState<RadioTab>('stream');

  useEffect(() => {
    if (search.tab === 'multicast') {
      setTab('radio');
      setRadioTab('multicast');
      return;
    }
    if (isTab(search.tab) && (search.tab !== 'setup' || !channel)) {
      setTab(search.tab);
      if (search.tab === 'radio') {
        setRadioTab('stream');
      }
    } else if (!channel) {
      setTab('setup');
    } else {
      setTab('green-room');
    }
  }, [channel, search.tab]);

  if (DESIGNER_TABS.has(search.tab ?? '')) {
    return (
      <Navigate to="/studio/branding" search={{ tab: 'channel-designer' }} />
    );
  }

  return (
    <StudioGate requireChannel={false}>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav
          current={
            search.tab ? `/studio/channel?tab=${search.tab}` : '/studio/channel'
          }
        />
        <StudioPageHeader
          title={tab === 'radio' ? 'Radio' : 'Channel'}
          subtitle={
            tab === 'radio'
              ? 'Manage your stream, 24/7 rotation, and multicast destinations.'
              : 'Set up the channel, green room, and selects.'
          }
        />

        {tab !== 'radio' ? (
          <nav
            className="border-border flex w-fit flex-wrap gap-1 rounded-lg border p-1"
            role="tablist"
            aria-label="Channel sections"
          >
            {(
              [
                ...(!channel ? ([['setup', 'Setup']] as const) : []),
                ['green-room', 'Green room'],
                ['selects', 'Selects'],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant="text"
                role="tab"
                aria-selected={tab === id}
                onClick={() => {
                  setTab(id);
                  void navigate({
                    to: '/studio/channel',
                    search: { tab: id },
                  });
                }}
                className={
                  tab === id
                    ? 'bg-primary text-primary-foreground rounded-md'
                    : 'text-foreground-secondary rounded-md'
                }
              >
                {label}
              </Button>
            ))}
          </nav>
        ) : null}

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
                  ['multicast', 'Multicast'],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant="text"
                  role="tab"
                  aria-selected={radioTab === id}
                  onClick={() => {
                    setRadioTab(id);
                    if (id === 'multicast' || search.tab === 'multicast') {
                      void navigate({
                        to: '/studio/channel',
                        search: {
                          tab: id === 'multicast' ? 'multicast' : 'radio',
                        },
                      });
                    }
                  }}
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
            ) : radioTab === 'multicast' ? (
              <BroadcastPanel section="multistream" />
            ) : null}
          </div>
        )}

        {tab === 'green-room' && <BroadcastPanel section="green-room" />}

        {tab === 'selects' && <SelectsTab />}
      </div>
    </StudioGate>
  );
}
