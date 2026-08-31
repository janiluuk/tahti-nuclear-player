import { Link } from '@tanstack/react-router';
import {
  ListMusicIcon,
  ListPlusIcon,
  PencilIcon,
  PlayIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchCollection } from '../api/client';
import type {
  CollectionArchiveItem,
  PublicCollection,
  TahtiPlayable,
} from '../api/types';
import { CollectionTrackList } from '../components/CollectionTrackList';
import { EmbedButton } from '../components/EmbedButton';
import { EmbedTrackRow } from '../components/EmbedTrackRow';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { Eyebrow } from '../components/tahti/Eyebrow';
import type { EmbedProvider } from '../lib/embedSrc';
import { placeholderArtworkUrl } from '../lib/placeholderArt';
import { syncDocumentMetadata } from '../lib/seo';
import { useAuthStore } from '../stores/authStore';
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
  const backdropUrl = collection.backdropUrl;

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

      {/* Nuclear desktop player's playlist-detail layout: square artwork +
          name/description beside it, primary actions under the title. */}
      <div
        className="border-border bg-primary shadow-shadow relative isolate flex flex-col gap-6 overflow-hidden rounded-md border-(length:--border-width) p-6 md:flex-row"
        style={
          backdropUrl
            ? {
                backgroundImage: `linear-gradient(110deg, color-mix(in srgb, var(--color-primary) 94%, transparent), color-mix(in srgb, var(--color-primary) 72%, transparent)), url(${backdropUrl})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }
            : undefined
        }
      >
        <div className="bg-primary/35 pointer-events-none absolute inset-0 -z-10 backdrop-blur-2xl" />
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
        <div className="border-border bg-background-secondary shadow-shadow h-60 w-60 shrink-0 overflow-hidden rounded-md border-(length:--border-width)">
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
            >
              <ListPlusIcon size={16} />
            </Button>
            <EmbedButton target={{ kind: 'collection', slug }} />
          </div>
        </div>
      </div>

      {playables.length > 0 && <CollectionTrackList items={playables} />}

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
