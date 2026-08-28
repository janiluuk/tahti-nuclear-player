import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { VisualPreset } from '../api/channel-design';

export const AMBIENT_PRESETS = [
  'AURORA',
  'PARTICLE_FIELD',
  'REACTIVE_GRID',
] as const satisfies readonly VisualPreset[];

export type AmbientPreset = (typeof AMBIENT_PRESETS)[number];

type AmbientState = {
  enabled: boolean;
  preset: AmbientPreset;
  setEnabled: (enabled: boolean) => void;
  setPreset: (preset: AmbientPreset) => void;
};

export const useAmbientStore = create<AmbientState>()(
  persist(
    (set) => ({
      enabled: true,
      preset: 'AURORA',
      setEnabled: (enabled) => set({ enabled }),
      setPreset: (preset) => set({ preset }),
    }),
    { name: 'tahti-nuclear-ambient-background' },
  ),
);
