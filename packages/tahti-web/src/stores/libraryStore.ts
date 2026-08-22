import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { fetchFollowing, followArtist, unfollowArtist } from '../api/client';
import type { TahtiPlayable } from '../api/types';

export type FavoriteChannel = {
  slug: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type HistoryEntry = {
  playable: TahtiPlayable;
  playedAt: string;
};

export type LibraryState = {
  /** Current storage scope: `anon` or user id. */
  scopeKey: string;
  syncNote: string | null;
  favoriteChannels: FavoriteChannel[];
  favoriteTracks: TahtiPlayable[];
  history: HistoryEntry[];
  toggleFavoriteChannel: (channel: FavoriteChannel) => void;
  isFavoriteChannel: (slug: string) => boolean;
  toggleFavoriteTrack: (track: TahtiPlayable) => void;
  isFavoriteTrack: (id: string) => boolean;
  pushHistory: (playable: TahtiPlayable) => void;
  clearHistory: () => void;
  mergeServerFollowing: (username: string) => Promise<void>;
  setScopeKey: (key: string) => void;
};

const MAX_HISTORY = 80;
const STORAGE_PREFIX = 'tahti-web:library';

let activeScope = 'anon';

const scopedStorage = createJSONStorage(() => ({
  getItem: (name) => {
    const scoped = localStorage.getItem(`${name}:${activeScope}`);
    if (scoped) {
      return scoped;
    }
    // Migrate pre-namespaced anonymous library once.
    if (activeScope === 'anon') {
      const legacy = localStorage.getItem(name);
      if (legacy) {
        localStorage.setItem(`${name}:anon`, legacy);
        return legacy;
      }
    }
    return null;
  },
  setItem: (name, value) =>
    localStorage.setItem(`${name}:${activeScope}`, value),
  removeItem: (name) => localStorage.removeItem(`${name}:${activeScope}`),
}));

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      scopeKey: 'anon',
      syncNote: null,
      favoriteChannels: [],
      favoriteTracks: [],
      history: [],

      setScopeKey: (key) => set({ scopeKey: key }),

      toggleFavoriteChannel: (channel) => {
        const exists = get().favoriteChannels.some(
          (c) => c.slug === channel.slug,
        );
        set((s) => ({
          favoriteChannels: exists
            ? s.favoriteChannels.filter((c) => c.slug !== channel.slug)
            : [channel, ...s.favoriteChannels],
        }));
        // Best-effort server sync via artist follows (username ≈ channel slug).
        if (activeScope !== 'anon') {
          void (exists
            ? unfollowArtist(channel.slug)
            : followArtist(channel.slug));
        }
      },

      isFavoriteChannel: (slug) =>
        get().favoriteChannels.some((c) => c.slug === slug),

      toggleFavoriteTrack: (track) => {
        set((s) => {
          const exists = s.favoriteTracks.some((t) => t.id === track.id);
          return {
            favoriteTracks: exists
              ? s.favoriteTracks.filter((t) => t.id !== track.id)
              : [track, ...s.favoriteTracks],
          };
        });
      },

      isFavoriteTrack: (id) => get().favoriteTracks.some((t) => t.id === id),

      pushHistory: (playable) => {
        set((s) => {
          const next: HistoryEntry = {
            playable,
            playedAt: new Date().toISOString(),
          };
          const deduped = s.history.filter(
            (h) => h.playable.id !== playable.id,
          );
          return { history: [next, ...deduped].slice(0, MAX_HISTORY) };
        });
      },

      clearHistory: () => set({ history: [] }),

      mergeServerFollowing: async (username) => {
        const { data, meta } = await fetchFollowing(username);
        if (meta.source === 'mock' && import.meta.env.VITE_FORCE_MOCK !== '1') {
          set({
            syncNote:
              'Following could not be synced. Your saved artists remain available on this device.',
          });
          return;
        }
        if (data.length === 0 && meta.source !== 'api') {
          set({
            syncNote: 'Saved tracks and listening history stay on this device.',
          });
          return;
        }
        set((s) => {
          const bySlug = new Map(s.favoriteChannels.map((c) => [c.slug, c]));
          for (const u of data) {
            bySlug.set(u.username, {
              slug: u.username,
              displayName: u.displayName,
              avatarUrl: u.avatarUrl,
            });
          }
          return {
            favoriteChannels: [...bySlug.values()],
            syncNote:
              meta.source === 'api'
                ? 'Following is synced. Saved tracks and listening history stay on this device.'
                : 'Following is available offline. Saved tracks and listening history stay on this device.',
          };
        });
      },
    }),
    {
      name: STORAGE_PREFIX,
      version: 2,
      storage: scopedStorage,
      partialize: (s) => ({
        favoriteChannels: s.favoriteChannels,
        favoriteTracks: s.favoriteTracks,
        history: s.history,
        scopeKey: s.scopeKey,
      }),
    },
  ),
);

/** Switch localStorage namespace when auth user changes, then optionally pull follows. */
export async function rehydrateLibraryForUser(userId: string | null) {
  const nextScope = userId ?? 'anon';
  if (
    nextScope === activeScope &&
    useLibraryStore.getState().scopeKey === nextScope
  ) {
    return;
  }
  activeScope = nextScope;
  useLibraryStore.setState({
    scopeKey: nextScope,
    favoriteChannels: [],
    favoriteTracks: [],
    history: [],
    syncNote: null,
  });
  await useLibraryStore.persist.rehydrate();
  useLibraryStore.setState({ scopeKey: nextScope });
}
