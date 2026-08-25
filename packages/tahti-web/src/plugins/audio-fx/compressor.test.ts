import { describe, expect, it } from 'vitest';

import { createDefaultEditList } from '../../api/studio-types';
import { compPlugin } from './compressor';
import { createFakeAudioContext } from './testAudioContext';

type FakeCompressorNode = {
  threshold: { value: number };
  ratio: { value: number };
  attack: { value: number };
  release: { value: number };
};
type FakeGainNode = { gain: { value: number } };

describe('compPlugin', () => {
  it('is enabled iff editList.comp.enabled', () => {
    const editList = createDefaultEditList(180);
    expect(compPlugin.isEnabled(editList)).toBe(false);
    expect(
      compPlugin.isEnabled({
        ...editList,
        comp: { ...editList.comp, enabled: true },
      }),
    ).toBe(true);
  });

  it('maps ms to seconds and dB threshold/ratio directly onto the compressor node', () => {
    const editList = createDefaultEditList(180);
    editList.comp = {
      enabled: true,
      thresholdDb: -20,
      ratio: 4,
      attackMs: 10,
      releaseMs: 200,
      makeupDb: 0,
    };

    const [comp] = compPlugin.buildPreviewNodes(
      createFakeAudioContext(),
      editList,
    ) as unknown as [FakeCompressorNode];

    expect(comp.threshold.value).toBe(-20);
    expect(comp.ratio.value).toBe(4);
    expect(comp.attack.value).toBe(0.01);
    expect(comp.release.value).toBe(0.2);
  });

  it('omits the makeup-gain node when makeupDb is 0', () => {
    const editList = createDefaultEditList(180);
    editList.comp = { ...editList.comp, enabled: true, makeupDb: 0 };

    const nodes = compPlugin.buildPreviewNodes(
      createFakeAudioContext(),
      editList,
    );

    expect(nodes).toHaveLength(1);
  });

  it('appends a makeup-gain node converting dB to a linear multiplier', () => {
    const editList = createDefaultEditList(180);
    editList.comp = { ...editList.comp, enabled: true, makeupDb: 6 };

    const nodes = compPlugin.buildPreviewNodes(
      createFakeAudioContext(),
      editList,
    ) as unknown as [FakeCompressorNode, FakeGainNode];

    expect(nodes).toHaveLength(2);
    expect(nodes[1]!.gain.value).toBeCloseTo(10 ** (6 / 20));
  });
});
