import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  HistoryIcon,
  ListMusicIcon,
  NewspaperIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  RadioTowerIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardGrid,
  ImageReveal,
  SectionShell,
  TabLabel,
  Tabs,
  Tooltip,
  ViewShell,
} from '@tahti-player/ui';

import { resolvePublicVisualizerPreset } from '../api/channel-design';
import {
  fetchChannel,
  fetchEnabledInternetRadioPresets,
  fetchOnAirChannels,
  fetchRadioStation,
  TAHTI_RADIO_SLUG,
  type EnabledInternetRadioPreset,
} from '../api/client';
import {
  fetchDiscoverDiscoWidgets,
  fetchHomepageDiscoWidgets,
  type DiscoWidgetRenderItem,
} from '../api/disco-widgets';
import type { OnAirChannel, PublicChannel } from '../api/types';
import { ChannelVisualizer } from '../components/ChannelVisualizer';
import { DiscoWidgetsSection } from '../components/disco-widgets/DiscoWidgetsSection';
import { ListenerWidgetsSection } from '../components/ListenerWidgetsSection';
import { ListenWidgetStoreDialog } from '../components/ListenWidgetStoreDialog';
import { RadioStationCoverEditButton } from '../components/RadioStationCover';
import { RADIO_STATIONS } from '../content/radioStations';
import { activeListenTab } from '../lib/navigationActive';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { useAuthStore } from '../stores/authStore';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import { FeedView } from './FeedView';
import { HistoryView } from './HistoryView';

export type ListenTab = 'listen' | 'feed' | 'history';

const LISTEN_SECTION_TABS = [
  { id: 'listen' as const, label: 'Listen', Icon: ListMusicIcon, to: '/' },
  {
    id: 'feed' as const,
    label: 'Feed',
    Icon: NewspaperIcon,
    to: '/listen/feed',
  },
  {
    id: 'history' as const,
    label: 'History',
    Icon: HistoryIcon,
    to: '/listen/history',
  },
];

