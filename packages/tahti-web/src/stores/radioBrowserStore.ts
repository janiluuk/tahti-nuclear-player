import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RadioBrowserFeatureState = {
  /** Gates the Radio Browser directory card in the Sources panel — off by
   * default since it calls a third-party API (radio-browser.info), not a
   * Tahti-hosted source. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

export const useRadioBrowserStore = create<RadioBrowserFeatureState>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: 'tahti-web-radio-browser-feature' },
  ),
);
