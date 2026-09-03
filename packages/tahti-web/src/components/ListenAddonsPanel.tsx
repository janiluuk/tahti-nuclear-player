import { Heart, SettingsIcon, Youtube } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button, Input, PluginStoreItem, Tabs } from '@tahti-player/ui';

import { fetchMeProfile, patchMeProfile } from '../api/studio-extras';
import {
  LISTENER_WIDGET_TYPES,
  resolveListenerWidgetInput,
  soundcloudProfileUrl,
} from '../content/listenerWidgets';
import { cn } from '../lib/cn';
import { useListenerWidgetsStore } from '../stores/listenerWidgetsStore';
import { ListenerWidgetEmbed } from './ListenerWidgetEmbed';
import { SourceServiceIcon } from './SourceServiceIcon';

function ConfigurableCard({
  header,
  children,
  title,
  open,
  onOpenChange,
  className,
}: {
  header: ReactNode | ((open: () => void) => ReactNode);
  children: ReactNode;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {typeof header === 'function'
            ? header(() => onOpenChange(true))
            : header}
        </div>
        <Button
          size="icon-sm"
          variant="secondary"
          onClick={() => onOpenChange(!open)}
          aria-label={
            open ? `Hide ${title} configuration` : `Configure ${title}`
          }
          title={open ? 'Hide configuration' : 'Configure'}
        >
          <SettingsIcon size={15} aria-hidden />
        </Button>
      </div>
      {open ? (
        <div
          className="border-border flex flex-col gap-4 rounded-md border p-3"
          data-testid={`listen-addon-config-${title}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function listenAddonIcon(typeId: string): ReactNode {
  if (typeId === 'favorites') {
    return <Heart className="size-6" aria-hidden />;
  }
  if (typeId === 'youtube') {
    return <Youtube className="size-6" aria-hidden />;
  }
  if (
    typeId === 'soundcloud' ||
    typeId === 'spotify' ||
    typeId === 'hearthis' ||
    typeId === 'bandcamp'
  ) {
    return <SourceServiceIcon id={typeId} />;
  }
  return undefined;
}

export function ListenAddonsPanel({
  initialTab = 'installed',
  compact = false,
}: {
  initialTab?: 'installed' | 'available';
  compact?: boolean;
}) {
  const [installTab, setInstallTab] = useState<'installed' | 'available'>(
    initialTab,
  );
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const installedTypeIds = useListenerWidgetsStore((s) => s.installedTypeIds);
  const instances = useListenerWidgetsStore((s) => s.instances);
  const installType = useListenerWidgetsStore((s) => s.installType);
  const uninstallType = useListenerWidgetsStore((s) => s.uninstallType);
  const addInstance = useListenerWidgetsStore((s) => s.addInstance);
  const removeInstance = useListenerWidgetsStore((s) => s.removeInstance);
  const [inputByType, setInputByType] = useState<Record<string, string>>({});
  const [errorByType, setErrorByType] = useState<Record<string, string>>({});
  const [soundcloudProfile, setSoundcloudProfile] = useState('');
  const [soundcloudProfileLoading, setSoundcloudProfileLoading] =
    useState(true);
  const [savingSoundcloudProfile, setSavingSoundcloudProfile] = useState(false);

  useEffect(() => {
    void fetchMeProfile()
      .then((profile) => {
        const accountLink = profile.data.socialLinks?.soundcloud ?? '';
        setSoundcloudProfile(soundcloudProfileUrl(accountLink) ?? accountLink);
      })
      .catch(() => undefined)
      .finally(() => {
        setSoundcloudProfileLoading(false);
      });
  }, []);

  const handleInstall = (typeId: string) => {
    installType(typeId);
    setInstallTab('installed');
    setConfiguringId(typeId);
  };

  const handleUninstall = (typeId: string) => {
    uninstallType(typeId);
    setConfiguringId((current) => (current === typeId ? null : current));
    setErrorByType((prev) => {
      const next = { ...prev };
      delete next[typeId];
      return next;
    });
  };

  const addWidgetInstance = async (typeId: string, label: string) => {
    const rawInput =
      inputByType[typeId] ?? (typeId === 'soundcloud' ? soundcloudProfile : '');
    const resolved = resolveListenerWidgetInput(typeId, rawInput);
    if (!resolved.ok) {
      setErrorByType((prev) => ({ ...prev, [typeId]: resolved.error }));
      return;
    }

    if (resolved.saveSoundcloudProfile) {
      setSavingSoundcloudProfile(true);
      setErrorByType((prev) => {
        const next = { ...prev };
        delete next.soundcloud;
        return next;
      });
      try {
        const profile = await fetchMeProfile();
        const saved = await patchMeProfile({
          socialLinks: {
            ...(profile.data.socialLinks ?? {}),
            soundcloud: resolved.input,
          },
        });
        if (!saved.ok) {
          setErrorByType((prev) => ({ ...prev, soundcloud: saved.error }));
          return;
        }
        setSoundcloudProfile(resolved.input);
      } catch {
        setErrorByType((prev) => ({
          ...prev,
          soundcloud: 'Could not save your SoundCloud profile. Try again.',
        }));
        return;
      } finally {
        setSavingSoundcloudProfile(false);
      }
    }

    addInstance(typeId, resolved.input, label);
    setInputByType((prev) => ({
      ...prev,
      [typeId]: typeId === 'soundcloud' ? resolved.input : '',
    }));
    setErrorByType((prev) => {
      const next = { ...prev };
      delete next[typeId];
      return next;
    });
  };

  const favoritesInstalled = installedTypeIds.includes('favorites');
  const installedCount =
    (favoritesInstalled ? 1 : 0) +
    LISTENER_WIDGET_TYPES.filter((type) => installedTypeIds.includes(type.id))
      .length;
  const availableCount = LISTENER_WIDGET_TYPES.length + 1 - installedCount;
  const listClassName = compact
    ? 'grid gap-3 sm:grid-cols-2'
    : 'flex flex-col gap-3';

  return (
    <div className="flex flex-col gap-3">
      <Tabs.Root
        selectedIndex={installTab === 'installed' ? 0 : 1}
        onChange={(index) =>
          setInstallTab(index === 0 ? 'installed' : 'available')
        }
      >
        <Tabs.List>
          <Tabs.Tab>Installed ({installedCount})</Tabs.Tab>
          <Tabs.Tab>Available ({availableCount})</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
      <div className={listClassName}>
        {favoritesInstalled === (installTab === 'installed') && (
          <ConfigurableCard
            title="Favorites"
            open={configuringId === 'favorites'}
            onOpenChange={(open) => setConfiguringId(open ? 'favorites' : null)}
            className={
              compact && configuringId === 'favorites'
                ? 'sm:col-span-2'
                : undefined
            }
            header={
              <PluginStoreItem
                icon={listenAddonIcon('favorites')}
                name="Favorites"
                author="Tahti"
                description="Show your favorite channels and tracks as a section on Listen."
                category="Listen"
                isInstalled={favoritesInstalled}
                onInstall={() => handleInstall('favorites')}
              />
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-foreground-secondary text-sm">
                Enabled favorites appear on the Listen page.
              </p>
              <Button
                size="sm"
                variant="text"
                onClick={() => handleUninstall('favorites')}
              >
                Uninstall
              </Button>
            </div>
          </ConfigurableCard>
        )}
        {LISTENER_WIDGET_TYPES.filter(
          (type) =>
            installedTypeIds.includes(type.id) === (installTab === 'installed'),
        ).map((type) => {
          const isInstalled = installedTypeIds.includes(type.id);
          const typeInstances = instances.filter((i) => i.typeId === type.id);
          return (
            <ConfigurableCard
              key={type.id}
              title={type.name}
              open={configuringId === type.id}
              onOpenChange={(open) => setConfiguringId(open ? type.id : null)}
              className={
                compact && configuringId === type.id
                  ? 'sm:col-span-2'
                  : undefined
              }
              header={
                <PluginStoreItem
                  icon={listenAddonIcon(type.id)}
                  name={type.name}
                  author={type.author}
                  description={type.description}
                  category={type.category}
                  isInstalled={isInstalled}
                  onInstall={() => handleInstall(type.id)}
                />
              }
            >
              {isInstalled ? (
                <div className="flex flex-col gap-3">
                  {typeInstances.map((instance) => (
                    <ListenerWidgetEmbed
                      key={instance.id}
                      instance={instance}
                      onRemove={() => removeInstance(instance.id)}
                    />
                  ))}
                  <form
                    className="flex flex-wrap items-end gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void addWidgetInstance(type.id, type.name);
                    }}
                  >
                    <Input
                      label={`Add a ${type.name} link`}
                      value={
                        inputByType[type.id] ??
                        (type.id === 'soundcloud' ? soundcloudProfile : '')
                      }
                      onChange={(event) => {
                        setErrorByType((prev) => {
                          const next = { ...prev };
                          delete next[type.id];
                          return next;
                        });
                        setInputByType((prev) => ({
                          ...prev,
                          [type.id]: event.target.value,
                        }));
                      }}
                      placeholder={type.placeholder}
                      className="min-w-[18rem] flex-1"
                      required
                      disabled={
                        type.id === 'soundcloud' &&
                        (soundcloudProfileLoading || savingSoundcloudProfile)
                      }
                    />
                    <Button
                      size="sm"
                      type="submit"
                      disabled={
                        (type.id === 'soundcloud' &&
                          (soundcloudProfileLoading ||
                            savingSoundcloudProfile)) ||
                        !(
                          inputByType[type.id] ??
                          (type.id === 'soundcloud' ? soundcloudProfile : '')
                        ).trim()
                      }
                    >
                      {type.id === 'soundcloud' && savingSoundcloudProfile
                        ? 'Saving…'
                        : 'Add'}
                    </Button>
                  </form>
                  {errorByType[type.id] ? (
                    <p className="text-destructive text-xs" role="alert">
                      {errorByType[type.id]}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <p className="text-foreground-secondary text-xs">
                      {type.helpText}
                    </p>
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => handleUninstall(type.id)}
                    >
                      Uninstall
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground-secondary text-sm">
                  Install this add-on to add and manage embeds.
                </p>
              )}
            </ConfigurableCard>
          );
        })}
      </div>
      {installTab === 'installed' && installedCount === 0 ? (
        <p className="text-foreground-secondary text-sm">
          Nothing installed yet — check Available.
        </p>
      ) : null}
      {installTab === 'available' && availableCount === 0 ? (
        <p className="text-foreground-secondary text-sm">
          Everything here is installed.
        </p>
      ) : null}
    </div>
  );
}
