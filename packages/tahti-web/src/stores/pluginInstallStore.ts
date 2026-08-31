import { create } from 'zustand';

type PluginInstallState = {
  /** Plugin id -> whether it's currently "installed" (connected/configured/
   * enabled) — written by each card as it learns its own real status, read
   * by the category list to split into Installed / Available tabs. Not
   * persisted: it's a live mirror of state each card already fetches on
   * mount, not a second source of truth. */
  installed: Record<string, boolean>;
  setInstalled: (id: string, value: boolean) => void;
};

export const usePluginInstallStore = create<PluginInstallState>((set) => ({
  installed: {},
  setInstalled: (id, value) =>
    set((state) =>
      state.installed[id] === value
        ? state
        : { installed: { ...state.installed, [id]: value } },
    ),
}));
