import { XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, Card, CardGrid } from '@nuclearplayer/ui';

import { radioStation, radioStationPlayable } from '../content/radioStations';
import { useListenerWidgetsStore } from '../stores/listenerWidgetsStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { FavoritesView } from '../views/FavoritesView';
import { ListenerWidgetEmbed } from './ListenerWidgetEmbed';
import { RemoveWidgetDialog } from './RemoveWidgetDialog';

type PendingRemoval =
  | { kind: 'instance'; id: string; label: string }
  | { kind: 'station'; id: string; label: string };

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
  const toggleStation = useListenerWidgetsStore((s) => s.toggleStation);
  const play = usePlayerStore((s) => s.play);
  const openSettings = useSettingsModalStore((s) => s.open);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null,
  );

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

  // Only takes the widget off the dashboard — a station's overrides and an
  // instance's saved input/label live in the store keyed by id, untouched
  // by this, so re-adding restores prior settings.
  const confirmRemoval = () => {
    if (!pendingRemoval) {
      return;
    }
    if (pendingRemoval.kind === 'instance') {
      removeInstance(pendingRemoval.id);
    } else {
      toggleStation(pendingRemoval.id);
    }
    setPendingRemoval(null);
  };

  return (
    <section className="mb-6 flex w-full flex-col gap-3">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Radio channels</h2>
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
            <div key={station.id} className="group relative w-fit">
              <Button
                size="icon-sm"
                variant="text"
                aria-label={`Remove ${station.name}`}
                onClick={() =>
                  setPendingRemoval({
                    kind: 'station',
                    id: station.id,
                    label: station.name,
                  })
                }
                className="bg-background/80 hover:bg-background absolute top-1 right-1 z-10 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <XIcon size={14} aria-hidden />
              </Button>
              <Card
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
            </div>
          ))}
        </CardGrid>
      )}

      {instances.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {instances.map((instance) => (
            <ListenerWidgetEmbed
              key={instance.id}
              instance={instance}
              onRemove={() =>
                setPendingRemoval({
                  kind: 'instance',
                  id: instance.id,
                  label: instance.label,
                })
              }
            />
          ))}
        </div>
      )}

      {favoritesEnabled ? <FavoritesView /> : null}

      <RemoveWidgetDialog
        isOpen={pendingRemoval != null}
        label={pendingRemoval?.label ?? ''}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={confirmRemoval}
      />
    </section>
  );
}
