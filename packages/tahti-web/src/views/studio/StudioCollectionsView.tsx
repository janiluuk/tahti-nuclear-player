import { Link } from '@tanstack/react-router';
import {
  Disc3Icon,
  DiscAlbumIcon,
  HeadphonesIcon,
  LibraryIcon,
  ListMusicIcon,
  PlusIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createStudioCollection,
  fetchStudioCollections,
} from '../../api/studio';
import type { StudioCollection } from '../../api/studio-types';
import { PageLoading } from '../../components/PageStates';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const CREATE_STYLES = [
  { id: 'ALBUM', label: 'Album', icon: <Disc3Icon size={18} aria-hidden /> },
  { id: 'EP', label: 'EP', icon: <DiscAlbumIcon size={18} aria-hidden /> },
  {
    id: 'PLAYLIST',
    label: 'Playlist',
    icon: <ListMusicIcon size={18} aria-hidden />,
  },
  {
    id: 'DJ_SET_SERIES',
    label: 'DJ set',
    icon: <HeadphonesIcon size={18} aria-hidden />,
  },
] as const;

type CreateStyle = (typeof CREATE_STYLES)[number]['id'];
type CollectionFilter = 'ALL' | CreateStyle;

const collectionStyle = (collection: StudioCollection): CreateStyle => {
  const style = collection.style ?? collection.type;
  if (style === 'EP') {
    return 'EP';
  }
  if (style === 'DJ_SET_SERIES' || style === 'MIX_SERIES') {
    return 'DJ_SET_SERIES';
  }
  if (!style || ['PLAYLIST', 'CUSTOM', 'LIST'].includes(style)) {
    return 'PLAYLIST';
  }
  return 'ALBUM';
};

