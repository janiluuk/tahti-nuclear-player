import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { RadioStation } from '../content/radioStations';

/** One user-added external embed — see src/content/listenerWidgets.ts. */
export type ListenerWidgetInstance = {
  id: string;
  typeId: string;
  input: string;
  label: string;
  addedAt: string;
};

type ListenerWidgetsState = {
  /** Widget types (SoundCloud, Spotify, YouTube) the user has "installed" from the
   * store — gates whether the add-instance form is shown. */
  installedTypeIds: string[];
  instances: ListenerWidgetInstance[];
  /** RADIO_STATIONS ids the user has enabled from the store. */
  enabledStationIds: string[];
  stationOverrides: Record<string, Partial<RadioStation>>;
  installType: (typeId: string) => void;
  uninstallType: (typeId: string) => void;
  addInstance: (typeId: string, input: string, label: string) => void;
  removeInstance: (id: string) => void;
  toggleStation: (stationId: string) => void;
  updateStation: (stationId: string, patch: Partial<RadioStation>) => void;
};

export const useListenerWidgetsStore = create<ListenerWidgetsState>()(
  persist(
    (set) => ({
      installedTypeIds: [],
      instances: [],
      enabledStationIds: [],
      stationOverrides: {},
      installType: (typeId) =>
        set((s) => ({
          installedTypeIds: s.installedTypeIds.includes(typeId)
            ? s.installedTypeIds
            : [...s.installedTypeIds, typeId],
        })),
      uninstallType: (typeId) =>
        set((s) => ({
          installedTypeIds: s.installedTypeIds.filter((id) => id !== typeId),
          instances: s.instances.filter((i) => i.typeId !== typeId),
        })),
      addInstance: (typeId, input, label) =>
        set((s) => ({
          instances: [
            ...s.instances,
            {
              id: crypto.randomUUID(),
              typeId,
              input,
              label,
              addedAt: new Date().toISOString(),
            },
          ],
        })),
      removeInstance: (id) =>
        set((s) => ({ instances: s.instances.filter((i) => i.id !== id) })),
      toggleStation: (stationId) =>
        set((s) => ({
          enabledStationIds: s.enabledStationIds.includes(stationId)
            ? s.enabledStationIds.filter((id) => id !== stationId)
            : [...s.enabledStationIds, stationId],
        })),
      updateStation: (stationId, patch) =>
        set((s) => ({
          stationOverrides: {
            ...s.stationOverrides,
            [stationId]: { ...s.stationOverrides[stationId], ...patch },
          },
        })),
    }),
    { name: 'tahti-web-listener-widgets' },
  ),
);
