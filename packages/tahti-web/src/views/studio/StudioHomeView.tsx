import { Link } from '@tanstack/react-router';
import {
  BarChart3Icon,
  CalendarIcon,
  DiscAlbumIcon,
  LayoutTemplateIcon,
  LibraryBigIcon,
  MicIcon,
  NewspaperIcon,
  RadioIcon,
  RocketIcon,
  UploadCloudIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type FC, type ReactNode } from 'react';

import { Badge, Button, CardGrid } from '@nuclearplayer/ui';

import { fetchShowSchedule, type ScheduledShow } from '../../api/shows';
import {
  fetchStudioArchive,
  fetchStudioCollections,
  fetchStudioReleases,
} from '../../api/studio';
import { fetchStatsSummary, type StatsSummary } from '../../api/studio-extras';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { accountRoleLabel, getAccountRole } from '../../lib/accountRoles';
import { timeOfDayGreeting } from '../../lib/greeting';
import { useAuthStore } from '../../stores/authStore';
import { useChannelSetupModalStore } from '../../stores/channelSetupModalStore';

type Counts = { archive: number; collections: number; releases: number };

const EMPTY_STATS: StatsSummary = {
  playsToday: 0,
  playsTotal: 0,
  downloadsToday: 0,
  downloadsTotal: 0,
  followerCount: 0,
};

const channelStatusColor = (
  state: string | undefined,
): 'green' | 'cyan' | 'secondary' => {
  if (state === 'LIVE') {
    return 'green';
  }
  if (state === 'PREVIEW') {
    return 'cyan';
  }
  return 'secondary';
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2>
        <Eyebrow>{title}</Eyebrow>
      </h2>
      {children}
    </section>
  );
}

/** Colour-coded, icon-first nav tile — the label sits in a translucent
 * strip over the icon (opacity layer) so it stays legible regardless of
 * the tile's background colour, instead of plain text below an artwork
 * square like the music Card component. */
function StudioActionTile({
  to,
  icon: Icon,
  label,
  subtitle,
  color,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="group border-border relative flex aspect-[4/3] flex-col overflow-hidden rounded-xl border shadow-sm transition-transform hover:-translate-y-0.5"
      style={{ background: color }}
    >
      <div className="relative z-10 bg-black/45 px-3 py-2 backdrop-blur-sm">
        <div className="truncate text-sm font-bold text-white">{label}</div>
        {subtitle ? (
          <div className="truncate text-[11px] text-white/75">{subtitle}</div>
        ) : null}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          size={40}
          absoluteStrokeWidth
          strokeWidth={1.5}
          className="text-white/90 transition-transform group-hover:scale-110"
          aria-hidden
        />
      </div>
    </Link>
  );
}

type CompactBroadcastTileProps = {
  to: '/studio/go-live' | '/studio/schedule';
  icon: LucideIcon;
  label: string;
  subtitle: string;
  color: string;
};

const CompactBroadcastTile: FC<CompactBroadcastTileProps> = ({
  to,
  icon: Icon,
  label,
  subtitle,
  color,
}) => (
  <Link
    to={to}
    data-testid="compact-broadcast-card"
    className="border-border bg-background-secondary/40 hover:bg-background-secondary group flex min-h-20 items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-transform hover:-translate-y-0.5"
  >
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white"
      style={{ background: color }}
    >
      <Icon size={22} aria-hidden />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-bold">{label}</span>
      <span className="text-foreground-secondary block truncate text-xs">
        {subtitle}
      </span>
    </span>
  </Link>
);

type SummaryStatProps = {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
};

const SummaryStat: FC<SummaryStatProps> = ({
  label,
  value,
  note,
  icon: Icon,
}) => (
  <Link
    to="/studio/stats"
    aria-label={`${value.toLocaleString()} ${label.toLowerCase()}`}
    className="border-border bg-background-secondary/35 hover:bg-background-secondary group flex min-w-0 flex-col gap-2 rounded-xl border p-4 shadow-sm transition-transform hover:-translate-y-0.5"
  >
    <span className="text-foreground-secondary flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
      <Icon size={15} aria-hidden className="text-primary" />
      {label}
    </span>
    <span className="font-display text-2xl font-extrabold tabular-nums">
      {value.toLocaleString()}
    </span>
    <span className="text-foreground-secondary text-xs">{note}</span>
  </Link>
);

