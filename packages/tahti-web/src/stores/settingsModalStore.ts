import { create } from 'zustand';

import type { PluginCategoryId } from '../content/pluginStoreCategories';
import type { SettingsSectionId } from '../views/settings/settingsNav';

type SettingsModalState = {
  isOpen: boolean;
  activeTab: SettingsSectionId;
  /** Sub-tab to land on when activeTab === 'plugin-store' — PluginStorePanel
   * syncs to this on every open. Deliberately a plain field, not a
   * "consume once and clear" value: React 18 StrictMode double-invokes
   * effects/initializers in dev, and a destructive read there is a race
   * (first invocation clears it before the second can see it). */
  pluginCategory: PluginCategoryId | null;
  open: (tab?: SettingsSectionId, pluginCategory?: PluginCategoryId) => void;
  close: () => void;
  setActiveTab: (tab: SettingsSectionId) => void;
};

export const useSettingsModalStore = create<SettingsModalState>((set) => ({
  isOpen: false,
  activeTab: 'account',
  pluginCategory: null,
  open: (tab, pluginCategory) =>
    set((state) => ({
      isOpen: true,
      activeTab: tab ?? state.activeTab,
      pluginCategory: pluginCategory ?? null,
    })),
  close: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
