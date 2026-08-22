import { Link } from '@tanstack/react-router';
import {
  ChevronRightIcon,
  Disc3Icon,
  FolderPlusIcon,
  HeadphonesIcon,
  LibraryIcon,
  ListMusicIcon,
  LockIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { fetchStudioCollections } from '../api/studio';
import type { StudioCollection } from '../api/studio-types';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { useAuthStore } from '../stores/authStore';

type Group = {
  id: string;
  label: string;
  icon: ReactNode;
  match: (style: string | undefined) => boolean;
};

const GROUPS: Group[] = [
  {
    id: 'playlists',
    label: 'Playlists',
    icon: <ListMusicIcon size={14} aria-hidden />,
    match: (style) => style === 'PLAYLIST',
  },
  {
    id: 'dj-sets',
    label: 'DJ sets',
    icon: <HeadphonesIcon size={14} aria-hidden />,
    match: (style) => style === 'DJ_SET_SERIES',
  },
  {
    id: 'mixes',
    label: 'Mixes',
    icon: <Disc3Icon size={14} aria-hidden />,
    match: (style) => style === 'MIX_SERIES',
  },
  {
    id: 'collections',
    label: 'Albums',
    icon: <LibraryIcon size={14} aria-hidden />,
    match: (style) =>
      !style || !['PLAYLIST', 'DJ_SET_SERIES', 'MIX_SERIES'].includes(style),
  },
];

function CollectionRow({ collection }: { collection: StudioCollection }) {
  const trackCount = collection.itemCount ?? collection.items?.length ?? 0;
  const destination =
    collection.style === 'PLAYLIST'
      ? '/studio/playlists/$slug'
      : '/studio/collections/$slug';

  return (
    <li>
      <Link
        to={destination}
        params={{ slug: collection.slug }}
        className="border-border hover:bg-background-secondary focus-visible:ring-primary flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
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

  const collectionsWithContent = useMemo(
    () =>
      collections.filter(
        (collection) =>
          (collection.itemCount ?? collection.items?.length ?? 0) > 0,
      ),
    [collections],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return collectionsWithContent;
    }
    return collectionsWithContent.filter((collection) =>
      collection.name.toLowerCase().includes(q),
    );
  }, [collectionsWithContent, query]);

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

  if (collectionsWithContent.length === 0) {
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
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your library…"
          className="max-w-xs"
          aria-label="Search albums and playlists"
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No collections match “{query}”.
        </p>
      ) : (
        GROUPS.map((group) => {
          const rows = filtered.filter((c) => group.match(c.style));
          if (rows.length === 0) {
            return null;
          }
          return (
            <section key={group.id} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
                {group.icon}
                {group.label}
              </h2>
              <ul className="flex flex-col gap-2">
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
