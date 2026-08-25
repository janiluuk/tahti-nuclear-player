import { Gauge } from 'lucide-react';

import type { AudioFxPlugin } from './types';

export const compPlugin: AudioFxPlugin = {
  id: 'comp',
  label: 'Compressor',
  description: 'Dynamics compressor',
  icon: Gauge,
  bg: '#7c3aed',
  isEnabled: (editList) => editList.comp.enabled,
  buildPreviewNodes: (ctx, editList) => {
    const { thresholdDb, ratio, attackMs, releaseMs, makeupDb } = editList.comp;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = thresholdDb;
    comp.ratio.value = ratio;
    comp.attack.value = attackMs / 1000;
    comp.release.value = releaseMs / 1000;
    const nodes: AudioNode[] = [comp];
    if (makeupDb !== 0) {
      const makeup = ctx.createGain();
      makeup.gain.value = Math.pow(10, makeupDb / 20);
      nodes.push(makeup);
    }
    return nodes;
  },
};
