import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { Badge, SectionShell } from '@tahti-player/ui';

import { useLibraryStore } from '../stores/libraryStore';

type FavoriteTab = 'tracks' | 'playlists' | 'channels' | 'artists';

const TABS: Array<{ id: FavoriteTab; label: string }> = [
  { id: 'tracks', label: 'Tracks' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'channels', label: 'Channels' },
  { id: 'artists', label: 'Artists' },
];

function humanizeDate(value: string | undefined): string {
  if (!value) {
    return 'Saved recently';
  }
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const days = Math.floor(elapsed / 86_400_000);
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 30) {
    return `${days} days ago`;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: days > 365 ? 'numeric' : undefined,
  }).format(new Date(value));
}

export function FavoritesPanel() {
  const [tab, setTab] = useState<FavoriteTab>('tracks');
  const tracks = useLibraryStore((state) => state.favoriteTracks);
  const playlists = useLibraryStore((state) => state.favoritePlaylists);
  const channels = useLibraryStore((state) => state.favoriteChannels);
  const trackDates = useLibraryStore((state) => state.favoriteTrackDates);
  const playlistDates = useLibraryStore((state) => state.favoritePlaylistDates);
  const channelDates = useLibraryStore((state) => state.favoriteChannelDates);
  const heardPlaylists = useLibraryStore(
    (state) => state.heardFavoritePlaylists,
  );
  const heardArtists = useLibraryStore((state) => state.heardFavoriteArtists);
  const markFavoriteHeard = useLibraryStore((state) => state.markFavoriteHeard);

  const empty = (
    <p className="text-foreground-secondary px-3 py-4 text-xs">
      Nothing saved here yet.
    </p>
  );

  return (
    <SectionShell title="Favorites">
      <div
        className="flex flex-wrap gap-1"
        role="tablist"
        aria-label="Favorites"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`rounded px-2 py-1 text-xs font-semibold ${tab === item.id ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:bg-background-secondary'}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="divide-border mt-3 divide-y">
        {tab === 'tracks' &&
          (tracks.length === 0
            ? empty
            : tracks.map((track) => (
                <li key={track.id} className="py-2">
                  <Link
                    to="/t/$id"
                    params={{ id: track.id }}
                    className="block min-w-0 hover:underline"
                  >
                    <span className="block truncate text-sm">
                      {track.title}
                    </span>
                    <span className="text-foreground-secondary block truncate text-xs">
                      {track.artist} · {humanizeDate(trackDates[track.id])}
                    </span>
                  </Link>
                </li>
              )))}
        {tab === 'playlists' &&
          (playlists.length === 0
            ? empty
            : playlists.map((playlist) => {
                const isNew = !heardPlaylists.includes(playlist.slug);
                return (
                  <li key={playlist.slug} className="py-2">
                    <Link
                      to={
                        playlist.ownerUsername
                          ? '/u/$username/c/$slug'
                          : '/library/collections'
                      }
                      params={
                        playlist.ownerUsername
                          ? {
                              username: playlist.ownerUsername,
                              slug: playlist.slug,
                            }
                          : undefined
                      }
                      className="flex items-start gap-2 hover:underline"
                      onClick={() =>
                        markFavoriteHeard('playlist', playlist.slug)
                      }
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {playlist.name}
                      </span>
                      {isNew && (
                        <Badge variant="pill" color="blue">
                          New
                        </Badge>
                      )}
                    </Link>
                    <span className="text-foreground-secondary text-xs">
                      {humanizeDate(playlistDates[playlist.slug])}
                    </span>
                  </li>
                );
              }))}
        {(tab === 'channels' || tab === 'artists') &&
          (channels.length === 0
            ? empty
            : channels.map((channel) => {
                const isNew = !heardArtists.includes(channel.slug);
                return (
                  <li key={channel.slug} className="py-2">
                    <Link
                      to="/channel/$slug"
                      params={{ slug: channel.slug }}
                      className="flex items-start gap-2 hover:underline"
                      onClick={() => markFavoriteHeard('artist', channel.slug)}
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {channel.displayName}
                      </span>
                      {tab === 'artists' && isNew && (
                        <Badge variant="pill" color="blue">
                          New
                        </Badge>
                      )}
                    </Link>
                    <span className="text-foreground-secondary text-xs">
                      {channel.slug} ·{' '}
                      {humanizeDate(channelDates[channel.slug])}
                    </span>
                  </li>
                );
              }))}
      </ul>
    </SectionShell>
  );
}
