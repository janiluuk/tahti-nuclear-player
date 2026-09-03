import { XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, Card, CardGrid } from '@tahti-player/ui';

import { radioStation, radioStationPlayable } from '../content/radioStations';
import {
  NEWS_WIDGET_TYPE_ID,
  newsWidgetsOn,
  useListenerWidgetsStore,
} from '../stores/listenerWidgetsStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { FavoritesView } from '../views/FavoritesView';
import { ListenerWidgetEmbed } from './ListenerWidgetEmbed';
import { NewsFeedWidget } from './NewsFeedWidget';
import { RadioStationCoverEditButton } from './RadioStationCover';
import { RemoveWidgetDialog } from './RemoveWidgetDialog';

type PendingRemoval =
  | { kind: 'instance'; id: string; label: string }
  | { kind: 'station'; id: string; label: string }
  | { kind: 'browser'; id: string; label: string };

/** Listen-page add-ons (Settings → Add-ons). Stations = CardGrid+Card;
 * embeds stay a non-Card iframe grid. Renders nothing when empty. */
export function ListenerWidgetsSection() {
  const instances = useListenerWidgetsStore((s) => s.instances);
  const installedTypeIds = useListenerWidgetsStore((s) => s.installedTypeIds);
  const enabledStationIds = useListenerWidgetsStore((s) => s.enabledStationIds);
  const stationOverrides = useListenerWidgetsStore((s) => s.stationOverrides);
  const savedBrowserStations = useListenerWidgetsStore(
    (s) => s.savedBrowserStations,
  );
  const removeInstance = useListenerWidgetsStore((s) => s.removeInstance);
  const toggleStation = useListenerWidgetsStore((s) => s.toggleStation);
  const removeSavedBrowserStation = useListenerWidgetsStore(
    (s) => s.removeSavedBrowserStation,
  );
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

  const embedInstances = instances.filter(
    (instance) => instance.typeId !== NEWS_WIDGET_TYPE_ID,
  );
  const newsFeeds = newsWidgetsOn(instances, 'listen');
  const favoritesEnabled = installedTypeIds.includes('favorites');
  const hasListenAddons =
    embedInstances.length > 0 || favoritesEnabled || newsFeeds.length > 0;

  if (
    embedInstances.length === 0 &&
    enabledStations.length === 0 &&
    savedBrowserStations.length === 0 &&
    !favoritesEnabled &&
    newsFeeds.length === 0
  ) {
    return null;
  }

  const confirmRemoval = () => {
    if (!pendingRemoval) {
      return;
    }
    if (pendingRemoval.kind === 'instance') {
      removeInstance(pendingRemoval.id);
    } else if (pendingRemoval.kind === 'browser') {
      removeSavedBrowserStation(pendingRemoval.id);
    } else {
      toggleStation(pendingRemoval.id);
    }
    setPendingRemoval(null);
  };

  return (
    <section
      className="mb-6 flex w-full flex-col gap-3"
      data-testid="listener-widgets-section"
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">
          {hasListenAddons ? 'Listen add-ons' : 'Radio channels'}
        </h2>
        <button
          type="button"
          onClick={() => openSettings('plugin-store', 'listen')}
          className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
        >
          Manage widgets
        </button>
      </div>

      {enabledStations.length > 0 && (
        <CardGrid>
          {enabledStations.map((station) => (
            <div key={station.id} className="group relative w-fit">
              <RadioStationCoverEditButton
                label={station.name}
                stationName={station.name}
                catalogStationId={station.id}
                className="absolute top-3 left-3 z-10 rounded-full"
              />
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

      {savedBrowserStations.length > 0 && (
        <CardGrid>
          {savedBrowserStations.map((station) => (
            <div key={station.id} className="group relative w-fit">
              <Button
                size="icon-sm"
                variant="text"
                aria-label={`Remove ${station.name}`}
                onClick={() =>
                  setPendingRemoval({
                    kind: 'browser',
                    id: station.id,
                    label: station.name,
                  })
                }
                className="bg-background/80 hover:bg-background absolute top-1 right-1 z-10 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <XIcon size={14} aria-hidden />
              </Button>
              <Card
                src={station.favicon}
                title={station.name}
                subtitle={station.country ?? 'Internet radio'}
                playLabel="Play"
                onPlay={() =>
                  play({
                    id: `radio:${station.id}`,
                    kind: 'radio',
                    title: station.name,
                    artist: station.country ?? 'Internet radio',
                    coverUrl: station.favicon,
                    streamUrl: station.streamUrl,
                    protocol: 'https',
                    sourceProvider: 'radio',
                  })
                }
              />
            </div>
          ))}
        </CardGrid>
      )}

      {newsFeeds.length > 0 && (
        <div className="flex flex-col gap-4">
          {newsFeeds.map((instance) => (
            <NewsFeedWidget
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

      {embedInstances.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {embedInstances.map((instance) => (
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

      {favoritesEnabled ? <FavoritesView embedded /> : null}

      <RemoveWidgetDialog
        isOpen={pendingRemoval != null}
        label={pendingRemoval?.label ?? ''}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={confirmRemoval}
      />
    </section>
  );
}