export function StudioHomeView() {
  const user = useAuthStore((s) => s.user);
  const openChannelSetup = useChannelSetupModalStore((s) => s.open);
  const [counts, setCounts] = useState<Counts>({
    archive: 0,
    collections: 0,
    releases: 0,
  });
  const [stats, setStats] = useState<StatsSummary>(EMPTY_STATS);
  const [upcomingShows, setUpcomingShows] = useState<ScheduledShow[]>([]);

  useEffect(() => {
    if (!user?.channel) {
      return;
    }
    void Promise.all([
      fetchStudioArchive(),
      fetchStudioCollections(),
      fetchStudioReleases(),
      fetchStatsSummary(),
      fetchShowSchedule(),
    ]).then(([archive, collections, releases, summary, showSchedule]) => {
      setCounts({
        archive: archive.data.length,
        collections: collections.data.length,
        releases: releases.data.releases.length,
      });
      setStats(summary.data);
      setUpcomingShows(
        showSchedule.data.scheduledShows
          .filter((show) => new Date(show.startAt).getTime() > Date.now())
          .sort(
            (left, right) =>
              new Date(left.startAt).getTime() -
              new Date(right.startAt).getTime(),
          ),
      );
    });
  }, [user?.channel]);

  const channel = user?.channel;

  return (
    <StudioGate requireChannel={false}>
      <div className="studio-page-layout mx-auto flex max-w-3xl flex-col gap-8">
        <StudioNav current="/studio" />

        <div className="flex justify-end">
          <Link
            to="/help"
            className="text-foreground-secondary hover:text-foreground text-xs underline-offset-2 hover:underline"
          >
            Help center →
          </Link>
        </div>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {user
                ? `${timeOfDayGreeting(new Date().getHours())}, ${user.displayName || user.username}`
                : 'Studio'}
            </h1>
            {user ? (
              <p className="text-foreground-secondary mt-1 text-xs font-semibold tracking-wide uppercase">
                Studio
              </p>
            ) : null}
            {user ? (
              <div
                aria-label="Account status"
                className="mt-3 flex flex-wrap items-center gap-2"
              >
                <Badge variant="pill" color="purple">
                  {accountRoleLabel(getAccountRole(user))}
                </Badge>
                <Badge
                  variant="pill"
                  color={user.isMember ? 'green' : 'secondary'}
                >
                  {user.isMember ? 'Member' : 'Community account'}
                </Badge>
                <Badge
                  variant="pill"
                  color={channelStatusColor(channel?.state)}
                >
                  {channel
                    ? `Channel ${channel.state.toLowerCase()}`
                    : 'No channel'}
                </Badge>
              </div>
            ) : null}
            {channel ? (
              <p className="text-foreground-secondary mt-1 text-sm">
                <span className="text-foreground font-medium">
                  {user.displayName || channel.slug}
                </span>
                <span className="opacity-60"> /{channel.slug}</span>
                <span className="ml-2 text-xs tracking-wide uppercase opacity-70">
                  {channel.state}
                </span>
              </p>
            ) : (
              <p className="text-foreground-secondary mt-1 text-sm">
                <button
                  type="button"
                  onClick={openChannelSetup}
                  className="text-foreground underline-offset-2 hover:underline"
                >
                  Create your channel
                </button>{' '}
                to unlock Music and Go Live.
              </p>
            )}
          </div>
        </header>

        {!channel ? null : (
          <>
            <section
              aria-label="Channel summary"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              <SummaryStat
                label="Plays today"
                value={stats.playsToday}
                note="Open detailed stats"
                icon={RadioIcon}
              />
              <SummaryStat
                label="Total plays"
                value={stats.playsTotal}
                note="All-time audience"
                icon={BarChart3Icon}
              />
              <SummaryStat
                label="Total downloads"
                value={stats.downloadsTotal}
                note={`${stats.downloadsToday.toLocaleString()} today`}
                icon={UploadCloudIcon}
              />
              <SummaryStat
                label="Followers"
                value={stats.followerCount}
                note="Audience overview"
                icon={UsersIcon}
              />
            </section>

            <Group title="Broadcast">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CompactBroadcastTile
                  to="/studio/go-live"
                  icon={RadioIcon}
                  label="Go Live"
                  subtitle="Keys, signal, on-air"
                  color="var(--accent-red)"
                />
                <CompactBroadcastTile
                  to="/studio/schedule"
                  icon={CalendarIcon}
                  label="Schedule"
                  subtitle="Next show & programme"
                  color="var(--accent-blue)"
                />
              </div>
            </Group>
            {upcomingShows.length > 0 ? (
              <Group title="Upcoming shows">
                <ul className="border-border divide-border divide-y rounded-xl border">
                  {upcomingShows.map((show) => (
                    <li
                      key={show.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3"
                    >
                      <span className="bg-accent-blue/15 text-accent-blue flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <CalendarIcon size={20} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {show.title}
                          {show.episodeNumber != null
                            ? ` · Episode ${show.episodeNumber}`
                            : ''}
                        </p>
                        <p className="text-foreground-secondary text-xs">
                          {new Date(show.startAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                          {show.venue ? ` · ${show.venue}` : ''}
                        </p>
                      </div>
                      <Link
                        to="/studio/shows/$id"
                        params={{ id: show.seriesId }}
                      >
                        <Button size="sm" variant="secondary">
                          View &amp; edit
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Group>
            ) : null}
            <Group title="Music">
              <CardGrid>
                <StudioActionTile
                  to="/studio/shows"
                  icon={MicIcon}
                  label="Shows"
                  subtitle="Episodes & slots"
                  color="var(--accent-purple)"
                />
                <StudioActionTile
                  to="/studio/archive"
                  icon={LibraryBigIcon}
                  label="Music"
                  subtitle={
                    counts.archive
                      ? `${counts.archive} items`
                      : 'Archive & files'
                  }
                  color="var(--accent-orange)"
                />
                <StudioActionTile
                  to="/studio/upload"
                  icon={UploadCloudIcon}
                  label="Upload"
                  subtitle="Add audio"
                  color="var(--accent-green)"
                />
                <StudioActionTile
                  to="/studio/collections"
                  icon={DiscAlbumIcon}
                  label="Collections"
                  subtitle={
                    counts.collections
                      ? `${counts.collections} collections`
                      : 'Albums, EPs, DJ sets & playlists'
                  }
                  color="var(--accent-yellow)"
                />
                <StudioActionTile
                  to="/studio/releases"
                  icon={RocketIcon}
                  label="Releases"
                  subtitle={
                    counts.releases
                      ? `${counts.releases} releases`
                      : 'Share releases'
                  }
                  color="var(--primary)"
                />
              </CardGrid>
            </Group>
            <Group title="Audience & channel">
              <CardGrid>
                <StudioActionTile
                  to="/studio/updates"
                  icon={NewspaperIcon}
                  label="Updates"
                  subtitle="Posts & newsletter"
                  color="var(--accent-blue)"
                />
                <StudioActionTile
                  to="/studio/stats"
                  icon={BarChart3Icon}
                  label="Stats"
                  subtitle="Plays & downloads"
                  color="var(--accent-cyan)"
                />
                <StudioActionTile
                  to="/studio/revenue"
                  icon={WalletIcon}
                  label="Revenue"
                  subtitle="Connect & grants"
                  color="var(--accent-green)"
                />
                <StudioActionTile
                  to="/studio/channel"
                  icon={LayoutTemplateIcon}
                  label="Channel look"
                  subtitle="Design & domain"
                  color="var(--accent-purple)"
                />
              </CardGrid>
            </Group>
          </>
        )}
      </div>
    </StudioGate>
  );
}
