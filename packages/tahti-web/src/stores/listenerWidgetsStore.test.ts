// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { useListenerWidgetsStore } from './listenerWidgetsStore';

describe('listener widgets store', () => {
  beforeEach(() => {
    localStorage.clear();
    useListenerWidgetsStore.setState({
      installedTypeIds: [],
      instances: [],
      enabledStationIds: [],
      stationOverrides: {},
    });
  });

  it('uninstalling a type removes its embeds from Listen', () => {
    const store = useListenerWidgetsStore.getState();
    store.installType('youtube');
    store.addInstance(
      'youtube',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'YouTube',
    );
    store.addInstance(
      'spotify',
      'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6',
      'Spotify',
    );

    useListenerWidgetsStore.getState().uninstallType('youtube');

    const next = useListenerWidgetsStore.getState();
    expect(next.installedTypeIds).not.toContain('youtube');
    expect(next.instances.map((instance) => instance.typeId)).toEqual([
      'spotify',
    ]);
  });

  it('favorites install and uninstall do not touch other embeds', () => {
    const store = useListenerWidgetsStore.getState();
    store.installType('favorites');
    store.installType('bandcamp');
    store.addInstance(
      'bandcamp',
      'https://bandcamp.com/EmbeddedPlayer/album=1234567890/size=large/',
      'Bandcamp',
    );

    useListenerWidgetsStore.getState().uninstallType('favorites');

    const next = useListenerWidgetsStore.getState();
    expect(next.installedTypeIds).toEqual(['bandcamp']);
    expect(next.instances).toHaveLength(1);
  });
});
