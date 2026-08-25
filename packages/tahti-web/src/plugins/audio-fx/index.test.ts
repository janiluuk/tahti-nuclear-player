import { describe, expect, it } from 'vitest';

import type { ProEditorPluginId } from '../../api/studio-types';
import { ALL_PLUGIN_IDS, AUDIO_FX_PLUGINS, audioFxPlugins } from './index';

const EXPECTED_IDS: ProEditorPluginId[] = ['eq', 'comp', 'limiter', 'filter'];

describe('audio-fx registry', () => {
  it('ALL_PLUGIN_IDS matches the registered plugins, in order', () => {
    expect(ALL_PLUGIN_IDS).toEqual(EXPECTED_IDS);
  });

  it('AUDIO_FX_PLUGINS has exactly one entry per registered plugin', () => {
    expect(Object.keys(AUDIO_FX_PLUGINS).sort()).toEqual(
      [...EXPECTED_IDS].sort(),
    );
    for (const id of EXPECTED_IDS) {
      expect(AUDIO_FX_PLUGINS[id].id).toBe(id);
    }
  });

  it('every plugin exposes complete tile metadata', () => {
    for (const plugin of audioFxPlugins) {
      expect(plugin.label).toBeTruthy();
      expect(plugin.description).toBeTruthy();
      expect(plugin.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(plugin.icon).toBeTruthy();
    }
  });
});