export function ListenView({ tab: tabProp = 'listen' }: { tab?: ListenTab }) {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const tab = activeListenTab(pathname) ?? tabProp;
  const [onAir, setOnAir] = useState<OnAirChannel[]>([]);
  const [radio, setRadio] = useState<PublicChannel | null>(null);
  const [discoWidgets, setDiscoWidgets] = useState<DiscoWidgetRenderItem[]>([]);
  const [radioPresets, setRadioPresets] = useState<
    EnabledInternetRadioPreset[]
  >([]);
  const play = usePlayerStore((s) => s.play);
  const currentId = usePlayerStore((s) => s.currentId);
  const playbackStatus = usePlayerStore((s) => s.status);
  const setPlaybackStatus = usePlayerStore((s) => s.setStatus);
  const lastPlayed = useLibraryStore((s) => s.history[0] ?? null);
  const user = useAuthStore((s) => s.user);
  const signedIn = Boolean(user);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchOnAirChannels(),
      fetchRadioStation().catch(() => null),
      fetchEnabledInternetRadioPresets(),
    ]).then(([channels, station, presets]) => {
      if (cancelled) {
        return;
      }
      const liveSlugs = new Set(
        channels.data.live.map((channel) => channel.slug),
      );
      setOnAir(
        [...channels.data.live, ...channels.data.replaying]
          .filter((channel) => channel.slug !== TAHTI_RADIO_SLUG)
          .map((channel) => ({
            ...channel,
            state: liveSlugs.has(channel.slug) ? 'LIVE' : 'REPLAY',
          })),
      );
      setRadio(station?.data ?? null);
      setRadioPresets(presets.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchHomepageDiscoWidgets().then((home) => {
      if (cancelled) {
        return;
      }
      if (!signedIn) {
        setDiscoWidgets(home.data);
        return;
      }
      void fetchDiscoverDiscoWidgets().then((mine) => {
        if (cancelled) {
          return;
        }
        const seen = new Set(mine.data.map((w) => w.installId));
        setDiscoWidgets([
          ...mine.data,
          ...home.data.filter((w) => !seen.has(w.installId)),
        ]);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const playNow = async (slug: string) => {
    const { playable } = await fetchChannel(slug);
    if (playable) {
      play(playable);
    }
  };

  const radioLogo =
    radio?.user.avatarUrl ?? radio?.nowPlaying?.artworkUrl ?? null;
  const radioName = radio?.user.displayName ?? 'Tahti Radio';
  const radioPlayableId = `radio:${TAHTI_RADIO_SLUG}`;
  const radioIsCurrent = currentId === radioPlayableId;
  const radioIsPlaying =
    radioIsCurrent &&
    (playbackStatus === 'playing' || playbackStatus === 'loading');

  const toggleRadioPlayback = () => {
    if (radioIsCurrent) {
      setPlaybackStatus(radioIsPlaying ? 'paused' : 'playing');
      return;
    }

    void fetchRadioStation().then(({ playable }) => {
      if (playable) {
        play(playable);
      }
    });
  };

  return (
    <ViewShell
      title="Listen"
      subtitle={
        signedIn
          ? 'Continue listening, radio, and on-air channels.'
          : 'Community radio and on-air channels. Sign in for your library.'
      }
      classes={{ root: 'px-0 pt-0 max-w-5xl' }}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {signedIn ? <ListenWidgetStoreDialog /> : null}
        {!signedIn ? (
          <Link to="/what-is-it">
            <Button size="sm" variant="secondary">
              What is tahti.live?
            </Button>
          </Link>
        ) : null}
      </div>

      <Tabs.Root
        selectedIndex={Math.max(
          0,
          LISTEN_SECTION_TABS.findIndex((item) => item.id === tab),
        )}
        onChange={(index) => {
          const next = LISTEN_SECTION_TABS[index];
          if (next) {
            void navigate({ to: next.to });
          }
        }}
      >
        <Tabs.List aria-label="Listen sections" className="overflow-x-auto">
          {LISTEN_SECTION_TABS.map((item) => (
            <Tabs.Tab key={item.id}>
              <TabLabel icon={<item.Icon size={14} />}>{item.label}</TabLabel>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {tab === 'feed' ? <FeedView embedded /> : null}
      {tab === 'history' ? <HistoryView embedded /> : null}

      {tab === 'listen' ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {lastPlayed ? (
              <div className="sm:min-w-0 sm:flex-1">
                <SectionShell title="Continue listening">
                  <CardGrid>
                    <Card
                      title={lastPlayed.playable.title}
                      subtitle={lastPlayed.playable.artist}
                      src={
                        lastPlayed.playable.coverUrl ??
                        placeholderArtworkUrl(lastPlayed.playable.id)
                      }
                      onPlay={() => play(lastPlayed.playable)}
                    />
                  </CardGrid>
                </SectionShell>
              </div>
            ) : null}
            <div className="sm:min-w-0 sm:flex-1">
              <ListenerWidgetsSection />
            </div>
          </div>

          <DiscoWidgetsSection widgets={discoWidgets} />

          {radio ? (
            <Box
              variant="secondary"
              className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden"
            >
              {radioIsPlaying ? (
                <div className="pointer-events-none absolute inset-0 opacity-45">
                  <ChannelVisualizer
                    preset={resolvePublicVisualizerPreset(radio.visualPreset)}
                    colorScheme={radio.colorScheme}
                    colorSchemeJson={radio.colorSchemeJson}
                    visualSettingsJson={radio.visualSettingsJson}
                    artworkUrl={radio.nowPlaying?.artworkUrl ?? undefined}
                    className="h-full min-h-28 w-full"
                  />
                </div>
              ) : null}
              <div className="relative z-10 flex min-w-0 items-start gap-3">
                <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-bold tracking-tight">
                  <ImageReveal
                    src={radioLogo ?? undefined}
                    alt=""
                    className="size-full"
                    placeholder={
                      <RadioIcon
                        size={20}
                        className="text-foreground-secondary"
                      />
                    }
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold tracking-tight">
                    {radioName}
                  </div>
                  <p className="text-foreground-secondary text-xs">
                    {radio.hlsUrl
                      ? (radio.nowPlaying?.title ?? '24/7 community stream')
                      : 'Temporarily offline'}
                    {radio.nowPlaying?.artistName
                      ? ` · ${radio.nowPlaying.artistName}`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap items-center gap-2">
                <Tooltip
                  content={radioIsPlaying ? 'Pause Radio' : 'Play Radio'}
                  side="top"
                >
                  <Button
                    size="icon-sm"
                    disabled={!radio.hlsUrl}
                    aria-label={radioIsPlaying ? 'Pause Radio' : 'Play Radio'}
                    aria-pressed={radioIsPlaying}
                    onClick={toggleRadioPlayback}
                  >
                    {radioIsPlaying ? (
                      <PauseIcon size={16} className="fill-current" />
                    ) : (
                      <PlayIcon size={16} className="fill-current" />
                    )}
                  </Button>
                </Tooltip>
                <Tooltip content="Open radio" side="top">
                  <Link to="/radio">
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      aria-label="Open radio"
                    >
                      <RadioTowerIcon size={16} aria-hidden />
                    </Button>
                  </Link>
                </Tooltip>
              </div>
            </Box>
          ) : null}

          {radioPresets.length > 0 ? (
            <SectionShell title="Radio">
              <CardGrid>
                {radioPresets.map((preset) => {
                  const playableId = `radio-preset:${preset.id}`;
                  const isCurrent = currentId === playableId;
                  const isPlaying =
                    isCurrent &&
                    (playbackStatus === 'playing' ||
                      playbackStatus === 'loading');
                  return (
                    <div key={preset.id} className="group relative w-fit">
                      <RadioStationCoverEditButton
                        label={preset.name}
                        stationName={preset.name}
                        catalogStationId={
                          RADIO_STATIONS.find(
                            (station) => station.name === preset.name,
                          )?.id
                        }
                        presetId={preset.id}
                        className="absolute top-3 left-3 z-10 rounded-full"
                        onCoverChange={(iconUrl) =>
                          setRadioPresets((current) =>
                            current.map((item) =>
                              item.id === preset.id
                                ? { ...item, iconUrl }
                                : item,
                            ),
                          )
                        }
                      />
                      <Card
                        title={preset.name}
                        subtitle={preset.genre ?? 'Internet radio'}
                        src={
                          preset.iconUrl ?? placeholderArtworkUrl(playableId)
                        }
                        isPlaying={isPlaying}
                        playDisabled={!preset.streamUrl}
                        onPlay={() => {
                          if (!preset.streamUrl) {
                            return;
                          }
                          if (isCurrent) {
                            setPlaybackStatus(isPlaying ? 'paused' : 'playing');
                            return;
                          }
                          play({
                            id: playableId,
                            kind: 'radio',
                            title: preset.name,
                            artist: preset.genre ?? 'Internet radio',
                            coverUrl: preset.iconUrl ?? undefined,
                            streamUrl: preset.streamUrl,
                            protocol: 'https',
                            sourceProvider: 'internet-radio',
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </CardGrid>
            </SectionShell>
          ) : null}

          {onAir.length > 0 ? (
            <SectionShell title="On air">
              <CardGrid>
                {onAir.map((channel) => {
                  const channelIsCurrent = currentId === `live:${channel.slug}`;
                  const channelIsPlaying =
                    channelIsCurrent &&
                    (playbackStatus === 'playing' ||
                      playbackStatus === 'loading');
                  return (
                    <Card
                      key={channel.slug}
                      title={
                        <Link
                          to="/channel/$slug"
                          params={{ slug: channel.slug }}
                          className="hover:underline"
                        >
                          {channel.user.displayName}
                        </Link>
                      }
                      subtitle={
                        <span className="font-semibold">
                          {channelIsPlaying
                            ? 'Playing now'
                            : channel.state === 'LIVE'
                              ? 'Live now'
                              : 'Replay'}
                        </span>
                      }
                      src={
                        channel.user.avatarUrl ??
                        placeholderArtworkUrl(channel.slug)
                      }
                      isPlaying={channelIsPlaying}
                      onPlay={() => {
                        if (channelIsCurrent) {
                          setPlaybackStatus(
                            channelIsPlaying ? 'paused' : 'playing',
                          );
                          return;
                        }
                        void playNow(channel.slug);
                      }}
                      onClick={() => {
                        void navigate({
                          to: '/channel/$slug',
                          params: { slug: channel.slug },
                        });
                      }}
                    />
                  );
                })}
              </CardGrid>
            </SectionShell>
          ) : null}
        </>
      ) : null}
    </ViewShell>
  );
}
