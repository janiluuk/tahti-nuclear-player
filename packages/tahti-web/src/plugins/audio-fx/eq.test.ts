import { describe, expect, it } from 'vitest';

import { createDefaultEditList } from '../../api/studio-types';
import { eqPlugin } from './eq';
import { createFakeAudioContext } from './testAudioContext';

describe('eqPlugin', () => {
  it('is enabled iff editList.eq.enabled', () => {
    const editList = createDefaultEditList(180);
    expect(eqPlugin.isEnabled(editList)).toBe(false);
    expect(
      eqPlugin.isEnabled({
        ...editList,
        eq: { ...editList.eq, enabled: true },
      }),
    ).toBe(true);
  });

  it('builds one peaking BiquadFilterNode per band, with matching params', () => {
    const editList = createDefaultEditList(180);
    const nodes = eqPlugin.buildPreviewNodes(
      createFakeAudioContext(),
      editList,
    ) as unknown as {
      type: BiquadFilterType;
      frequency: { value: number };
      Q: { value: number };
      gain: { value: number };
    }[];

    expect(nodes).toHaveLength(editList.eq.bands.length);
    nodes.forEach((node, i) => {
      const band = editList.eq.bands[i]!;
      expect(node.type).toBe('peaking');
      expect(node.frequency.value).toBe(band.freq);
      expect(node.Q.value).toBe(band.q);
      expect(node.gain.value).toBe(band.gainDb);
    });
  });
});
