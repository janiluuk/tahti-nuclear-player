import { Link, useNavigate } from '@tanstack/react-router';
import {
  BookmarkIcon,
  ListMusicIcon,
  ListPlusIcon,
  PencilIcon,
  PlayIcon,
  RadioIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@tahti-player/ui';

import {
  fetchCollection,
  fetchCollectionSubscription,
  setCollectionSubscription,
} from '../api/client';
import { createJam } from '../api/jam';
import type {
  CollectionArchiveItem,
  PublicCollection,
  TahtiPlayable,
} from '../api/types';
import { ChannelVisualizer } from '../components/ChannelVisualizer';
import { EmbedButton } from '../components/EmbedButton';
import { EmbedTrackRow } from '../components/EmbedTrackRow';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { Eyebrow } from '../components/tahti/Eyebrow';
import { resolveArtworkVisualizerPreset } from '../lib/artworkVisualizer';
import type { EmbedProvider } from '../lib/embedSrc';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { syncDocumentMetadata } from '../lib/seo';
import { useAuthStore } from '../stores/authStore';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

function collectionToPlayables(col: PublicCollection): TahtiPlayable[] {
  const out: TahtiPlayable[] = [];
  for (const item of col.items) {
    const archive = item.archiveItem;
    if (!archive?.audioUrl) {
      continue;
    }
    const isHls = archive.audioUrl.includes('.m3u8');
    out.push({
      id: `archive:${archive.id}`,
      kind: 'archive',
      title: archive.title,
      artist: col.user.displayName,
      coverUrl:
        archive.bannerUrl ??
        col.coverUrl ??
        placeholderArtworkUrl(`${col.slug}:${archive.id}`),
      streamUrl: archive.audioUrl,
      protocol: isHls ? 'hls' : 'https',
      channelSlug: archive.channel?.slug,
    });
  }
  return out;
}

export function CollectionView({
  username,
  slug,
}: {
  username: string;
  slug: string;
}) {
  const [collection, setCollection] = useState<PublicCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const me = useAuthStore((s) => s.user);
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const isFavorite = useLibraryStore((s) =>
    s.favoritePlaylists.some((item) => item.slug === slug),
  );
  const toggleFavoritePlaylist = useLibraryStore(
    (s) => s.toggleFavoritePlaylist,
  );
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    subscriberCount: number;
  } | null>(null);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchCollection(slug).then((res) => {
      if (cancelled) {
        return;
      }
      setCollection(res.data);
      setLoading(false);
      if (res.data) {
        syncDocumentMetadata(window.location.pathname, {
          title: `${res.data.name} by ${res.data.user.displayName} on Tahti`,
          description:
            res.data.description ??
            `Listen to ${res.data.name}, a collection by ${res.data.user.displayName} on Tahti.`,
          image: res.data.coverUrl ?? placeholderArtworkUrl(res.data.slug),
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    void fetchCollectionSubscription(slug).then((result) => {
      if (!cancelled) {
        setSubscription(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const playables = useMemo(
    () => (collection ? collectionToPlayables(collection) : []),
    [collection],
  );

  // Items Tahti references but never hosts — only the provider's own
  // widget can play them, so they can't go through the track table.
  const embedItems = useMemo(() => {
    if (!collection) {
      return [];
    }
    const out: { archive: CollectionArchiveItem; provider: EmbedProvider }[] =
      [];
    for (const item of collection.items) {
      const archive = item.archiveItem;
      if (
        archive &&
        !archive.audioUrl &&
        archive.embedProvider &&
        archive.embedUri
      ) {
        out.push({ archive, provider: archive.embedProvider });
      }
    }
    return out;
  }, [collection]);

  if (loading) {
    return <PageLoading label="Loading collection…" />;
  }

  if (!collection) {
    return (
      <PageEmpty
        title="Collection not found"
        description="This collection may have been removed or is not available."
      />
    );
  }

  const isOwner = Boolean(me && me.username === collection.user.username);
  const coverUrl =
    collection.coverUrl ?? placeholderArtworkUrl(collection.slug);
  const backdropUrl = collection.backdropUrl ?? collection.videoBackgroundUrl;
  const hasImageBackdrop = Boolean(
    backdropUrl ||
    (collection.galleryMode === 'STATIC_SLIDESHOW' &&
      collection.slideshowImages?.[0]),
  );

  const playAll = () => {
    const [head, ...rest] = playables;
    if (head) {
      play(head, { enqueueRest: rest });
    }
  };

  const queueAll = () => {
    for (const item of playables) {
      enqueue(item);
    }
  };

  const startJam = async () => {
    if (!me) {
      void navigate({ to: '/login' });
      return;
    }
    try {
      const session = await createJam(slug);
      void navigate({ to: '/jam/$code', params: { code: session.code } });
    } catch {
      toast.error("Couldn't start a Jam for this playlist.");
    }
  };

  const toggleSubscription = async () => {
    if (!subscription || subscriptionBusy) {
      return;
    }
    if (!me) {
      void navigate({ to: '/login' });
      return;
    }
    setSubscriptionBusy(true);
    try {
      setSubscription(
        await setCollectionSubscription(slug, !subscription.subscribed),
      );
    } finally {
      setSubscriptionBusy(false);
    }
  };

  return (
    <PageFrame>
      <div className="flex flex-wrap gap-3 text-xs">
        <Link to="/" className="text-foreground-secondary hover:underline">
          ← Listen
        </Link>
        <Link
          to="/u/$username"
          params={{ username }}
          className="text-foreground-secondary hover:underline"
        >
          @{username}
        </Link>
      </div>

      <div className="border-border bg-primary shadow-shadow relative isolate flex flex-col gap-6 overflow-hidden rounded-md border-(length:--border-width) p-6 md:flex-row">
        <img
          src={backdropUrl ?? collection.slideshowImages?.[0] ?? coverUrl}
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 size-full scale-110 object-cover opacity-35 blur-3xl"
          aria-hidden
        />
        {!hasImageBackdrop && (
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-55">
            <ChannelVisualizer
              preset={resolveArtworkVisualizerPreset(collection.slug)}
              artworkUrl={coverUrl}
              className="size-full"
            />
          </div>
        )}
        <div className="bg-primary/75 pointer-events-none absolute inset-0 -z-10 backdrop-blur-xl" />
        {isOwner && (
          <Link
            to="/studio/collections/$slug"
            params={{ slug }}
            className="absolute top-4 right-4 z-10"
          >
            <Button variant="secondary" size="icon-sm" title="Edit in Studio">
              <PencilIcon size={14} />
            </Button>
          </Link>
        )}
        <div className="border-border bg-background-secondary/60 shadow-shadow h-60 w-60 shrink-0 overflow-hidden rounded-md border-(length:--border-width) backdrop-blur-sm">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ListMusicIcon
                size={64}
                aria-hidden
                className="text-foreground-secondary"
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <PageHeader
            title={collection.name}
            subtitle={
              <>
                by{' '}
                <Link
                  to="/u/$username"
                  params={{ username: collection.user.username }}
                  className="hover:text-foreground underline-offset-2 hover:underline"
                >
                  {collection.user.displayName}
                </Link>
                {collection.collaborative ? ' (collaborative)' : ''}
                {collection.description ? (
                  <span className="text-foreground mt-2 block">
                    {collection.description}
                  </span>
                ) : null}
              </>
            }
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={playAll}
              disabled={playables.length === 0}
            >
              <PlayIcon size={16} aria-hidden className="mr-1.5" />
              Play
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={queueAll}
              disabled={playables.length === 0}
              title="Add all to queue"
              aria-label="Add all to queue"
            >
              <ListPlusIcon size={16} aria-hidden />
            </Button>
            <EmbedButton target={{ kind: 'collection', slug }} />
            <Button variant="secondary" onClick={() => void startJam()}>
              <RadioIcon size={15} aria-hidden className="mr-1.5" />
              Start a Jam
            </Button>
            <Button
              variant={isFavorite ? 'default' : 'secondary'}
              aria-pressed={isFavorite}
              onClick={() =>
                toggleFavoritePlaylist({
                  slug,
                  name: collection.name,
                  ownerUsername: collection.user.username,
                  coverUrl: collection.coverUrl,
                })
              }
            >
              <BookmarkIcon size={15} aria-hidden className="mr-1.5" />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            {!isOwner && collection.isPublic && subscription ? (
              <Button
                variant={subscription.subscribed ? 'default' : 'secondary'}
                onClick={() => void toggleSubscription()}
                disabled={subscriptionBusy}
                aria-pressed={subscription.subscribed}
                title={me ? undefined : 'Sign in to subscribe to this playlist'}
              >
                <BookmarkIcon size={15} aria-hidden className="mr-1.5" />
                {subscription.subscribed ? 'Subscribed' : 'Subscribe'}
                {subscription.subscriberCount > 0
                  ? ` (${subscription.subscriberCount})`
                  : ''}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {playables.length > 0 && (
        <PlayableTrackTable
          items={playables}
          compactActions
          emptyMessage="No tracks yet."
        />
      )}

      {embedItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2>
            <Eyebrow>Elsewhere</Eyebrow>
          </h2>
          <ul className="flex flex-col gap-2">
            {embedItems.map(({ archive, provider }) => (
              <EmbedTrackRow
                key={archive.id}
                title={archive.title}
                provider={provider}
                embedUri={archive.embedUri!}
              />
            ))}
          </ul>
        </section>
      )}

      {playables.length === 0 && embedItems.length === 0 && (
        <p className="text-foreground-secondary text-sm">
          No tracks in this collection yet.
        </p>
      )}

      {collection.items.some((i) => i.release && !i.archiveItem) && (
        <section className="flex flex-col gap-2">
          <h2>
            <Eyebrow>Linked releases</Eyebrow>
          </h2>
          <ul className="text-sm">
            {collection.items
              .filter((i) => i.release)
              .map((i) => (
                <li key={i.release!.id}>
                  {i.release!.smartLinkSlug ? (
                    <Link
                      to="/r/$slug"
                      params={{ slug: i.release!.smartLinkSlug }}
                      className="underline-offset-2 hover:underline"
                    >
                      {i.release!.title}
                    </Link>
                  ) : (
                    i.release!.title
                  )}
                </li>
              ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
