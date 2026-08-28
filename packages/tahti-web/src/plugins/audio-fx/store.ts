import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ProEditorPluginId } from '../../api/studio-types';

type AudioFxState = {
  /** Add-ons available to the Pro Editor. Existing plugins remain enabled
   * by default so saved projects keep their previous behavior. */
  enabledPluginIds: ProEditorPluginId[];
  togglePlugin: (id: ProEditorPluginId) => void;
};

const ALL_AUDIO_FX_IDS: ProEditorPluginId[] = [
  'eq',
  'comp',
  'limiter',
  'filter',
];

export const useAudioFxStore = create<AudioFxState>()(
  persist(
    (set) => ({
      enabledPluginIds: ALL_AUDIO_FX_IDS,
      togglePlugin: (id) =>
        set((state) => ({
          enabledPluginIds: state.enabledPluginIds.includes(id)
            ? state.enabledPluginIds.filter((pluginId) => pluginId !== id)
            : [...state.enabledPluginIds, id],
        })),
    }),
    { name: 'tahti-web-audio-fx' },
  ),
);
