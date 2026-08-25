import { describe, expect, it } from 'vitest';

import { createDefaultEditList } from '../../api/studio-types';
import { limiterPlugin } from './limiter';
import { createFakeAudioContext } from './testAudioContext';

type FakeCompressorNode = {
  threshold: { value: number };
  knee: { value: number };
  ratio: { value: number };
  attack: { value: number };
  release: { value: number };
};

describe('limiterPlugin', () => {
  it('is enabled iff editList.limiter.enabled', () => {
    const editList = createDefaultEditList(180);
    expect(limiterPlugin.isEnabled(editList)).toBe(false);
    expect(
      limiterPlugin.isEnabled({
        ...editList,
        limiter: { ...editList.limiter, enabled: true },
      }),
    ).toBe(true);
  });

  it('builds a fast high-ratio compressor approximating a brickwall limiter', () => {
    const editList = createDefaultEditList(180);
    editList.limiter = { enabled: true, ceilingDb: -0.5, releaseMs: 80 };

    const [node] = limiterPlugin.buildPreviewNodes(
      createFakeAudioContext(),
      editList,
    ) as unknown as [FakeCompressorNode];

    expect(node.threshold.value).toBe(-0.5);
    expect(node.knee.value).toBe(0);
    expect(node.ratio.value).toBe(20);
    expect(node.attack.value).toBe(0.001);
    expect(node.release.value).toBe(0.08);
  });
});
