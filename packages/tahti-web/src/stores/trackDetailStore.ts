import { create } from 'zustand';

import type { TahtiPlayable } from '../api/types';

type TrackDetailState = {
  cache: Record<string, TahtiPlayable>;
  remember: (playable: TahtiPlayable) => void;
};

/** Holds full `TahtiPlayable` data for tracks a listener has just seen in a
 * list, keyed by playable id, so `/t/$id` can render without a dedicated
 * "fetch one track" endpoint — the data a list already fetched is reused. */
export const useTrackDetailStore = create<TrackDetailState>((set) => ({
  cache: {},
  remember: (playable) =>
    set((s) => ({ cache: { ...s.cache, [playable.id]: playable } })),
}));
