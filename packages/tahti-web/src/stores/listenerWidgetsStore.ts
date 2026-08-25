import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** One user-added SoundCloud/YouTube embed — see src/content/listenerWidgets.ts. */
export type ListenerWidgetInstance = {
  id: string;
  typeId: string;
  input: string;
  label: string;
  addedAt: string;
};

type ListenerWidgetsState = {
  /** Widget types (SoundCloud, YouTube) the user has "installed" from the
   * store — gates whether the add-instance form is shown. */
  installedTypeIds: string[];
  instances: ListenerWidgetInstance[];
  /** RADIO_STATIONS ids the user has enabled from the store. */
  enabledStationIds: string[];
  installType: (typeId: string) => void;
  uninstallType: (typeId: string) => void;
  addInstance: (typeId: string, input: string, label: string) => void;
  removeInstance: (id: string) => void;
  toggleStation: (stationId: string) => void;
};

export const useListenerWidgetsStore = create<ListenerWidgetsState>()(
  persist(
    (set) => ({
      installedTypeIds: [],
      instances: [],
      enabledStationIds: [],
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
    }),
    { name: 'tahti-web-listener-widgets' },
  ),
);
