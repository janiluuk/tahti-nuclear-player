import { Link, useSearch } from '@tanstack/react-router';
import {
  CheckCircle2Icon,
  GlobeIcon,
  PencilIcon,
  SearchIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, Input, SaveButton, Toggle } from '@nuclearplayer/ui';

import {
  checkSlugAvailable,
  setCustomDomain,
  updateChannelSlug,
  verifyCustomDomain,
} from '../../api/channel-design';
import {
  fetchMeProfile,
  fetchStatsPlays,
  patchMeProfile,
  type ProfileFields,
  type StatsPlays,
  type StatsPlaysRange,
} from '../../api/studio-extras';
import { ChannelAnnouncementsPanel } from '../../components/ChannelAnnouncementsPanel';
import { ChannelControlsWidget } from '../../components/ChannelControlsWidget';
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
  | 'selects'
  | 'profile'
  | 'domain';
type RadioTab =
  | 'stream'
  | 'rotation'
  | 'announcements'
  | 'pinned'
  | 'tahti-radio'
  | 'settings';

const RADIO_STATS_RANGES: StatsPlaysRange[] = ['1', '7', '30'];

const isTab = (value: string | undefined): value is Tab =>
  [
    'setup',
    'design',
    'radio',
    'green-room',
    'multicast',
    'selects',
    'profile',
    'domain',
  ].includes(value ?? '');

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
  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [tipJarUrl, setTipJarUrl] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [freeSubscriptionsEnabled, setFreeSubscriptionsEnabled] =
    useState(true);
  const [slug, setSlug] = useState(channel?.slug ?? '');
  const [slugNote, setSlugNote] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [domainInfo, setDomainInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchMeProfile().then((r) => {
      setProfile(r.data);
      setDisplayName(r.data.displayName);
      setBio(r.data.bio ?? '');
      setTipJarUrl(r.data.tipJarUrl ?? '');
      setPronouns(r.data.pronouns ?? '');
      setChatEnabled(r.data.chatEnabled);
      setFreeSubscriptionsEnabled(r.data.freeSubscriptionsEnabled !== false);
      setSlug(channel?.slug ?? r.data.username);
    });
  }, [channel?.slug]);

  useEffect(() => {
    if (isTab(search.tab) && (search.tab !== 'setup' || !channel)) {
      setTab(search.tab);
    } else if (!channel) {
      setTab('setup');
    } else {
      setTab('design');
    }
  }, [channel, search.tab]);

  const saveProfile = async () => {
    setBusy(true);
    const result = await patchMeProfile({
      displayName: displayName.trim(),
      bio: bio.trim() || null,
      tipJarUrl: tipJarUrl.trim() || null,
      pronouns: pronouns.trim() || null,
      chatEnabled,
      freeSubscriptionsEnabled,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setProfile(result.data);
    toast.success('Profile saved.');
  };

  return (
    <StudioGate requireChannel={false}>
      <div className="studio-page-layout mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <StudioNav
          current={
            search.tab ? `/studio/channel?tab=${search.tab}` : '/studio/channel'
          }
        />
        <StudioPageHeader
          title={tab === 'radio' ? 'Radio' : 'Channel'}
          subtitle={
            tab === 'radio'
              ? 'Manage your stream and 24/7 rotation.'
              : 'Manage your channel and public profile.'
          }
        />
        {user && tab !== 'radio' && (
          <Link
            to="/u/$username"
            params={{ username: user.username }}
            className="text-foreground-secondary -mt-2 text-xs underline-offset-2 hover:underline"
          >
            Open public profile →
          </Link>
        )}

        {tab !== 'radio' && (
          <nav
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Channel sections"
          >
            {(
              [
                { id: 'design' as const, label: 'Channel' },
                { id: 'radio' as const, label: '24/7 radio' },
                { id: 'profile' as const, label: 'Profile' },
                { id: 'domain' as const, label: 'Username / domain' },
              ] as const
            ).map((t) => (
              <Button
                key={t.id}
                type="button"
                variant="text"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                  tab === t.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border-border text-foreground-secondary hover:text-foreground border'
                }`}
              >
                {t.label}
              </Button>
            ))}
          </nav>
        )}

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
          <ChannelControlsWidget
            sections={[
              {
                id: 'channel-design',
                title: 'Channel appearance',
                description:
                  'Open the complete channel designer to edit visual presets, colours, and the header.',
                children: (
                  <div className="flex flex-col gap-3">
                    <p className="text-foreground-secondary text-sm">
                      Your channel is ready. The same channel controls are
                      available from the public channel editor.
                    </p>
                    {channel?.slug ? (
                      <Link
                        to="/channel/$slug"
                        params={{ slug: channel.slug }}
                        search={{ edit: '1' }}
                        className="text-sm font-medium underline-offset-2 hover:underline"
                      >
                        Open channel design editor →
                      </Link>
                    ) : null}
                  </div>
                ),
              },
            ]}
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
                  ['settings', 'Settings'],
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
            ) : (
              <BroadcastPanel section="radio" />
            )}
          </div>
        )}

        {tab === 'green-room' && <BroadcastPanel section="green-room" />}

        {tab === 'multicast' && <BroadcastPanel section="multistream" />}

        {tab === 'selects' && <SelectsTab />}

        {tab === 'profile' && (
          <StudioPanel title="Profile">
            <div className="flex flex-col gap-3">
              {!profile ? (
                <PageLoading label="Loading…" />
              ) : (
                <>
                  <Input
                    label="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-foreground-secondary text-xs uppercase">
                      Bio
                    </span>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="border-border bg-background rounded-md border px-3 py-2"
                    />
                  </label>
                  <Input
                    label="Pronouns"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                  />
                  <Input
                    label="Tip jar URL"
                    value={tipJarUrl}
                    onChange={(e) => setTipJarUrl(e.target.value)}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <Toggle
                      checked={chatEnabled}
                      onChange={setChatEnabled}
                      aria-label="Public channel chat enabled"
                    />
                    Public channel chat enabled
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Toggle
                      checked={freeSubscriptionsEnabled}
                      onChange={setFreeSubscriptionsEnabled}
                      aria-label="Allow free subscriptions"
                    />
                    Allow anyone to subscribe for free
                  </label>
                  <div className="flex justify-end">
                    <SaveButton
                      disabled={!displayName.trim()}
                      saving={busy}
                      label="Save profile"
                      onClick={() => void saveProfile()}
                    />
                  </div>
                </>
              )}
            </div>
          </StudioPanel>
        )}

        {tab === 'domain' && (
          <div className="flex flex-col gap-4">
            <StudioPanel title="Username / channel slug">
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void checkSlugAvailable(slug.trim()).then((r) => {
                      setSlugNote(
                        r.available
                          ? 'Available'
                          : `Not available${r.reason ? ` (${r.reason})` : ''}`,
                      );
                    });
                  }}
                >
                  <SearchIcon size={14} aria-hidden className="mr-1.5" />
                  Check availability
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    void updateChannelSlug(slug.trim()).then((r) => {
                      if (r.ok) {
                        setSlugNote(null);
                        toast.success(`Renamed to ${r.slug}`);
                      } else {
                        toast.error(r.error);
                      }
                    });
                  }}
                >
                  <PencilIcon size={14} aria-hidden className="mr-1.5" />
                  Rename
                </Button>
              </div>
              {slugNote && (
                <p className="text-foreground-secondary mt-2 text-xs">
                  {slugNote}
                </p>
              )}
            </StudioPanel>

            <StudioPanel title="Custom domain">
              <p className="text-foreground-secondary mb-3 text-xs">
                Requires membership. Current:{' '}
                {channel?.customDomain
                  ? `${channel.customDomain}${channel.customDomainVerified ? ' (verified)' : ' (pending)'}`
                  : 'none'}
              </p>
              <Input
                label="Domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="music.example.com"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    void setCustomDomain(domain.trim()).then((r) => {
                      if (!r.ok) {
                        toast.error(r.error);
                        return;
                      }
                      // Stays inline, not a toast: these are DNS records the
                      // user has to read and copy into their registrar.
                      setDomainInfo(
                        `Add TXT ${r.txtHost} = ${r.txtRecord}, then Verify.`,
                      );
                    });
                  }}
                >
                  <GlobeIcon size={14} aria-hidden className="mr-1.5" />
                  Set domain
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void verifyCustomDomain().then((r) => {
                      if (!r.ok) {
                        toast.error(r.error);
                      } else if (r.verified) {
                        toast.success('Domain verified.');
                      } else {
                        toast.warning(
                          'Not verified yet — DNS may still be propagating.',
                        );
                      }
                    });
                  }}
                >
                  <CheckCircle2Icon size={14} aria-hidden className="mr-1.5" />
                  Verify DNS
                </Button>
              </div>
              {domainInfo && (
                <p className="text-foreground-secondary mt-2 text-xs">
                  {domainInfo}
                </p>
              )}
            </StudioPanel>
          </div>
        )}
      </div>
    </StudioGate>
  );
}
