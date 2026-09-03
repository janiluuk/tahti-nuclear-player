import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RightRailTab = 'chat' | 'notifications' | 'queue';

type LayoutState = {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  leftWidth: number;
  rightWidth: number;
  /** Expand past | play | upcoming strip in the bottom player. */
  bottomQueueOpen: boolean;
  /** Shared with player-bar queue button and RightRailPanel. */
  rightRailTab: RightRailTab;
  /** Tab to restore when queue toggle closes a rail that was already open. */
  rightRailTabBeforeQueue: RightRailTab | null;
  /** Full-screen now-playing overlay -- deliberately not persisted, a
   * reload should never drop the user straight into it. */
  fullScreenPlayerOpen: boolean;
  /** Channel slug for rail chat (last chat-enabled channel). */
  chatSlug: string | null;
  /** Whether that channel allows chat. */
  chatEnabled: boolean;
  /** Short reason when chat is unavailable. */
  chatDisabledReason: string | null;
  /** Slugs we've already auto-opened chat for this session. */
  chatAutoOpenedFor: string | null;

  toggleLeft: () => void;
  setLeftCollapsed: (collapsed: boolean) => void;
  toggleRight: () => void;
  setLeftWidth: (n: number) => void;
  setRightWidth: (n: number) => void;
  setRightCollapsed: (collapsed: boolean) => void;
  setBottomQueueOpen: (open: boolean) => void;
  toggleBottomQueue: () => void;
  setRightRailTab: (tab: RightRailTab) => void;
  /** Queue button: open rail on Queue, or restore previous tab / collapse. */
  toggleQueueRail: () => void;
  setFullScreenPlayerOpen: (open: boolean) => void;
  /** Bind channel chat context; optionally open right rail once per visit. */
  setChatContext: (opts: {
    slug: string;
    enabled: boolean;
    reason?: string | null;
    autoOpen?: boolean;
  }) => void;
  clearChatContext: () => void;
  openChatRail: (slug?: string) => void;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      leftCollapsed: false,
      rightCollapsed: false,
      leftWidth: 220,
      rightWidth: 340,
      bottomQueueOpen: false,
      rightRailTab: 'chat',
      rightRailTabBeforeQueue: null,
      fullScreenPlayerOpen: false,
      chatSlug: null,
      chatEnabled: false,
      chatDisabledReason: null,
      chatAutoOpenedFor: null,

      toggleLeft: () => set((s) => ({ leftCollapsed: !s.leftCollapsed })),
      setLeftCollapsed: (leftCollapsed) => set({ leftCollapsed }),
      toggleRight: () => set((s) => ({ rightCollapsed: !s.rightCollapsed })),
      setLeftWidth: (leftWidth) => set({ leftWidth }),
      setRightWidth: (rightWidth) => set({ rightWidth }),
      setRightCollapsed: (rightCollapsed) => set({ rightCollapsed }),
      setBottomQueueOpen: (bottomQueueOpen) => set({ bottomQueueOpen }),
      toggleBottomQueue: () =>
        set((s) => ({ bottomQueueOpen: !s.bottomQueueOpen })),
      setRightRailTab: (rightRailTab) => set({ rightRailTab }),
      toggleQueueRail: () => {
        const state = get();
        if (state.rightCollapsed) {
          set({
            rightCollapsed: false,
            rightRailTabBeforeQueue: state.rightRailTab,
            rightRailTab: 'queue',
          });
          return;
        }
        if (state.rightRailTab !== 'queue') {
          set({
            rightRailTabBeforeQueue: state.rightRailTab,
            rightRailTab: 'queue',
          });
          return;
        }
        const previous = state.rightRailTabBeforeQueue;
        if (previous && previous !== 'queue') {
          set({
            rightRailTab: previous,
            rightRailTabBeforeQueue: null,
          });
          return;
        }
        set({
          rightCollapsed: true,
          rightRailTabBeforeQueue: null,
        });
      },
      setFullScreenPlayerOpen: (fullScreenPlayerOpen) =>
        set({ fullScreenPlayerOpen }),

      setChatContext: ({ slug, enabled, reason, autoOpen }) => {
        const prev = get();
        const next: Partial<LayoutState> = {
          chatSlug: slug,
          chatEnabled: enabled,
          chatDisabledReason: enabled
            ? null
            : (reason ?? 'Chat is disabled for this channel'),
        };
        if (enabled && autoOpen && prev.chatAutoOpenedFor !== slug) {
          // Keep persisted collapse preference; only mark auto-open once.
          next.chatAutoOpenedFor = slug;
        }
        set(next);
      },

      clearChatContext: () =>
        set((s) => ({
          chatEnabled: false,
          chatDisabledReason: s.chatSlug
            ? 'Open a channel to use chat'
            : 'No channel chat yet',
        })),

      openChatRail: (slug) => {
        const s = get();
        const target = slug ?? s.chatSlug;
        if (!target || !s.chatEnabled) {
          return;
        }
        set({
          chatSlug: target,
          rightCollapsed: false,
          rightRailTab: 'chat',
        });
      },
    }),
    {
      name: 'tahti-web-layout',
      version: 4,
      migrate: (persisted) => {
        const p = { ...((persisted ?? {}) as Record<string, unknown>) };
        // Drop legacy rightRailMode ('queue' | 'chat').
        delete p.rightRailMode;
        return {
          ...p,
          bottomQueueOpen:
            typeof p.bottomQueueOpen === 'boolean' ? p.bottomQueueOpen : false,
          rightRailTab:
            p.rightRailTab === 'notifications' || p.rightRailTab === 'queue'
              ? p.rightRailTab
              : 'chat',
          rightRailTabBeforeQueue: null,
        };
      },
      partialize: (s) => ({
        leftCollapsed: s.leftCollapsed,
        rightCollapsed: s.rightCollapsed,
        bottomQueueOpen: s.bottomQueueOpen,
        rightRailTab: s.rightRailTab,
        rightWidth: s.rightWidth,
        leftWidth: s.leftWidth,
        chatSlug: s.chatSlug,
        chatEnabled: s.chatEnabled,
        chatAutoOpenedFor: s.chatAutoOpenedFor,
      }),
    },
  ),
);
