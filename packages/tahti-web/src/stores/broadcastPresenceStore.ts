import { create } from 'zustand';

type BroadcastPresenceState = {
  signalConnected: boolean;
  setSignalConnected: (connected: boolean) => void;
};

export const useBroadcastPresenceStore = create<BroadcastPresenceState>(
  (set) => ({
    signalConnected: false,
    setSignalConnected: (connected) => set({ signalConnected: connected }),
  }),
);
