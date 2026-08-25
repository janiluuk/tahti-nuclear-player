import { describe, expect, it } from 'vitest';

import { createDefaultEditList } from '../../api/studio-types';
import { filterPlugin } from './filter';
import { createFakeAudioContext } from './testAudioContext';

type FakeBiquadNode = {
  type: BiquadFilterType;
  frequency: { value: number };
};

describe('filterPlugin', () => {
  it('is enabled iff editList.filter.enabled', () => {
    const editList = createDefaultEditList(180);
    expect(filterPlugin.isEnabled(editList)).toBe(false);
    expect(
      filterPlugin.isEnabled({
        ...editList,
        filter: { ...editList.filter, enabled: true },
      }),
    ).toBe(true);
  });

  it('carries the chosen mode and frequency onto the filter node', () => {
    const editList = createDefaultEditList(180);
    editList.filter = {
      enabled: true,
      mode: 'lowshelf',
      freq: 120,
      slope: '24db',
    };

    const [node] = filterPlugin.buildPreviewNodes(
      createFakeAudioContext(),
      editList,
    ) as unknown as [FakeBiquadNode];

    expect(node.type).toBe('lowshelf');
    expect(node.frequency.value).toBe(120);
  });
});
