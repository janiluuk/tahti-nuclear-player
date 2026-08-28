import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ChannelShareState = {
  enabledByChannel: Record<string, boolean>;
  setEnabled: (slug: string, enabled: boolean) => void;
};

export const useChannelShareStore = create<ChannelShareState>()(
  persist(
    (set) => ({
      enabledByChannel: {},
      setEnabled: (slug, enabled) =>
        set((state) => ({
          enabledByChannel: { ...state.enabledByChannel, [slug]: enabled },
        })),
    }),
    { name: 'tahti-channel-share-preferences' },
  ),
);
