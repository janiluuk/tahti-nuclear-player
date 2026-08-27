import { Card, CardGrid } from '@nuclearplayer/ui';

import { radioStation, radioStationPlayable } from '../content/radioStations';
import { useListenerWidgetsStore } from '../stores/listenerWidgetsStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { FavoritesView } from '../views/FavoritesView';
import { ListenerWidgetEmbed } from './ListenerWidgetEmbed';

/** Renders the listener's enabled SoundCloud/YouTube embeds and internet
 * radio stations on the Listen page — see Settings > Add-ons (Radio /
 * Embed categories), where they're installed/enabled. Renders nothing if
 * the listener hasn't enabled anything, so it never clutters the page for
 * people who don't use this feature. */
export function ListenerWidgetsSection() {
  const instances = useListenerWidgetsStore((s) => s.instances);
  const installedTypeIds = useListenerWidgetsStore((s) => s.installedTypeIds);
  const enabledStationIds = useListenerWidgetsStore((s) => s.enabledStationIds);
  const stationOverrides = useListenerWidgetsStore((s) => s.stationOverrides);
  const removeInstance = useListenerWidgetsStore((s) => s.removeInstance);
  const play = usePlayerStore((s) => s.play);
  const openSettings = useSettingsModalStore((s) => s.open);

  const enabledStations = enabledStationIds
    .map((id) => {
      const station = radioStation(id);
      return station ? { ...station, ...stationOverrides[id] } : undefined;
    })
    .filter((s) => s != null);

  const favoritesEnabled = installedTypeIds.includes('favorites');

  if (
    instances.length === 0 &&
    enabledStations.length === 0 &&
    !favoritesEnabled
  ) {
    return null;
  }

  return (
    <section className="mb-6 flex w-full flex-col gap-3">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Your widgets</h2>
        <button
          type="button"
          onClick={() => openSettings('plugin-store')}
          className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
        >
          Manage widgets
        </button>
      </div>

      {enabledStations.length > 0 && (
        <CardGrid>
          {enabledStations.map((station) => (
            <Card
              key={station.id}
              src={station.logoUrl}
              title={station.name}
              subtitle={`${station.language} · ${station.bitrateKbps}kbps`}
              playLabel={station.streamUrl ? 'Play' : 'Stream pending'}
              playDisabled={!station.streamUrl}
              onPlay={
                station.streamUrl
                  ? () =>
                      play(
                        radioStationPlayable({
                          ...station,
                          streamUrl: station.streamUrl!,
                        }),
                      )
                  : undefined
              }
            />
          ))}
        </CardGrid>
      )}

      {instances.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {instances.map((instance) => (
            <ListenerWidgetEmbed
              key={instance.id}
              instance={instance}
              onRemove={() => removeInstance(instance.id)}
            />
          ))}
        </div>
      )}

      {favoritesEnabled ? <FavoritesView /> : null}
    </section>
  );
}
