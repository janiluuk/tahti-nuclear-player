import { create } from 'zustand';

type TourState = {
  open: boolean;
  stepIndex: number;
  toggle: () => void;
  close: () => void;
  setStepIndex: (index: number) => void;
};

export const useTourStore = create<TourState>((set) => ({
  open: false,
  stepIndex: 0,
  toggle: () => set((state) => ({ open: !state.open, stepIndex: 0 })),
  close: () => set({ open: false }),
  setStepIndex: (index) => set({ stepIndex: index }),
}));
