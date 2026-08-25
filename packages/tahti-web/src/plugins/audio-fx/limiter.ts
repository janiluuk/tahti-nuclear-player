import { ShieldAlert } from 'lucide-react';

import type { AudioFxPlugin } from './types';

/**
 * A fast high-ratio DynamicsCompressorNode, not a true brickwall limiter —
 * close enough for an audible preview. The real ffmpeg render path is
 * still the source of truth for the exported file.
 */
export const limiterPlugin: AudioFxPlugin = {
  id: 'limiter',
  label: 'Limiter',
  description: 'Fast ceiling limiter',
  icon: ShieldAlert,
  bg: '#dc2626',
  isEnabled: (editList) => editList.limiter.enabled,
  buildPreviewNodes: (ctx, editList) => {
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = editList.limiter.ceilingDb;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = editList.limiter.releaseMs / 1000;
    return [limiter];
  },
};