export function StudioCollectionsView() {
  const [rows, setRows] = useState<StudioCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [style, setStyle] = useState<CreateStyle>('ALBUM');
  const [filter, setFilter] = useState<CollectionFilter>('ALL');
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<
    'PUBLIC' | 'UNLISTED' | 'PRIVATE'
  >('PUBLIC');
  const [releaseDate, setReleaseDate] = useState('');
  const [genres, setGenres] = useState('');
  const [collaborative, setCollaborative] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    void fetchStudioCollections().then((res) => {
      setRows(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const closeCreate = () => {
    setCreateOpen(false);
    setName('');
    setStyle('ALBUM');
    setVisibility('PUBLIC');
    setReleaseDate('');
    setGenres('');
    setCollaborative(false);
    setBusy(false);
  };

  const submitCreate = () => {
    if (!name.trim() || busy) {
      return;
    }
    setBusy(true);
    setMsg(null);
    void createStudioCollection({
      name: name.trim(),
      style,
      isPublic: visibility === 'PUBLIC',
      visibility,
      releaseDate: releaseDate || null,
      genres: genres
        .split(',')
        .map((genre) => genre.trim())
        .filter(Boolean)
        .slice(0, 5),
      collaborative:
        style === 'PLAYLIST' && visibility === 'PUBLIC' && collaborative,
    }).then((r) => {
      setBusy(false);
      if (!r.ok) {
        setMsg(r.error);
        return;
      }
      setMsg(`Created ${r.data.name} — open designer to add tracks.`);
      closeCreate();
      reload();
    });
  };

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter(
      (collection) =>
        (filter === 'ALL' || collectionStyle(collection) === filter) &&
        (!normalizedQuery ||
          collection.name.toLowerCase().includes(normalizedQuery) ||
          collection.description?.toLowerCase().includes(normalizedQuery)),
    );
  }, [filter, query, rows]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CREATE_STYLES.map((option) => [
          option.id,
          rows.filter((collection) => collectionStyle(collection) === option.id)
            .length,
        ]),
      ) as Record<CreateStyle, number>,
    [rows],
  );

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/collections" />
        <StudioPageHeader
          title="Collections"
          subtitle="Create and manage albums, EPs, DJ sets, and playlists in one place."
          action={
            <Button
              size="sm"
              onClick={() => {
                setMsg(null);
                setCreateOpen(true);
              }}
              aria-label="New collection"
              title="New collection"
            >
              <PlusIcon size={16} aria-hidden className="mr-1.5" />
              New collection
            </Button>
          }
        />

        {msg && <p className="text-sm">{msg}</p>}

        <Dialog.Root isOpen={createOpen} onClose={closeCreate}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <PlusIcon size={18} aria-hidden />
                New collection
              </span>
            </Dialog.Title>
            <Dialog.Description>
              Choose a type and give it a title.
            </Dialog.Description>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                {CREATE_STYLES.map((s) => (
                  <StyleChip
                    key={s.id}
                    selected={style === s.id}
                    icon={s.icon}
                    label={s.label}
                    onClick={() => setStyle(s.id)}
                  />
                ))}
              </div>
              {style === 'ALBUM' || style === 'EP' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    Release date
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(event) => setReleaseDate(event.target.value)}
                      className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                    />
                  </label>
                  <Input
                    label="Genres"
                    value={genres}
                    placeholder="Electronic, Ambient"
                    onChange={(event) => setGenres(event.target.value)}
                  />
                </div>
              ) : null}
              <label className="flex flex-col gap-1 text-sm">
                Visibility
                <select
                  aria-label="Collection visibility"
                  value={visibility}
                  onChange={(event) => {
                    const nextVisibility = event.target.value as
                      | 'PUBLIC'
                      | 'UNLISTED'
                      | 'PRIVATE';
                    setVisibility(nextVisibility);
                    if (nextVisibility !== 'PUBLIC') {
                      setCollaborative(false);
                    }
                  }}
                  className="border-border bg-background h-10 rounded-md border px-3 text-sm"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="UNLISTED">Unlisted — direct link only</option>
                  <option value="PRIVATE">Private — only you</option>
                </select>
              </label>
              {style === 'PLAYLIST' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={collaborative}
                    disabled={visibility !== 'PUBLIC'}
                    onChange={(event) => setCollaborative(event.target.checked)}
                  />
                  Others can add tracks
                </label>
              ) : null}
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button type="submit" disabled={!name.trim() || busy}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Creating…' : 'Create'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>

        <StudioPanel>
          <div className="mb-4 flex flex-col gap-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search collections…"
              aria-label="Search collections"
            />
            <div className="flex flex-wrap gap-2" aria-label="Collection types">
              <StyleChip
                selected={filter === 'ALL'}
                icon={<LibraryIcon size={16} aria-hidden />}
                label={`All (${rows.length})`}
                onClick={() => setFilter('ALL')}
              />
              {CREATE_STYLES.map((option) => (
                <StyleChip
                  key={option.id}
                  selected={filter === option.id}
                  icon={option.icon}
                  label={`${option.label}s (${counts[option.id]})`}
                  onClick={() => setFilter(option.id)}
                />
              ))}
            </div>
          </div>
          {loading ? (
            <PageLoading label="Loading…" />
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No collections yet — create an album, EP, DJ set, or playlist.
              </p>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New collection
              </Button>
            </div>
          ) : filteredRows.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No collections match these filters.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {filteredRows.map((c) => (
                <li
                  key={c.slug}
                  className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  {c.coverUrl ? (
                    <img
                      src={c.coverUrl}
                      alt=""
                      className="border-border h-12 w-12 rounded-lg border object-cover shadow-sm"
                    />
                  ) : (
                    <div className="border-border bg-background flex h-12 w-12 items-center justify-center rounded-lg border">
                      <Disc3Icon size={18} className="opacity-40" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-foreground-secondary text-xs">
                      /{c.slug}
                      {`, ${collectionStyle(c).replaceAll('_', ' ')}`}
                      {c.releaseDate ? `, releases ${c.releaseDate}` : ''}
                      {c.genres?.length ? `, ${c.genres.join(', ')}` : ''}
                      {typeof c.itemCount === 'number'
                        ? `, ${c.itemCount} items`
                        : c.items
                          ? `, ${c.items.length} items`
                          : ''}
                      {`, ${(c.visibility ?? (c.isPublic === false ? 'PRIVATE' : 'PUBLIC')).toLowerCase()}`}
                    </p>
                  </div>
                  <Link
                    to={
                      ['PLAYLIST', 'DJ_SET_SERIES'].includes(collectionStyle(c))
                        ? '/studio/playlists/$slug'
                        : '/studio/collections/$slug'
                    }
                    params={{ slug: c.slug }}
                  >
                    <Button size="sm">
                      {['ALBUM', 'EP'].includes(collectionStyle(c))
                        ? 'Design'
                        : 'Edit'}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}

function StyleChip({
  selected,
  icon,
  label,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
        selected
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border text-foreground-secondary'
      }`}
      onClick={onClick}
      aria-pressed={selected}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
