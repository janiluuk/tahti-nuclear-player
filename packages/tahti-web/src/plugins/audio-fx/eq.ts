import { SlidersHorizontal } from 'lucide-react';

import type { AudioFxPlugin } from './types';

export const eqPlugin: AudioFxPlugin = {
  id: 'eq',
  label: 'EQ',
  description: '3-band parametric equalizer',
  icon: SlidersHorizontal,
  bg: '#0ea5e9',
  isEnabled: (editList) => editList.eq.enabled,
  buildPreviewNodes: (ctx, editList) =>
    editList.eq.bands.map((band) => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = band.freq;
      filter.Q.value = band.q;
      filter.gain.value = band.gainDb;
      return filter;
    }),
};
