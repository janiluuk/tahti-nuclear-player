import { Link, useNavigate } from '@tanstack/react-router';
import {
  AudioLinesIcon,
  BarChart3Icon,
  DownloadIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  ListOrderedIcon,
  RadioTowerIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

import { StatChip, Tabs, TopList } from '@tahti-player/ui';

import { fetchGrantEstimate, type GrantEstimate } from '../../api/revenue';
import {
  fetchChannelEgressStats,
  fetchChannelLiveStats,
  fetchListenerGeo,
  fetchStatsPlays,
  fetchStatsSummary,
  fetchStatsTopCountries,
  fetchStatsTopLists,
  fetchStatsTopTracks,
  type ChannelEgressStats,
  type ChannelLiveStats,
  type ListenerGeoPoint,
  type StatsPlays,
  type StatsPlaysRange,
  type StatsSummary,
  type StatsTopCountry,
  type StatsTopListBucket,
  type StatsTopListDimension,
  type StatsTopListSort,
  type StatsTopTrack,
} from '../../api/studio-extras';
import { ListenerWorldMap } from '../../components/ListenerWorldMap';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { StatNumber } from '../../components/tahti/StatNumber';
import { countryFlagAndName } from '../../lib/countries';
import {
  formatListenCount,
  formatPlayCount,
  rankingBucketTitle,
} from '../../lib/topListEntries';

const RANGES: Array<{ id: StatsPlaysRange; label: string }> = [
  { id: '7', label: '7 days' },
  { id: '30', label: '30 days' },
  { id: 'all', label: 'All time' },
];

type StatsTab = 'overview' | 'plays' | 'top-lists';

const STATS_TABS: Array<{ id: StatsTab; label: ReactNode }> = [
  {
    id: 'overview',
    label: (
      <span className="inline-flex items-center gap-1.5">
        <LayoutDashboardIcon size={14} aria-hidden /> Overview
      </span>
    ),
  },
  {
    id: 'plays',
    label: (
      <span className="inline-flex items-center gap-1.5">
        <BarChart3Icon size={14} aria-hidden /> Plays & listeners
      </span>
    ),
  },
  {
    id: 'top-lists',
    label: (
      <span className="inline-flex items-center gap-1.5">
        <ListOrderedIcon size={14} aria-hidden /> Top lists
      </span>
    ),
  },
];

const EMPTY_SUMMARY: StatsSummary = {
  playsToday: 0,
  playsTotal: 0,
  downloadsToday: 0,
  downloadsTotal: 0,
  followerCount: 0,
};

const EMPTY_PLAYS: StatsPlays = {
  totalPlays: 0,
  totalDownloads: 0,
  totalSmartLinkClicks: 0,
  daily: [],
};

const EMPTY_EGRESS: ChannelEgressStats = {
  windowDays: 30,
  liveHlsBytes: 0,
  estimatedLiveHlsBytes: 0,
};

const EMPTY_LIVE: ChannelLiveStats = {
  windowDays: 14,
  totalLiveSeconds: 0,
  totalBroadcasts: 0,
  peakDailyListeners: 0,
};

const formatDate = (value: string) =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

export const StudioStatsView: FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');
  const [range, setRange] = useState<StatsPlaysRange>('30');
  const [summary, setSummary] = useState<StatsSummary>(EMPTY_SUMMARY);
  const [plays, setPlays] = useState<StatsPlays>(EMPTY_PLAYS);
  const [tracks, setTracks] = useState<StatsTopTrack[]>([]);
  const [countries, setCountries] = useState<StatsTopCountry[]>([]);
  const [topLists, setTopLists] = useState<StatsTopListBucket[]>([]);
  const [topListDimension, setTopListDimension] =
    useState<StatsTopListDimension>('type');
  const [topListSort, setTopListSort] = useState<StatsTopListSort>('desc');
  const [listenerGeo, setListenerGeo] = useState<ListenerGeoPoint[]>([]);
  const [egress, setEgress] = useState<ChannelEgressStats>(EMPTY_EGRESS);
  const [live, setLive] = useState<ChannelLiveStats>(EMPTY_LIVE);
  const [grant, setGrant] = useState<GrantEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const geoPeriod = range === '7' ? '7d' : range === '30' ? '30d' : 'all';
    void Promise.all([
      fetchStatsSummary(),
      fetchStatsPlays(range),
      fetchStatsTopTracks(range),
      fetchStatsTopCountries(range),
      fetchStatsTopLists(range, topListDimension, topListSort),
      fetchListenerGeo(geoPeriod),
      fetchChannelEgressStats(),
      fetchChannelLiveStats(),
      fetchGrantEstimate(),
    ]).then(
      ([
        summaryResult,
        playsResult,
        tracksResult,
        countriesResult,
        topListsResult,
        listenerGeoResult,
        egressResult,
        liveResult,
        grantResult,
      ]) => {
        if (cancelled) {
          return;
        }
        setSummary(summaryResult.data);
        setPlays(playsResult.data);
        setTracks(tracksResult.data);
        setCountries(countriesResult.data);
        setTopLists(topListsResult.data);
        setListenerGeo(listenerGeoResult.data);
        setEgress(egressResult.data);
        setLive(liveResult.data);
        setGrant(grantResult.data);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [range, topListDimension, topListSort]);

  const maxDaily = useMemo(
    () => Math.max(1, ...plays.daily.map((day) => day.plays)),
    [plays.daily],
  );
  const busiestDay = useMemo(
    () =>
      plays.daily.length > 0
        ? plays.daily.reduce((best, day) =>
            day.plays > best.plays ? day : best,
          )
        : null,
    [plays.daily],
  );
  const deliveredBytes = egress.liveHlsBytes || egress.estimatedLiveHlsBytes;
  const minutesListened = Math.round((deliveredBytes * 8) / 192_000 / 60);
  const minutesStreamed = Math.round(live.totalLiveSeconds / 60);
  const engagementRows = [
    {
      label: 'Free downloads',
      detail: `${grant?.freeDownloads ?? 0} × 1`,
      value: grant?.freeDownloads ?? 0,
    },
    {
      label: 'Paid downloads',
      detail: `${grant?.paidDownloads ?? 0} × 5`,
      value: (grant?.paidDownloads ?? 0) * 5,
    },
    {
      label: 'Fan subscriptions',
      detail: `€${grant?.fanSubEuros ?? 0} × 1`,
      value: grant?.fanSubEuros ?? 0,
    },
  ];
  const maxEngagement = Math.max(1, ...engagementRows.map((row) => row.value));
  const keyMetrics = [
    {
      label: 'Plays',
      value: plays.totalPlays,
      note: `${summary.playsToday.toLocaleString()} today`,
      icon: AudioLinesIcon,
    },
    {
      label: 'Downloads',
      value: plays.totalDownloads,
      note: `${summary.downloadsToday.toLocaleString()} today`,
      icon: DownloadIcon,
    },
    {
      label: 'Smart-link clicks',
      value: plays.totalSmartLinkClicks ?? 0,
      note: 'Selected period',
      icon: ExternalLinkIcon,
    },
    {
      label: 'Followers',
      value: summary.followerCount,
      note: 'Current audience',
      icon: UsersIcon,
    },
    {
      label: 'Minutes listened',
      value: minutesListened,
      note: `Estimated from ${egress.windowDays}d delivery`,
      icon: UsersIcon,
    },
    {
      label: 'Minutes streamed',
      value: minutesStreamed,
      note: `${live.totalBroadcasts} broadcasts in ${live.windowDays}d`,
      icon: RadioTowerIcon,
    },
  ];

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-6xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/stats" />
        <StudioPageHeader
          title="Stats"
          subtitle="Audience, track performance, broadcasts, and engagement in one place."
          action={
            <div
              className="border-border flex gap-1 rounded-lg border p-1"
              role="group"
              aria-label="Stats time range"
            >
              {RANGES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={range === option.id}
                  onClick={() => setRange(option.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-colors ${
                    range === option.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />

        <Tabs.Root
          selectedIndex={Math.max(
            0,
            STATS_TABS.findIndex((item) => item.id === activeTab),
          )}
          onChange={(index) => {
            const next = STATS_TABS[index];
            if (next) {
              setActiveTab(next.id);
            }
          }}
        >
          <Tabs.List className="overflow-x-auto">
            {STATS_TABS.map((item) => (
              <Tabs.Tab key={item.id}>{item.label}</Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.Root>

        <section
          className={`${activeTab === 'overview' ? '' : 'hidden'} grid gap-3 sm:grid-cols-2 xl:grid-cols-3`}
          aria-label="Key metrics"
        >
          {keyMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <StudioPanel key={metric.label} className="!p-4 sm:!p-5">
                <StatChip
                  value={loading ? '—' : metric.value.toLocaleString()}
                  label={metric.label}
                  icon={<Icon size={16} aria-hidden className="text-primary" />}
                />
                <p className="text-foreground-secondary mt-2 text-xs">
                  {metric.note}
                </p>
              </StudioPanel>
            );
          })}
        </section>

        <div className={activeTab === 'plays' ? 'grid gap-6' : 'hidden'}>
          <StudioPanel title="Listener map">
            <div className="mb-4 flex flex-wrap justify-between gap-2">
              <p className="text-foreground-secondary text-sm">
                Anonymized countries from channel listening and downloads.
              </p>
              <span className="text-foreground-secondary text-xs tabular-nums">
                Peak day: {live.peakDailyListeners.toLocaleString()} listeners
              </span>
            </div>
            <ListenerWorldMap data={listenerGeo} loading={loading} />
          </StudioPanel>

          <StudioPanel title="Plays over time">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <StatNumber className="block text-3xl">
                  {plays.totalPlays.toLocaleString()}
                </StatNumber>
                <p className="text-foreground-secondary text-xs">
                  {busiestDay
                    ? `Busiest day: ${formatDate(busiestDay.date)} · ${busiestDay.plays.toLocaleString()} plays`
                    : 'Daily activity appears after your first play.'}
                </p>
              </div>
              <BarChart3Icon size={22} aria-hidden className="text-primary" />
            </div>
            <div
              role="img"
              aria-label="Daily plays chart"
              className="flex h-44 items-end gap-1"
            >
              {plays.daily.length === 0 ? (
                <p className="text-foreground-secondary self-center text-sm">
                  No plays in this period.
                </p>
              ) : (
                plays.daily.map((day) => (
                  <div
                    key={day.date}
                    title={`${formatDate(day.date)}: ${day.plays.toLocaleString()} plays`}
                    className="bg-primary/70 hover:bg-primary min-w-0 flex-1 rounded-t-sm transition-colors"
                    style={{
                      height: `${Math.max(3, (day.plays / maxDaily) * 100)}%`,
                    }}
                  />
                ))
              )}
            </div>
            {plays.daily.length > 0 ? (
              <div className="text-foreground-secondary mt-2 flex justify-between text-[10px]">
                <span>{formatDate(plays.daily[0]!.date)}</span>
                <span>
                  {formatDate(plays.daily[plays.daily.length - 1]!.date)}
                </span>
              </div>
            ) : null}
          </StudioPanel>
        </div>

        <div
          className={`${activeTab === 'top-lists' ? '' : 'hidden'} grid gap-6 lg:grid-cols-2`}
        >
          <StudioPanel title="Content rankings" className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap gap-2">
              <div
                className="border-border flex gap-1 rounded-lg border p-1"
                role="group"
                aria-label="Top list grouping"
              >
                {(
                  [
                    ['type', 'By type'],
                    ['genre', 'By genre'],
                  ] as const
                ).map(([dimension, label]) => (
                  <button
                    key={dimension}
                    type="button"
                    aria-pressed={topListDimension === dimension}
                    onClick={() => setTopListDimension(dimension)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      topListDimension === dimension
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                className="border-border flex gap-1 rounded-lg border p-1"
                role="group"
                aria-label="Top list order"
              >
                {(
                  [
                    ['desc', 'Most listened'],
                    ['asc', 'Least listened'],
                  ] as const
                ).map(([sort, label]) => (
                  <button
                    key={sort}
                    type="button"
                    aria-pressed={topListSort === sort}
                    onClick={() => setTopListSort(sort)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      topListSort === sort
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {topLists.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                No listens recorded for this period yet.
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {topLists.map((bucket) => (
                  <TopList
                    key={bucket.bucket}
                    title={rankingBucketTitle(bucket.bucket)}
                    formatValue={formatListenCount}
                    entries={bucket.entries.map((entry) => ({
                      id: entry.soundId,
                      label: entry.title,
                      sublabel: entry.genre ?? entry.contentType,
                      value: entry.listens,
                      onClick: () => {
                        void navigate({
                          to: '/studio/sounds/$id',
                          params: { id: entry.soundId },
                        });
                      },
                    }))}
                  />
                ))}
              </div>
            )}
          </StudioPanel>
          <StudioPanel>
            {tracks.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                No track stats yet.
              </p>
            ) : (
              <TopList
                title="Top tracks"
                formatValue={formatPlayCount}
                entries={tracks.map((track) => ({
                  id: track.soundId,
                  label: track.title,
                  value: track.plays,
                  onClick: () => {
                    void navigate({
                      to: '/studio/sounds/$id',
                      params: { id: track.soundId },
                    });
                  },
                }))}
              />
            )}
          </StudioPanel>

          <StudioPanel>
            {countries.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                No country data yet.
              </p>
            ) : (
              <TopList
                title="Top countries"
                formatValue={(value) => value.toLocaleString()}
                entries={countries.map((country) => ({
                  id: country.country,
                  label: countryFlagAndName(country.country),
                  value: country.count,
                }))}
              />
            )}
          </StudioPanel>
        </div>

        <div className={activeTab === 'overview' ? '' : 'hidden'}>
          <StudioPanel title="Engagement units">
            <div className="flex flex-col gap-3">
              {engagementRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[9rem_1fr_auto] items-center gap-3 text-sm"
                >
                  <span>
                    {row.label}
                    <span className="text-foreground-secondary ml-1 text-xs">
                      {row.detail}
                    </span>
                  </span>
                  <div className="bg-background h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-accent-cyan h-full rounded-full"
                      style={{ width: `${(row.value / maxEngagement) * 100}%` }}
                    />
                  </div>
                  <strong className="w-10 text-right tabular-nums">
                    {row.value}
                  </strong>
                </div>
              ))}
            </div>
            <div className="border-border mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
              <span className="text-foreground-secondary">
                {grant?.eligible
                  ? `Estimated ${grant.year} grant share`
                  : `Progress toward ${grant?.year ?? new Date().getFullYear()} grant eligibility`}
              </span>
              <strong>
                {grant?.eligible
                  ? `€${((grant.estimateCents ?? 0) / 100).toFixed(2)}`
                  : `${grant?.units ?? 0} units`}
              </strong>
            </div>
          </StudioPanel>

          <p className="text-foreground-secondary text-xs">
            Fan subscription payouts and grant history remain under{' '}
            <Link
              to="/studio/revenue"
              className="underline-offset-2 hover:underline"
            >
              Revenue
            </Link>
            . Listener geography is aggregated and does not identify individual
            listeners.
          </p>
        </div>
      </div>
    </StudioGate>
  );
};
