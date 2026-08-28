import { Link } from '@tanstack/react-router';
import {
  ChevronRightIcon,
  Disc3Icon,
  FolderPlusIcon,
  HeadphonesIcon,
  LibraryIcon,
  ListMusicIcon,
  LockIcon,
  Mic2Icon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { fetchStudioCollections } from '../api/studio';
import type { StudioCollection } from '../api/studio-types';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { useAuthStore } from '../stores/authStore';

type Group = {
  id: CollectionKind;
  label: string;
  icon: ReactNode;
};

type CollectionKind = 'album' | 'ep' | 'dj-set' | 'podcast' | 'playlist';
type CollectionFilter = 'all' | CollectionKind;

const GROUPS: Group[] = [
  {
    id: 'album',
    label: 'Albums',
    icon: <LibraryIcon size={14} aria-hidden />,
  },
  {
    id: 'ep',
    label: 'EPs',
    icon: <Disc3Icon size={14} aria-hidden />,
  },
  {
    id: 'dj-set',
    label: 'DJ sets',
    icon: <HeadphonesIcon size={14} aria-hidden />,
  },
  {
    id: 'podcast',
    label: 'Podcasts',
    icon: <Mic2Icon size={14} aria-hidden />,
  },
  {
    id: 'playlist',
    label: 'Playlists',
    icon: <ListMusicIcon size={14} aria-hidden />,
  },
];

const collectionKind = (collection: StudioCollection): CollectionKind => {
  const style = collection.style ?? collection.type;
  if (style === 'EP') {
    return 'ep';
  }
  if (style === 'DJ_SET_SERIES' || style === 'MIX_SERIES') {
    return 'dj-set';
  }
  if (style === 'PODCAST') {
    return 'podcast';
  }
  if (!style || ['PLAYLIST', 'CUSTOM', 'LIST'].includes(style)) {
    return 'playlist';
  }
  return 'album';
};

function CollectionRow({ collection }: { collection: StudioCollection }) {
  const trackCount = collection.itemCount ?? collection.items?.length ?? 0;
  const destination = '/studio/collections/$slug';

  return (
    <li>
      <Link
        to={destination}
        params={{ slug: collection.slug }}
        className="hover:bg-background-secondary focus-visible:ring-primary flex items-center gap-3 px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`Open ${collection.name}`}
      >
        <div className="bg-surface-secondary flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
          {collection.coverUrl ? (
            <img
              src={collection.coverUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            collection.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">
              {collection.name}
            </span>
            {collection.isPublic === false ? (
              <LockIcon
                size={11}
                className="text-foreground-secondary shrink-0"
                aria-label="Private"
              />
            ) : null}
          </div>
          {collection.description ? (
            <p className="text-foreground-secondary truncate text-xs">
              {collection.description}
            </p>
          ) : null}
        </div>
        <span className="text-foreground-secondary hidden shrink-0 text-xs tabular-nums sm:inline">
          {trackCount} tracks
        </span>
        <ChevronRightIcon
          size={16}
          className="text-foreground-secondary shrink-0"
          aria-hidden
        />
      </Link>
    </li>
  );
}

type MyCollectionsViewProps = {
  embedded?: boolean;
  hasOtherContent?: boolean;
};

export function MyCollectionsView({
  embedded = false,
  hasOtherContent = false,
}: MyCollectionsViewProps = {}) {
  const user = useAuthStore((s) => s.user);
  const [collections, setCollections] = useState<StudioCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CollectionFilter>('all');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    void fetchStudioCollections().then((res) => {
      setCollections(res.data);
      setLoading(false);
    });
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections.filter(
      (collection) =>
        (filter === 'all' || collectionKind(collection) === filter) &&
        (!q ||
          collection.name.toLowerCase().includes(q) ||
          collection.description?.toLowerCase().includes(q)),
    );
  }, [collections, filter, query]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        GROUPS.map((group) => [
          group.id,
          collections.filter(
            (collection) => collectionKind(collection) === group.id,
          ).length,
        ]),
      ) as Record<CollectionKind, number>,
    [collections],
  );

  if (!user) {
    return (
      <PageEmpty
        title="Sign in to see your collections"
        description="Playlists, DJ sets, mixes, and other curated groupings you've made live here."
      />
    );
  }

  if (loading) {
    return <PageLoading label="Loading your collections…" />;
  }

  if (collections.length === 0) {
    if (embedded && hasOtherContent) {
      return null;
    }

    return (
      <PageEmpty
        title={
          embedded ? 'Your library is empty' : 'No albums or playlists yet'
        }
        description="Add tracks to an album, playlist, DJ set, or mix in Studio and it will appear here."
        action={
          <Link to="/studio/collections">
            <Button
              size="icon-sm"
              variant="secondary"
              aria-label="Open collections in Studio"
              title="Open collections in Studio"
            >
              <FolderPlusIcon size={16} aria-hidden />
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!embedded ? (
        <div className="flex flex-col gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search collections…"
            className="max-w-xs"
            aria-label="Search collections"
          />
          <div className="flex flex-wrap gap-2" aria-label="Collection types">
            <button
              type="button"
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                filter === 'all'
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-foreground-secondary'
              }`}
            >
              All ({collections.length})
            </button>
            {GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                aria-pressed={filter === group.id}
                onClick={() => setFilter(group.id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  filter === group.id
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-foreground-secondary'
                }`}
              >
                {group.icon}
                {group.label} ({counts[group.id]})
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No collections match “{query}”.
        </p>
      ) : (
        GROUPS.map((group) => {
          const rows = filtered.filter(
            (collection) => collectionKind(collection) === group.id,
          );
          if (rows.length === 0) {
            return null;
          }
          return (
            <section key={group.id} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
                {group.icon}
                {group.label}
              </h2>
              <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
                {rows.map((c) => (
                  <CollectionRow key={c.slug} collection={c} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
