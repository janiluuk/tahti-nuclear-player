import { Link } from '@tanstack/react-router';
import { AudioLinesIcon, ExternalLinkIcon, PlayIcon } from 'lucide-react';
import { useEffect, useState, type FC } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchChannelArchive,
  fetchProfile,
  fetchSmartLink,
} from '../api/client';
import type {
  SmartLinkView as SmartLinkData,
  TahtiPlayable,
} from '../api/types';
import { ChannelVisualizer } from '../components/ChannelVisualizer';
import { EmbedButton } from '../components/EmbedButton';
import { PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { Eyebrow } from '../components/tahti/Eyebrow';
import { syncDocumentMetadata } from '../lib/seo';
import { usePlayerStore } from '../stores/playerStore';

const DSP_LABELS: Record<string, string> = {
  apple: 'Apple Music',
  amazon: 'Amazon Music',
  bandcamp: 'Bandcamp',
  deezer: 'Deezer',
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  tahti: 'Tahti',
  tidal: 'Tidal',
  youtube: 'YouTube Music',
};

type SmartLinkViewProps = { slug: string };

export const SmartLinkView: FC<SmartLinkViewProps> = ({ slug }) => {
  const [data, setData] = useState<SmartLinkData | null>(null);
  const [playables, setPlayables] = useState<TahtiPlayable[]>([]);
  const [genre, setGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const play = usePlayerStore((state) => state.play);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchSmartLink(slug).then(async (result) => {
      if (cancelled) {
        return;
      }
      setData(result.data);
      setGenre(result.data.release.genre ?? null);

      const { release, artist } = result.data;
      syncDocumentMetadata(window.location.pathname, {
        title: `${release.title} by ${artist.displayName} on Tahti`,
        description:
          release.description ??
          `Listen to ${release.title} and find its official links on Tahti.`,
        image: release.artworkUrl ?? artist.avatarUrl ?? undefined,
      });

      try {
        const profile = await fetchProfile(result.data.artist.username);
        const matched = profile.data.releases.find(
          (release) =>
            release.smartLinkSlug === slug ||
            release.id === result.data.release.id,
        );
        const fromRelease =
          matched?.tracks
            ?.filter((track) => track.playUrl)
            .map(
              (track): TahtiPlayable => ({
                id: `archive:${track.archiveItemId ?? `${matched.id}-${track.position}`}`,
                kind: 'archive',
                title: track.title,
                artist: result.data.artist.displayName,
                coverUrl: matched.artworkUrl ?? undefined,
                streamUrl: track.playUrl!,
                protocol: track.playUrl!.includes('.m3u8') ? 'hls' : 'https',
                channelSlug: profile.data.channel?.slug,
              }),
            ) ?? [];
        let archiveGenre = matched?.genre ?? null;
        if (!archiveGenre && profile.data.channel?.slug && matched?.tracks) {
          const archive = await fetchChannelArchive(profile.data.channel.slug);
          const archiveIds = new Set(
            matched.tracks
              .map((track) => track.archiveItemId)
              .filter((id): id is string => Boolean(id)),
          );
          archiveGenre =
            archive.data.find((item) => archiveIds.has(item.id))?.genre ?? null;
        }
        if (!cancelled) {
          setPlayables(fromRelease);
          setGenre(result.data.release.genre ?? archiveGenre);
        }
      } catch {
        if (!cancelled) {
          setPlayables([]);
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <PageLoading label="Loading release…" />;
  }

  if (!data) {
    return (
      <PageEmpty
        title="Release not found"
        description="This release may have been removed or is not available."
      />
    );
  }

  const targets = Object.entries(data.targets).filter(([, url]) => url?.trim());
  const releaseYear = data.release.releaseDate
    ? new Date(data.release.releaseDate).getFullYear()
    : null;
  const metadata = [releaseYear, genre, data.release.type]
    .filter(Boolean)
    .join(' · ');
  const visualPreset = data.release.visualPreset ?? 'PARTICLE_FIELD';

  return (
    <div className="relative isolate mx-auto flex w-full max-w-xl flex-col gap-6 pb-10">
      {visualPreset !== 'MINIMAL' && (
        <ChannelVisualizer
          preset={visualPreset}
          artworkUrl={data.release.artworkUrl ?? data.artist.avatarUrl}
          className="pointer-events-none fixed inset-0 -z-10 opacity-45"
        />
      )}
      <Link
        to="/u/$username"
        params={{ username: data.artist.username }}
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← {data.artist.username}
      </Link>

      <div className="border-border bg-background-secondary aspect-square w-full overflow-hidden rounded-2xl border">
        {data.release.artworkUrl ? (
          <img
            src={data.release.artworkUrl}
            alt={`${data.release.title} cover`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <AudioLinesIcon
              size={64}
              aria-hidden
              className="text-foreground-secondary"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <EmbedButton target={{ kind: 'release', id: data.release.id }} />
      </div>

      <PageHeader
        title={data.release.title}
        subtitle={
          <Link
            to="/u/$username"
            params={{ username: data.artist.username }}
            className="text-base font-semibold underline-offset-2 hover:underline"
          >
            {data.artist.displayName}
          </Link>
        }
        meta={
          <>
            {metadata ? <p className="capitalize">{metadata}</p> : null}
            {data.release.description ? (
              <p className="mt-2 max-w-md whitespace-pre-wrap">
                {data.release.description}
              </p>
            ) : null}
          </>
        }
      />

      {playables.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>Tracks</Eyebrow>
            <Button
              size="sm"
              onClick={() => {
                const [head, ...rest] = playables;
                if (head) {
                  play(head, { enqueueRest: rest });
                }
              }}
            >
              <PlayIcon size={15} aria-hidden className="mr-1.5" />
              Play all
            </Button>
          </div>
          <PlayableTrackTable items={playables} />
        </section>
      ) : null}

      <section className="flex flex-col gap-2" aria-label="Listen on">
        <Eyebrow>Listen on</Eyebrow>
        {targets.length === 0 ? (
          <a
            href={data.releaseUrl}
            className="border-border hover:bg-background-secondary flex items-center justify-between rounded-lg border px-4 py-3 font-semibold transition-colors"
          >
            Tahti
            <ExternalLinkIcon size={16} aria-hidden />
          </a>
        ) : (
          targets.map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="border-border hover:bg-background-secondary flex items-center justify-between rounded-lg border px-4 py-3 font-semibold transition-colors"
            >
              <span>{DSP_LABELS[name.toLowerCase()] ?? name}</span>
              <span className="text-foreground-secondary flex items-center gap-2 text-xs font-normal">
                Listen
                <ExternalLinkIcon size={15} aria-hidden />
              </span>
            </a>
          ))
        )}
      </section>

      {data.featuredCollections.length > 0 ? (
        <section className="flex flex-col gap-2">
          <Eyebrow>More from {data.artist.displayName}</Eyebrow>
          {data.featuredCollections.map((collection) => (
            <Link
              key={collection.slug}
              to="/u/$username/c/$slug"
              params={{
                username: data.artist.username,
                slug: collection.slug,
              }}
              className="border-border hover:bg-background-secondary flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors"
            >
              <strong>{collection.name}</strong>
              <span className="text-foreground-secondary">
                {collection.itemCount ?? 0} items
              </span>
            </Link>
          ))}
        </section>
      ) : null}
    </div>
  );
};
