import { Link, useNavigate } from '@tanstack/react-router';
import { CalendarDays, MessageCircle, Mic, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  Button,
  Card,
  CardGrid,
  Dialog,
  SaveButton,
  Textarea,
} from '@nuclearplayer/ui';

import {
  fetchMyPressKitImages,
  fetchPublicPressKitImages,
  type PublicPressKitImage,
} from '../api/artist-settings';
import { fetchChannel, fetchProfile } from '../api/client';
import {
  fetchChannelDiscoWidgets,
  type DiscoWidgetRenderItem,
} from '../api/disco-widgets';
import { fetchPublicMentions, type PublicMention } from '../api/mentions';
import {
  fetchPublicRadioShow,
  type PublicRadioShow,
  type PublicRadioShowEpisode,
} from '../api/shows';
import { patchMeProfile } from '../api/studio-extras';
import type {
  PublicChannel,
  PublicProfile,
  PublicProfileRelease,
  TahtiPlayable,
} from '../api/types';
import {
  ArtistGalleryAddIcon,
  ArtistGalleryPanel,
} from '../components/ArtistGalleryPanel';
import { ChannelControlsWidget } from '../components/ChannelControlsWidget';
import { ChannelDesigner } from '../components/ChannelDesigner';
import { ChannelVisualizer } from '../components/ChannelVisualizer';
import { DiscoWidgetsSection } from '../components/disco-widgets/DiscoWidgetsSection';
import { GlowMediaTile } from '../components/GlowMediaTile';
import { ImageLightbox } from '../components/ImageLightbox';
import { NewsletterSubscribeToggle } from '../components/NewsletterSubscribeToggle';
import { PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import {
  releasePlayables,
  ReleaseTracklistDialog,
} from '../components/ReleaseTracklistDialog';
import { SocialLinkIcon, socialLinkLabel } from '../components/SocialLinkIcon';
import { StreamManagerPanel } from '../components/StreamManagerPanel';
import { Eyebrow } from '../components/tahti/Eyebrow';
import { TrackEditDialog } from '../components/TrackEditDialog';
import { hasAccountRole } from '../lib/accountRoles';
import { archiveItemIdFromPlayableId } from '../lib/archiveId';
import { isPinned } from '../lib/pinnedTracks';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { formatDuration } from '../lib/playableToTrack';
import { syncDocumentMetadata } from '../lib/seo';
import { useAuthStore } from '../stores/authStore';
import { useLibraryStore } from '../stores/libraryStore';
import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';

const GLOW_COLORS = [
  'var(--color-accent-purple)',
  'var(--color-accent-cyan)',
  'var(--color-accent-red)',
  'var(--color-accent-green)',
  'var(--color-accent-yellow)',
  'var(--color-accent-blue)',
];

function showDateLabel(episode: PublicRadioShowEpisode): string {
  const start = new Date(episode.startAt);
  const end = new Date(episode.endAt);
  return `${start.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} · ${start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}–${end.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function ShowEpisodeList({
  title,
  episodes,
  icon,
  channelSlug,
}: {
  title: string;
  episodes: PublicRadioShowEpisode[];
  icon: ReactNode;
  channelSlug?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      <ul className="border-border divide-border divide-y overflow-hidden rounded-xl border">
        {episodes.map((episode) => (
          <li key={episode.id} className="flex items-start gap-3 p-3">
            <span className="text-foreground-secondary mt-0.5 shrink-0">
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {episode.title ?? episode.note ?? 'Tahti Radio show'}
              </div>
              <div className="text-foreground-secondary text-xs">
                {showDateLabel(episode)}
              </div>
              {episode.description ? (
                <p className="text-foreground-secondary mt-1 text-xs">
                  {episode.description}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {channelSlug ? (
                  <Link
                    to="/radio/show/$channelSlug"
                    params={{ channelSlug }}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Show details
                  </Link>
                ) : null}
                {episode.recording ? (
                  <a
                    href={episode.recording.channelItemUrl}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Listen to recording
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function releaseToPlayable(
  release: PublicProfile['releases'][number],
  artist: string,
  channelSlug?: string,
): TahtiPlayable | null {
  const track = release.tracks?.find((t) => t.playUrl);
  if (!track?.playUrl) {
    return null;
  }
  const isHls = track.playUrl.includes('.m3u8');
  return {
    id: `archive:${track.archiveItemId ?? release.id}`,
    kind: 'archive',
    title: track.title,
    artist,
    coverUrl: release.artworkUrl ?? undefined,
    streamUrl: track.playUrl,
    protocol: isHls ? 'hls' : 'https',
    channelSlug,
    releaseDate: release.releaseDate ?? null,
  };
}

type Tab = 'music' | 'releases' | 'collections' | 'gallery' | 'design';

export function profileTrackToPlayable(
  track: PublicProfile['tracks'][number],
  artist: string,
  channelSlug?: string,
): TahtiPlayable | null {
  if (!track.playUrl) {
    return null;
  }
  const isHls = track.playUrl.includes('.m3u8');
  return {
    id: `archive:${track.id}`,
    kind: 'archive',
    title: track.title,
    artist: track.artistName ?? artist,
    coverUrl: track.bannerUrl ?? undefined,
    streamUrl: track.playUrl,
    protocol: isHls ? 'hls' : 'https',
    channelSlug,
    releaseDate: track.createdAt ?? null,
  };
}

export function ArtistView({ username }: { username: string }) {
  const me = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('music');
  const [galleryImages, setGalleryImages] = useState<PublicPressKitImage[]>([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [tracklistRelease, setTracklistRelease] =
    useState<PublicProfileRelease | null>(null);
  const [editingFullBio, setEditingFullBio] = useState(false);
  const [fullBioDraft, setFullBioDraft] = useState('');
  const [savingFullBio, setSavingFullBio] = useState(false);
  const [albumPrompt, setAlbumPrompt] = useState<{
    release: PublicProfileRelease;
    playables: TahtiPlayable[];
  } | null>(null);
  const [channelVisual, setChannelVisual] = useState<Pick<
    PublicChannel,
    | 'visualPreset'
    | 'visualSettingsJson'
    | 'colorScheme'
    | 'colorSchemeJson'
    | 'hlsUrl'
  > | null>(null);
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [discoWidgets, setDiscoWidgets] = useState<DiscoWidgetRenderItem[]>([]);
  const [liveShows, setLiveShows] = useState<PublicRadioShow | null>(null);
  const [taggedIn, setTaggedIn] = useState<PublicMention[]>([]);

  const navigate = useNavigate();
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const currentId = usePlayerStore((s) => s.currentId);
  const queue = usePlayerStore((s) => s.queue);
  const toggleFavoriteTrack = useLibraryStore((s) => s.toggleFavoriteTrack);
  const favoriteTracks = useLibraryStore((s) => s.favoriteTracks);

  const playAlbum = (playables: TahtiPlayable[]) => {
    const [head, ...rest] = playables;
    if (head) {
      play(head, { enqueueRest: rest });
    }
  };

  const queueAlbum = (playables: TahtiPlayable[]) => {
    for (const item of playables) {
      enqueue(item);
    }
  };

  const playOrPromptAlbum = (
    release: PublicProfileRelease,
    artist: string,
    channelSlug?: string,
  ) => {
    const playables = releasePlayables(release, artist, channelSlug);
    if (playables.length === 0) {
      return;
    }
    if (usePlayerStore.getState().queue.length > 0) {
      setAlbumPrompt({ release, playables });
      return;
    }
    playAlbum(playables);
  };

  const isOwner = Boolean(me && me.username === username);
  const isAdministrator = hasAccountRole(me, 'BOARD');
  const hasGallery = galleryImages.length > 0;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchProfile(username).then((res) => {
      if (cancelled) {
        return;
      }
      setProfile(res.data);
      setLoading(false);

      void fetchPublicMentions(username).then((mentions) => {
        if (!cancelled) {
          setTaggedIn(mentions.data);
        }
      });

      if (res.data) {
        const { displayName, bio, avatarUrl } = res.data.artist;
        syncDocumentMetadata(window.location.pathname, {
          title: `${displayName} on Tahti`,
          description:
            bio ??
            `Explore ${displayName}'s music, releases, collections, and live channel on Tahti.`,
          image: avatarUrl ?? undefined,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    const slug = profile?.channel?.slug;
    if (!slug) {
      setChannelVisual(null);
      setDiscoWidgets([]);
      return;
    }
    let cancelled = false;
    void Promise.all([fetchChannel(slug), fetchChannelDiscoWidgets(slug)]).then(
      ([res, widgets]) => {
        if (cancelled) {
          return;
        }
        setChannelVisual({
          visualPreset: res.data.visualPreset,
          visualSettingsJson: res.data.visualSettingsJson,
          colorScheme: res.data.colorScheme,
          colorSchemeJson: res.data.colorSchemeJson,
          hlsUrl: res.data.hlsUrl,
        });
        setDiscoWidgets(widgets.data);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [profile?.channel?.slug]);

  useEffect(() => {
    const slug = profile?.channel?.slug;
    if (!slug) {
      setLiveShows(null);
      return;
    }
    let cancelled = false;
    void fetchPublicRadioShow(slug).then((result) => {
      if (!cancelled) {
        setLiveShows(result.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.channel?.slug]);

  useEffect(() => {
    let cancelled = false;
    setGalleryLoaded(false);
    const load = isOwner
      ? fetchMyPressKitImages().then((res) =>
          res.data.map(({ id, imageUrl, title }) => ({ id, imageUrl, title })),
        )
      : fetchPublicPressKitImages(username).then((res) => res.data);
    void load.then((images) => {
      if (cancelled) {
        return;
      }
      setGalleryImages(images);
      setGalleryLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [username, isOwner]);

  useEffect(() => {
    if (tab === 'gallery' && !hasGallery) {
      setTab('music');
    }
  }, [tab, hasGallery]);

  useEffect(() => {
    if (!profile) {
      return;
    }
    const availableTabs: Tab[] = [
      ...(profile.tracks.length > 0 ? (['music'] as const) : []),
      ...(profile.releases.length > 0 ? (['releases'] as const) : []),
      ...(profile.collections.some((collection) => collection.itemCount > 0)
        ? (['collections'] as const)
        : []),
      ...(hasGallery ? (['gallery'] as const) : []),
      ...(isOwner ? (['design'] as const) : []),
    ];
    if (!availableTabs.includes(tab)) {
      setTab(availableTabs[0] ?? 'music');
    }
  }, [hasGallery, isOwner, profile, tab]);

  const { pinnedPlayables, pinnedTiles, catalogPlayables, releaseTiles } =
    useMemo(() => {
      if (!profile) {
        return {
          pinnedPlayables: [],
          pinnedTiles: [],
          catalogPlayables: [],
          releaseTiles: [],
        };
      }
      const artist = profile.artist.displayName;
      const slug = profile.channel?.slug;
      const pinnedTracks = [...profile.tracks]
        .filter((t) => isPinned(t))
        .sort((a, b) => (b.pinnedAt ?? '').localeCompare(a.pinnedAt ?? ''));
      const pinnedIds = new Set(pinnedTracks.map((t) => t.id));
      const toPlayable = (t: PublicProfile['tracks'][number]) =>
        profileTrackToPlayable(t, artist, slug);

      const pinnedTiles = pinnedTracks
        .map((t) => ({ track: t, playable: toPlayable(t) }))
        .filter(
          (
            x,
          ): x is {
            track: (typeof pinnedTracks)[number];
            playable: TahtiPlayable;
          } => Boolean(x.playable),
        );

      const releaseTiles = [...profile.releases]
        .sort((a, b) =>
          (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''),
        )
        .slice(0, 6)
        .map((release) => ({
          release,
          playable: releaseToPlayable(release, artist, slug),
        }));

      return {
        pinnedPlayables: pinnedTracks
          .map(toPlayable)
          .filter((p): p is TahtiPlayable => Boolean(p)),
        pinnedTiles,
        catalogPlayables: profile.tracks
          .filter((t) => !pinnedIds.has(t.id))
          .map(toPlayable)
          .filter((p): p is TahtiPlayable => Boolean(p)),
        releaseTiles,
      };
    }, [profile]);

  if (loading) {
    return <PageLoading label="Loading artist…" />;
  }

  if (!profile) {
    return (
      <PageEmpty
        title="Artist not found"
        description="This artist profile may have been removed or is not available."
      />
    );
  }

  const { artist, channel, releases, collections, fanTiers } = profile;
  const profileConnections = Object.entries(artist.socialLinks ?? {}).filter(
    ([key, url]) =>
      Boolean(url) && key !== 'genres' && key !== 'showConnections',
  );

  const currentQueueItem = queue.find((q) => q.id === currentId);
  const currentPlayable = currentQueueItem
    ? playableFromQueueItem(currentQueueItem)
    : null;
  const nowPlayingHere =
    currentPlayable?.artist === artist.displayName ? currentPlayable : null;

  const tabs: Array<{ id: Tab; label: string }> = [
    ...(profile.tracks.length > 0
      ? [{ id: 'music' as const, label: 'Music' }]
      : []),
    ...(releases.length > 0
      ? [{ id: 'releases' as const, label: 'Releases' }]
      : []),
    ...(collections.some((collection) => collection.itemCount > 0)
      ? [{ id: 'collections' as const, label: 'Collections' }]
      : []),
    ...(hasGallery ? [{ id: 'gallery' as const, label: 'Gallery' }] : []),
    ...(isOwner ? [{ id: 'design' as const, label: 'Design' }] : []),
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        to="/"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Listen
      </Link>

      <section className="border-border bg-background-secondary/70 flex flex-col gap-5 rounded-2xl border p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative size-20 shrink-0 sm:size-24">
            {channel && tab !== 'music' ? (
              <ChannelVisualizer
                className="absolute -inset-2 rounded-2xl"
                preset={channelVisual?.visualPreset}
                colorScheme={channelVisual?.colorScheme}
                colorSchemeJson={channelVisual?.colorSchemeJson}
                visualSettingsJson={channelVisual?.visualSettingsJson}
                artworkUrl={nowPlayingHere?.coverUrl ?? artist.avatarUrl}
              />
            ) : null}
            {artist.avatarUrl ? (
              <button
                type="button"
                className="border-border bg-background relative size-20 shrink-0 overflow-hidden rounded-xl border shadow-md sm:size-24"
                aria-label={`View ${artist.displayName} profile picture`}
                onClick={() => setAvatarOpen(true)}
              >
                <img
                  src={artist.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </button>
            ) : (
              <div className="border-border bg-background relative size-20 shrink-0 overflow-hidden rounded-xl border shadow-md sm:size-24">
                <img
                  src={placeholderArtworkUrl(artist.username)}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <PageHeader
              title={artist.displayName}
              subtitle={`@${artist.username}`}
              actions={
                isOwner && channel?.slug ? (
                  <Link
                    to="/channel/$slug"
                    params={{ slug: channel.slug }}
                    search={{ edit: '1' }}
                  >
                    <Button size="sm" variant="secondary">
                      Edit design
                    </Button>
                  </Link>
                ) : isOwner ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setTab('design')}
                  >
                    Edit look
                  </Button>
                ) : undefined
              }
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground-secondary text-sm">
            {artist.pronouns ? `${artist.pronouns} · ` : ''}
            {channel ? 'Artist channel' : 'Artist profile'}
          </span>
          {!isOwner &&
          artist.freeSubscriptionsEnabled !== false &&
          fanTiers.length > 0 ? (
            <Link
              to="/subscribe/$username"
              params={{ username: artist.username }}
            >
              <Button
                size="icon-sm"
                variant="secondary"
                title={`Subscribe to ${artist.displayName}`}
                aria-label={`Subscribe to ${artist.displayName}`}
              >
                <UsersRound size={16} aria-hidden />
              </Button>
            </Link>
          ) : null}
          {channel && channelVisual?.hlsUrl ? (
            <Link to="/channel/$slug" params={{ slug: channel.slug }}>
              <Button size="sm" variant="secondary">
                Open channel
              </Button>
            </Link>
          ) : null}
        </div>
        {artist.socialLinks?.showConnections !== 'false' &&
        profileConnections.length > 0 ? (
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Connections"
          >
            <span className="text-foreground-secondary mr-1 text-xs font-semibold tracking-wide uppercase">
              Find me
            </span>
            {profileConnections.map(([key, url]) => {
              const label = socialLinkLabel(key, url);
              return (
                <a
                  key={`${key}-${url}`}
                  href={url}
                  rel="noopener noreferrer"
                  target={url.startsWith('mailto:') ? undefined : '_blank'}
                  className="border-border bg-background hover:border-primary/60 inline-flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors"
                  title={label}
                  aria-label={label}
                >
                  <SocialLinkIcon label={key} url={url} />
                  <span className="hidden sm:inline">{label}</span>
                </a>
              );
            })}
          </div>
        ) : null}
        {artist.bio ? (
          <p className="text-foreground max-w-3xl text-sm whitespace-pre-wrap">
            {artist.bio}
          </p>
        ) : null}
        {editingFullBio ? (
          <div className="mt-2 flex max-w-2xl flex-col gap-2">
            <Textarea
              autoFocus
              rows={6}
              placeholder="Share your full history — how you got started, your influences, milestones…"
              value={fullBioDraft}
              onChange={(e) => setFullBioDraft(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={savingFullBio}
                onClick={() => setEditingFullBio(false)}
              >
                Cancel
              </Button>
              <SaveButton
                saving={savingFullBio}
                onClick={async () => {
                  setSavingFullBio(true);
                  const result = await patchMeProfile({
                    fullBio: fullBioDraft.trim() || null,
                  });
                  setSavingFullBio(false);
                  if (!result.ok) {
                    return;
                  }
                  setProfile((prev) =>
                    prev
                      ? {
                          ...prev,
                          artist: {
                            ...prev.artist,
                            fullBio: result.data.fullBio ?? null,
                          },
                        }
                      : prev,
                  );
                  setEditingFullBio(false);
                }}
              />
            </div>
          </div>
        ) : artist.fullBio ? (
          <div className="mt-2 max-w-2xl">
            <p className="text-foreground text-sm whitespace-pre-wrap">
              {artist.fullBio}
            </p>
            {isOwner && (
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  setFullBioDraft(artist.fullBio ?? '');
                  setEditingFullBio(true);
                }}
              >
                Edit full bio
              </Button>
            )}
          </div>
        ) : isOwner ? (
          <Button
            size="sm"
            variant="secondary"
            className="mt-2 self-start"
            onClick={() => {
              setFullBioDraft('');
              setEditingFullBio(true);
            }}
          >
            + Add full bio
          </Button>
        ) : null}
        <div className="border-border/70 flex flex-wrap gap-x-7 gap-y-3 border-t pt-4">
          {[
            ['Followers', artist.followerCount ?? 0],
            ['Following', artist.followingCount ?? 0],
            ['Tracks', profile.tracks.length],
            ['Releases', releases.length],
            ['Collections', collections.length],
          ].map(([label, value]) => (
            <div key={label} className="min-w-16">
              <div className="text-foreground text-lg font-bold tracking-tight">
                {value}
              </div>
              <div className="text-foreground-secondary text-[11px] tracking-[0.12em] uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>
        <DiscoWidgetsSection widgets={discoWidgets} />
        <div className="flex flex-wrap gap-3 text-sm">
          {channel && (
            <Link
              to="/u/$username/green-room"
              params={{ username: artist.username }}
              className="text-foreground-secondary underline-offset-2 hover:underline"
            >
              Green room
            </Link>
          )}
          {!isOwner && artist.freeSubscriptionsEnabled !== false && (
            <NewsletterSubscribeToggle
              artistUsername={artist.username}
              artistDisplayName={artist.displayName}
            />
          )}
          {isOwner && (
            <Link
              to="/studio/channel"
              className="text-foreground-secondary underline-offset-2 hover:underline"
            >
              Full studio settings
            </Link>
          )}
        </div>
      </section>

      {channel && (isOwner || isAdministrator) ? (
        <StreamManagerPanel
          slug={channel.slug}
          channelState={channel.state}
          readOnly={!isOwner}
        />
      ) : null}

      {liveShows &&
      (liveShows.upcomingEpisodes.length > 0 ||
        liveShows.pastEpisodes.length > 0) ? (
        <section className="border-border bg-background-secondary/50 flex flex-col gap-4 rounded-2xl border p-4 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} aria-hidden />
              <h2 className="font-display text-lg font-bold tracking-tight">
                Live shows
              </h2>
            </div>
            <p className="text-foreground-secondary mt-1 text-sm">
              Upcoming broadcasts and recordings from this artist on Tahti
              Radio.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {liveShows.upcomingEpisodes.length > 0 ? (
              <ShowEpisodeList
                title="Upcoming"
                episodes={liveShows.upcomingEpisodes}
                icon={<Mic size={16} aria-hidden />}
                channelSlug={channel?.slug}
              />
            ) : null}
            {liveShows.pastEpisodes.length > 0 ? (
              <ShowEpisodeList
                title="Past recordings"
                episodes={liveShows.pastEpisodes}
                icon={<MessageCircle size={16} aria-hidden />}
                channelSlug={channel?.slug}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {fanTiers.length > 0 && (
        <p className="text-foreground-secondary text-xs">
          Fan tiers:{' '}
          {fanTiers
            .map((t) => `${t.name} (€${(t.amountCents / 100).toFixed(0)})`)
            .join(', ')}
        </p>
      )}

      {taggedIn.length > 0 ? (
        <section className="border-border bg-background-secondary/50 rounded-2xl border p-4 sm:p-6">
          <div className="mb-3">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Tagged in
            </h2>
            <p className="text-foreground-secondary mt-1 text-sm">
              Projects and artist pages where this artist has been credited.
            </p>
          </div>
          <ul className="border-border divide-border divide-y overflow-hidden rounded-xl border">
            {taggedIn.map((mention) => {
              const href =
                mention.sourceUrl ?? `/u/${mention.mentioner.username}`;
              const title =
                mention.sourceTitle ?? mention.mentioner.displayName;
              return (
                <li
                  key={mention.id}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="min-w-0">
                    <a
                      href={href}
                      className="text-primary truncate text-sm font-semibold hover:underline"
                    >
                      {title}
                    </a>
                    <p className="text-foreground-secondary text-xs">
                      {mention.surface === 'TRACKLIST'
                        ? 'Tracklist credit'
                        : 'Artist description'}
                      {` · by ${mention.mentioner.displayName}`}
                    </p>
                  </div>
                  <span className="text-foreground-secondary shrink-0 text-xs">
                    {new Date(mention.createdAt).toLocaleDateString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="border-border flex flex-wrap items-center gap-2 border-b pb-3">
        <nav
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Profile sections"
        >
          {tabs.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant="text"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              {t.label}
            </Button>
          ))}
        </nav>
        {isOwner && galleryLoaded && !hasGallery ? (
          <ArtistGalleryAddIcon
            onCreated={(images) => {
              setGalleryImages(images);
              setTab('gallery');
            }}
          />
        ) : null}
      </div>

      {tab === 'music' && (
        <section className="flex flex-col gap-8">
          <div className="border-border bg-background-input relative min-h-[20rem] w-full overflow-hidden rounded-lg border sm:min-h-[28rem]">
            <ChannelVisualizer
              className="absolute inset-0 h-full w-full"
              preset={channelVisual?.visualPreset}
              colorScheme={channelVisual?.colorScheme}
              colorSchemeJson={channelVisual?.colorSchemeJson}
              visualSettingsJson={channelVisual?.visualSettingsJson}
              artworkUrl={nowPlayingHere?.coverUrl ?? artist.avatarUrl}
            />
            {nowPlayingHere ? (
              <span className="absolute top-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                <span
                  className="bg-accent-green size-1.5 rounded-full motion-safe:animate-pulse"
                  aria-hidden
                />
                Now playing
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 z-[1] flex items-end gap-3 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-3 sm:gap-4 sm:p-4">
              {nowPlayingHere ? (
                <>
                  <div className="size-12 shrink-0 overflow-hidden rounded-md bg-white/10 shadow-lg ring-1 ring-white/15 sm:size-14">
                    {nowPlayingHere.coverUrl ? (
                      <img
                        src={nowPlayingHere.coverUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs font-bold text-white/70">
                        {nowPlayingHere.title.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base leading-tight font-bold text-white sm:text-lg">
                      {nowPlayingHere.title}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-white/75">
                      {artist.displayName}
                    </div>
                  </div>
                </>
              ) : (
                <div className="truncate text-base leading-tight font-bold text-white sm:text-lg">
                  {artist.displayName}
                </div>
              )}
            </div>
          </div>

          {pinnedTiles.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Eyebrow>Pinned</Eyebrow>
                {isOwner && (
                  <Link
                    to="/studio/archive"
                    className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                  >
                    Manage pins in Studio
                  </Link>
                )}
              </div>
              <CardGrid className="grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-6">
                {pinnedTiles.map(({ track, playable }, i) => (
                  <GlowMediaTile
                    key={track.id}
                    title={track.title}
                    subtitle={track.artistName ?? artist.displayName}
                    src={track.bannerUrl ?? placeholderArtworkUrl(track.id)}
                    glowColor={GLOW_COLORS[i % GLOW_COLORS.length]}
                    onPlay={() => play(playable)}
                    onFavorite={() => toggleFavoriteTrack(playable)}
                    favorited={favoriteTracks.some((t) => t.id === playable.id)}
                  />
                ))}
              </CardGrid>
            </div>
          )}

          {releaseTiles.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Eyebrow>Latest releases</Eyebrow>
                {releases.length > releaseTiles.length && (
                  <button
                    type="button"
                    onClick={() => setTab('releases')}
                    className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                  >
                    View all {releases.length}
                  </button>
                )}
              </div>
              <CardGrid className="grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-8">
                {releaseTiles.map(({ release, playable }, i) => {
                  const releasePlayablesList = releasePlayables(
                    release,
                    artist.displayName,
                    channel?.slug,
                  );
                  const totalDurationSec = (release.tracks ?? []).reduce(
                    (total, track) => total + (track.durationSec ?? 0),
                    0,
                  );
                  const releaseSubtitle = [
                    release.type ?? 'Release',
                    `${release.tracks?.length ?? 0} tracks`,
                    totalDurationSec > 0
                      ? formatDuration(totalDurationSec)
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <GlowMediaTile
                      key={release.id}
                      title={release.title}
                      subtitle={releaseSubtitle}
                      src={
                        release.artworkUrl ?? placeholderArtworkUrl(release.id)
                      }
                      glowColor={GLOW_COLORS[(i + 2) % GLOW_COLORS.length]}
                      className="w-full"
                      onClick={
                        release.smartLinkSlug
                          ? () => {
                              void navigate({
                                to: '/r/$slug',
                                params: { slug: release.smartLinkSlug! },
                              });
                            }
                          : undefined
                      }
                      onTitleClick={() => setTracklistRelease(release)}
                      onPlay={
                        playable
                          ? () =>
                              playOrPromptAlbum(
                                release,
                                artist.displayName,
                                channel?.slug,
                              )
                          : undefined
                      }
                      onQueue={
                        releasePlayablesList.length > 0
                          ? () => queueAlbum(releasePlayablesList)
                          : undefined
                      }
                      onFavorite={
                        playable
                          ? () => toggleFavoriteTrack(playable)
                          : undefined
                      }
                      favorited={
                        playable
                          ? favoriteTracks.some((t) => t.id === playable.id)
                          : false
                      }
                    />
                  );
                })}
              </CardGrid>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Eyebrow>Catalog</Eyebrow>
            <PlayableTrackTable
              items={catalogPlayables}
              artistUsername={artist.username}
              emptyMessage={
                pinnedPlayables.length > 0
                  ? 'No other tracks on this profile.'
                  : 'No playable tracks on this profile.'
              }
              onEdit={
                isOwner
                  ? (item) =>
                      setEditingArchiveId(archiveItemIdFromPlayableId(item.id))
                  : undefined
              }
            />
          </div>
        </section>
      )}

      {tab === 'releases' && (
        <section className="flex flex-col gap-3">
          {releases.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No published releases.
            </p>
          ) : (
            <CardGrid>
              {releases.map((rel) => (
                <div key={rel.id} className="flex flex-col gap-2">
                  {rel.smartLinkSlug ? (
                    <Link to="/r/$slug" params={{ slug: rel.smartLinkSlug }}>
                      <Card
                        title={rel.title}
                        subtitle={rel.type ?? 'Release'}
                        src={rel.artworkUrl ?? placeholderArtworkUrl(rel.id)}
                      />
                    </Link>
                  ) : (
                    <Card
                      title={rel.title}
                      subtitle={rel.type ?? 'Release'}
                      src={rel.artworkUrl ?? placeholderArtworkUrl(rel.id)}
                    />
                  )}
                </div>
              ))}
            </CardGrid>
          )}
        </section>
      )}

      {tab === 'collections' && (
        <section className="flex flex-col gap-3">
          {collections.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No public collections.
            </p>
          ) : (
            <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
              {collections.map((col) => (
                <li
                  key={col.slug}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <Link
                      to="/u/$username/c/$slug"
                      params={{ username: artist.username, slug: col.slug }}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {col.name}
                    </Link>
                    <div className="text-foreground-secondary text-xs">
                      {col.itemCount} items
                      {col.isFeatured ? ', featured' : ''}
                    </div>
                  </div>
                  <span className="text-foreground-secondary font-mono text-xs uppercase">
                    {col.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'gallery' && hasGallery && (
        <ArtistGalleryPanel
          images={galleryImages}
          isOwner={isOwner}
          onChange={(next) => {
            setGalleryImages(next);
            if (next.length === 0) {
              setTab('music');
            }
          }}
        />
      )}

      {tab === 'design' && isOwner && (
        <div className="flex flex-col gap-3">
          {channel?.slug ? (
            <p className="text-foreground-secondary text-sm">
              Full layout editing (layers, hide/add, drag) lives on the{' '}
              <Link
                to="/channel/$slug"
                params={{ slug: channel.slug }}
                search={{ edit: '1' }}
                className="underline-offset-2 hover:underline"
              >
                channel page
              </Link>
              . Quick look controls below.
            </p>
          ) : null}
          <ChannelControlsWidget
            sections={[
              {
                id: 'channel-design',
                title: 'Channel appearance',
                children: (
                  <ChannelDesigner
                    displayName={artist.displayName}
                    username={artist.username}
                    channelSlug={channel?.slug}
                    avatarUrl={artist.avatarUrl}
                    bio={artist.bio}
                    compact
                  />
                ),
              },
            ]}
          />
        </div>
      )}

      <ReleaseTracklistDialog
        isOpen={Boolean(tracklistRelease)}
        onClose={() => setTracklistRelease(null)}
        release={tracklistRelease}
        artistName={artist.displayName}
        channelSlug={channel?.slug}
      />

      <TrackEditDialog
        archiveItemId={editingArchiveId}
        onClose={() => setEditingArchiveId(null)}
        onSaved={() => {
          void fetchProfile(username).then((res) => setProfile(res.data));
        }}
      />

      {avatarOpen && artist.avatarUrl ? (
        <ImageLightbox
          images={[{ imageUrl: artist.avatarUrl }]}
          index={0}
          label={`${artist.displayName} profile picture`}
          onClose={() => setAvatarOpen(false)}
        />
      ) : null}

      <Dialog.Root
        isOpen={Boolean(albumPrompt)}
        onClose={() => setAlbumPrompt(null)}
      >
        {albumPrompt && (
          <>
            <Dialog.Title>Play {albumPrompt.release.title}?</Dialog.Title>
            <Dialog.Description>
              Something&apos;s already queued — add this album to the end, or
              play it now instead?
            </Dialog.Description>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button
                variant="secondary"
                onClick={() => {
                  queueAlbum(albumPrompt.playables);
                  setAlbumPrompt(null);
                }}
              >
                Queue album
              </Button>
              <Button
                onClick={() => {
                  playAlbum(albumPrompt.playables);
                  setAlbumPrompt(null);
                }}
              >
                Play now
              </Button>
            </Dialog.Actions>
          </>
        )}
      </Dialog.Root>
    </div>
  );
}
