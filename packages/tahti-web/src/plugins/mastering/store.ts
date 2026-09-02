import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MasteringFeatureState = {
  /** Gates the "Master" / "Match to a reference track" entry points
   * (StudioSoundView, TrackEditDialog). On by default — this is an
   * always-available in-browser tool (see plugins/mastering/README.md),
   * not something gated behind a Tahti API contract. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

export const useMasteringFeatureStore = create<MasteringFeatureState>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: 'tahti-web-mastering-feature' },
  ),
);
