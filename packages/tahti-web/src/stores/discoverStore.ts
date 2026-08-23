import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DiscoverWidgetId =
  | 'this-week-most-played'
  | 'this-week-least-played'
  | 'new-to-you'
  | 'latest-tracks'
  | 'most-played'
  | 'loved';

export const ALL_WIDGET_IDS: DiscoverWidgetId[] = [
  'this-week-most-played',
  'this-week-least-played',
  'new-to-you',
  'latest-tracks',
  'most-played',
  'loved',
];

export const DEFAULT_WIDGETS: DiscoverWidgetId[] = [
  'this-week-most-played',
  'new-to-you',
  'latest-tracks',
];

type DiscoverState = {
  enabledWidgets: DiscoverWidgetId[];
  genreFilter: string[];
  contentTypeFilter: string[];
  addWidget: (id: DiscoverWidgetId) => void;
  removeWidget: (id: DiscoverWidgetId) => void;
  moveWidget: (id: DiscoverWidgetId, direction: 'up' | 'down') => void;
  setGenreFilter: (genres: string[]) => void;
  setContentTypeFilter: (types: string[]) => void;
};

export const useDiscoverStore = create<DiscoverState>()(
  persist(
    (set) => ({
      enabledWidgets: DEFAULT_WIDGETS,
      genreFilter: [],
      contentTypeFilter: [],

      addWidget: (id) =>
        set((s) =>
          s.enabledWidgets.includes(id)
            ? s
            : { enabledWidgets: [...s.enabledWidgets, id] },
        ),

      removeWidget: (id) =>
        set((s) => ({
          enabledWidgets: s.enabledWidgets.filter((w) => w !== id),
        })),

      moveWidget: (id, direction) =>
        set((s) => {
          const index = s.enabledWidgets.indexOf(id);
          if (index === -1) {
            return s;
          }
          const target = direction === 'up' ? index - 1 : index + 1;
          if (target < 0 || target >= s.enabledWidgets.length) {
            return s;
          }
          const next = [...s.enabledWidgets];
          [next[index], next[target]] = [next[target]!, next[index]!];
          return { enabledWidgets: next };
        }),

      setGenreFilter: (genres) => set({ genreFilter: genres }),
      setContentTypeFilter: (types) => set({ contentTypeFilter: types }),
    }),
    { name: 'tahti-web:discover' },
  ),
);
