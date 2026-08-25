import { Filter as FilterIcon } from 'lucide-react';

import type { AudioFxPlugin } from './types';

export const filterPlugin: AudioFxPlugin = {
  id: 'filter',
  label: 'Filter',
  description: 'High/low-pass or shelf filter',
  icon: FilterIcon,
  bg: '#059669',
  isEnabled: (editList) => editList.filter.enabled,
  buildPreviewNodes: (ctx, editList) => {
    const filter = ctx.createBiquadFilter();
    filter.type = editList.filter.mode;
    filter.frequency.value = editList.filter.freq;
    return [filter];
  },
};
