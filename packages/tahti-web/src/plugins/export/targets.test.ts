import { describe, expect, it } from 'vitest';

import { EXPORT_TARGETS } from './targets';

describe('EXPORT_TARGETS', () => {
  it('has a unique id for every target', () => {
    const ids = EXPORT_TARGETS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every target has a non-empty label, note, and deep-link path', () => {
    for (const target of EXPORT_TARGETS) {
      expect(target.label).toBeTruthy();
      expect(target.note).toBeTruthy();
      expect(target.to.startsWith('/')).toBe(true);
    }
  });

  it('every Revelator-delivered target points at the distribution screen', () => {
    const revelatorTargets = EXPORT_TARGETS.filter((t) =>
      t.note.includes('Revelator'),
    );
    expect(revelatorTargets.length).toBeGreaterThan(0);
    for (const target of revelatorTargets) {
      expect(target.to).toBe('/studio/distribution');
    }
  });
});
