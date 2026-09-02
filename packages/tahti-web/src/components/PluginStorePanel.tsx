import { Link, useNavigate } from '@tanstack/react-router';
import {
  Cast,
  CheckCircle2Icon,
  CheckSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  Eye,
  FolderDownIcon,
  InfoIcon,
  Link2Icon,
  PauseIcon,
  PlayIcon,
  PlusCircleIcon,
  Radio as RadioIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Badge,
  Box,
  Button,
  Dialog,
  FavoriteButton,
  Input,
  MediaArtwork,
  PluginItem,
  PluginStoreItem,
  Select,
  Slider,
  Tabs,
} from '@tahti-player/ui';

import {
  createRtmpTarget,
  deleteRtmpTarget,
  fetchRtmpTargets,
  patchRtmpTarget,
  type RtmpTarget,
} from '../api/broadcast';
import {
  DEFAULT_VISUAL_PRESET_SETTINGS,
  fetchChannelVisual,
  parseVisualSettingsMap,
  patchChannelVisual,
  resolveVisualPresetSettings,
  VISUAL_PRESETS,
  type VisualPresetSettings,
  type VisualSettingsMap,
} from '../api/channel-design';
import {
  fetchSpotifyArtistProfile,
  linkSpotifyArtistProfile,
  unlinkSpotifyArtistProfile,
} from '../api/distribution';
import {
  COMMON_STATIONS,
  fetchCountryList,
  fetchStationCount,
  fetchTagList,
  lookupStationByUrl,
  playableFromRadioStation,
  readIcyStreamTitle,
  resolveStreamUrl,
  searchStations,
  searchStationsByName,
  testRadioStream,
  type RadioStation as PublicRadioStation,
  type RadioBrowserCountry,
  type RadioBrowserTag,
  type RadioStreamTestResult,
} from '../api/radio-sources';
import {
  disconnectIntegration,
  fetchBandcampAlbums,
  fetchConnectionStatus,
  fetchHearthisCollectionTracks,
  fetchHearthisLibrary,
  fetchSoundcloudTracks,
  importBandcampAlbum,
  importHearthisTracks,
  importSoundcloudTracks,
  importSpotifyTracks,
  oauthStartUrl,
  playableFromHearthis,
  searchHearthisTracks,
  searchSpotifyTracks,
  type BandcampAlbum,
  type HearthisLibrary,
  type HearthisTrack,
  type IntegrationId,
  type SoundcloudTrack,
  type SpotifySearchTrack,
} from '../api/sources';
import {
  createStudioCollection,
  fetchStudioCollections,
  patchStudioCollection,
} from '../api/studio';
import { fetchMeProfile, patchMeProfile } from '../api/studio-extras';
import type {
  SpotifyArtistProfile,
  StudioCollection,
} from '../api/studio-types';
import {
  LISTENER_WIDGET_TYPES,
  soundcloudProfileUrl,
} from '../content/listenerWidgets';
import {
  PLUGIN_CATEGORIES,
  type PluginCategoryId,
} from '../content/pluginStoreCategories';
import {
  RADIO_STATIONS,
  radioStationPlayable,
  type RadioStation,
} from '../content/radioStations';
import {
  ALL_PLUGIN_IDS,
  AUDIO_FX_PLUGINS,
  useAudioFxStore,
} from '../plugins/audio-fx';
import { EXPORT_TARGETS } from '../plugins/export';
import { importSourcePlugins } from '../plugins/import-sources';
import { useMasteringFeatureStore } from '../plugins/mastering/store';
import {
  multicastProviderLabel,
  multicastProviders,
  type MulticastProviderId,
} from '../plugins/multicast';
import { useThemeStore } from '../plugins/themes';
import {
  visualizerMetadata,
  visualizerSupportsAudioReactive,
} from '../plugins/visualizers';
import { useAuthStore } from '../stores/authStore';
import {
  ALL_WIDGET_IDS,
  useDiscoverStore,
  type DiscoverWidgetId,
} from '../stores/discoverStore';
import { useLibraryStore } from '../stores/libraryStore';
import { useListenerWidgetsStore } from '../stores/listenerWidgetsStore';
import { usePlayerStore } from '../stores/playerStore';
import { usePluginInstallStore } from '../stores/pluginInstallStore';
import { useRadioBrowserStore } from '../stores/radioBrowserStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { ChannelVisualizer } from './ChannelVisualizer';
import { DiscoWidgetManagerPanel } from './disco-widgets/DiscoWidgetManagerPanel';
import { ListenerWidgetEmbed } from './ListenerWidgetEmbed';
import { PageLoading } from './PageStates';
import { RoundImageUploadButton } from './RoundImageUploadButton';
import { SourceServiceIcon } from './SourceServiceIcon';
import { ThemeVisualizationSettings } from './ThemeVisualizationSettings';

function visualizerDescription(id: string): string {
  return visualizerMetadata(id).description;
}

const IMPORT_SOURCE_KINDS = new Set(['oauth', 'search', 'tool']);

/** Fold-out shell shared by every configurable plugin card: a gear toggle
 * next to the card that reveals an inline settings form below it (tabs
 * inside `children` when there's enough to configure to warrant them —
 * see VisualizersCategory). Every plugin gets one — nothing in this store
 * navigates away to configure itself. `header` can be a render prop when
 * the card's own primary button should also open the same panel as the
 * gear (e.g. a "Configure" button rather than an unrelated action). */
function ConfigurableCard({
  header,
  children,
  title,
  defaultOpen = false,
  dialogClassName = 'max-w-lg',
}: {
  header: React.ReactNode | ((open: () => void) => React.ReactNode);
  children: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  /** Override the Dialog's width for plugins with more to configure than a
   * small popup can comfortably hold (e.g. HearthisCard's library browser). */
  dialogClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {typeof header === 'function' ? header(() => setOpen(true)) : header}
        </div>
        <Button
          size="icon-sm"
          variant="secondary"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Hide configuration' : 'Configure'}
          title={open ? 'Hide configuration' : 'Configure'}
        >
          <SettingsIcon size={15} aria-hidden />
        </Button>
      </div>
      <Dialog.Root
        isOpen={open}
        onClose={() => setOpen(false)}
        className={dialogClassName}
      >
        <Dialog.Title>Configure {title}</Dialog.Title>
        <Dialog.Description>
          Changes are saved for this add-on.
        </Dialog.Description>
        <div className="mt-4 flex flex-col gap-4">{children}</div>
        <Dialog.Actions>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Root>
    </div>
  );
}

/** Splits a category's plugin list into "Installed" / "Available" tabs.
 * Install state comes from usePluginInstallStore, which each card writes
 * to once it knows its own real status (connected/configured/enabled) —
 * an id this store has never heard from defaults to "Available", same as
 * a plugin with no install concept at all (e.g. a plain distribution
 * deep-link). */
function InstalledAvailableTabs({
  ids,
  renderItem,
  emptyInstalled = 'Nothing installed yet — check Available below.',
  emptyAvailable = 'Everything here is installed.',
}: {
  ids: string[];
  renderItem: (id: string) => React.ReactNode;
  emptyInstalled?: string;
  emptyAvailable?: string;
}) {
  const installedMap = usePluginInstallStore((s) => s.installed);
  const [tab, setTab] = useState<'installed' | 'available'>('installed');
  const installedIds = ids.filter((id) => installedMap[id]);
  const availableIds = ids.filter((id) => !installedMap[id]);
  const visibleIds = tab === 'installed' ? installedIds : availableIds;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex gap-1"
        role="tablist"
        aria-label="Installed or available"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'installed'}
          onClick={() => setTab('installed')}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            tab === 'installed'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:bg-background-secondary'
          }`}
        >
          Installed ({installedIds.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'available'}
          onClick={() => setTab('available')}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            tab === 'available'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:bg-background-secondary'
          }`}
        >
          Available ({availableIds.length})
        </button>
      </div>
      {visibleIds.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          {tab === 'installed' ? emptyInstalled : emptyAvailable}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleIds.map((id) => renderItem(id))}
        </div>
      )}
    </div>
  );
}

/** Unified browser across the app's plugin-shaped subsystems — see
 * PLUGIN-STORE-PLAN.md for what actually turning each one into a real,
 * removable plugin would take. This view is the navigation/config layer
 * over the *existing* implementations, not a new plugin runtime: every
 * plugin configures inline, in its own gear-toggled dialog (real API
 * calls, not stubs) — nothing here navigates away to configure itself.
 *
 * Import/Export/Fingerprinting share one tagged registry (`SERVICE_PLUGINS`
 * below) so shared services can stay a single entry without duplicating
 * their configuration UI. */
export function PluginStorePanel() {
  const isOpen = useSettingsModalStore((s) => s.isOpen);
  const pluginCategory = useSettingsModalStore((s) => s.pluginCategory);
  const [category, setCategory] = useState<PluginCategoryId>('themes');

  // The modal (and this panel) stays mounted across close/open cycles, so
  // sync on every open in case the caller requested a specific sub-tab
  // (e.g. an OAuth callback redirect landing on Import — see
  // AddToMusicActions, router.tsx's sourcesRoute redirect).
  useEffect(() => {
    if (isOpen && pluginCategory) {
      setCategory(pluginCategory);
    }
  }, [isOpen, pluginCategory]);

  return (
    <Tabs
      vertical
      className="flex flex-col gap-4 sm:flex-row"
      listClassName="flex sm:flex-col gap-1 sm:w-48 shrink-0"
      panelClassName="min-w-0 flex-1"
      selectedIndex={PLUGIN_CATEGORIES.findIndex((c) => c.id === category)}
      onChange={(index) => setCategory(PLUGIN_CATEGORIES[index]!.id)}
      items={PLUGIN_CATEGORIES.map((c) => ({
        id: c.id,
        label: (
          <span className="flex items-center gap-2">
            <c.icon size={14} aria-hidden />
            {c.label}
          </span>
        ),
        content: <CategoryBody categoryId={c.id} />,
      }))}
    />
  );
}

function CategoryBody({ categoryId }: { categoryId: PluginCategoryId }) {
  const category = PLUGIN_CATEGORIES.find((c) => c.id === categoryId)!;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground-secondary text-sm">
          {category.description}
        </p>
        <Button
          size="icon-sm"
          variant="secondary"
          aria-label={`About ${category.label}`}
          title={`About ${category.label}`}
          aria-expanded={showInfo}
          onClick={() => setShowInfo((value) => !value)}
        >
          <InfoIcon size={16} aria-hidden />
        </Button>
      </div>
      {showInfo ? (
        <Box
          variant="tertiary"
          role="note"
          className="border-primary/40 bg-primary/10 flex-row items-start gap-2 py-3"
        >
          <InfoIcon
            className="text-primary mt-0.5 shrink-0"
            size={16}
            aria-hidden
          />
          <p className="text-foreground text-sm">
            <span className="font-semibold">{category.label}</span>{' '}
            {category.description}
          </p>
        </Box>
      ) : null}
      {categoryId === 'themes' && <ThemesCategory />}
      {categoryId === 'visualizers' && <VisualizersCategory />}
      {categoryId === 'export' && <DspUrlPasteCard />}
      {(categoryId === 'export' ||
        categoryId === 'import' ||
        categoryId === 'fingerprinting') && (
        <ServiceCategory categoryId={categoryId} />
      )}
      {categoryId === 'multicast' && <MulticastCategory />}
      {categoryId === 'audio-plugins' && <AudioPluginsCategory />}
      {categoryId === 'radio' && <RadioCategory />}
      {categoryId === 'listen' && <ListenCategory />}
      {categoryId === 'discovery' && <DiscoveryCategory />}
      {categoryId === 'channel' && <ChannelCategory />}
    </div>
  );
}

function ThemesCategory() {
  const themes = useThemeStore((s) => s.themes);
  const customThemes = useThemeStore((s) => s.customThemes);
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const all = [
    ...themes.map((t) => ({
      id: t.id,
      name: t.name,
      author: 'Tahti',
      palette: t.palette,
    })),
    ...Object.entries(customThemes).map(([id, t]) => ({
      id,
      name: t.name ?? 'Custom theme',
      author: 'Imported',
      palette: t.palette,
    })),
  ];

  const themeCard = (theme: (typeof all)[number]) => (
    <PluginStoreItem
      key={theme.id}
      name={theme.name}
      author={theme.author}
      icon={<ThemePalettePreview palette={theme.palette} />}
      description={theme.id === themeId ? 'Currently applied' : 'Available'}
      isInstalled={theme.id === themeId}
      onInstall={() => setTheme(theme.id)}
      labels={{ install: 'Apply', installed: 'Active' }}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {all.map((theme) =>
        theme.id === 'nuclear:tahti-dark' ? (
          <ConfigurableCard
            key={theme.id}
            title={theme.name}
            header={themeCard(theme)}
          >
            <ThemeVisualizationSettings />
          </ConfigurableCard>
        ) : (
          themeCard(theme)
        ),
      )}
      <p className="text-foreground-secondary text-xs">
        Full theme editor (colors, custom JSON import) is in{' '}
        <button
          type="button"
          className="underline underline-offset-2"
          onClick={() => useSettingsModalStore.getState().open('themes')}
        >
          Settings → Themes
        </button>
        .
      </p>
    </div>
  );
}

function ThemePalettePreview({ palette }: { palette?: readonly string[] }) {
  const colors = palette?.length
    ? palette
    : [
        'var(--primary)',
        'var(--background)',
        'var(--accent-purple)',
        'var(--foreground)',
      ];

  return (
    <div
      className="grid h-full w-full grid-cols-2 grid-rows-2"
      aria-label="Theme color preview"
    >
      {colors.slice(0, 4).map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="min-h-0 min-w-0"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function presetLabel(id: string): string {
  return id
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function VisualizersCategory() {
  const [preset, setPreset] = useState<string | null>(null);
  const [previewPreset, setPreviewPreset] = useState<string>('AURORA');
  const [settingsMap, setSettingsMap] = useState<VisualSettingsMap>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [configurationPreset, setConfigurationPreset] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void fetchChannelVisual().then((r) => {
      setPreset(r.data.visualPreset);
      setPreviewPreset(r.data.visualPreset);
      setSettingsMap(parseVisualSettingsMap(r.data.visualSettingsJson));
    });
  }, []);

  const usePreset = (id: string) => {
    setSaving(id);
    void patchChannelVisual({ visualPreset: id }).then((r) => {
      setSaving(null);
      if (r.ok) {
        setPreset(id);
      }
    });
  };

  const saveTuning = (id: string, next: VisualPresetSettings) => {
    const nextMap = { ...settingsMap, [id]: next };
    setSettingsMap(nextMap);
    void patchChannelVisual({ visualSettings: nextMap });
  };

  const previewSettings = resolveVisualPresetSettings(
    settingsMap,
    previewPreset,
  );
  const configurationSettings = configurationPreset
    ? resolveVisualPresetSettings(settingsMap, configurationPreset)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-background-secondary overflow-hidden rounded-lg border">
        <div className="relative h-64 min-h-52">
          {previewPreset === 'MINIMAL' ? (
            <div className="bg-background text-foreground-secondary flex h-full items-center justify-center text-sm">
              No animated background
            </div>
          ) : (
            <ChannelVisualizer
              preset={previewPreset}
              visualSettingsJson={JSON.stringify(settingsMap)}
              className="h-full w-full"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-white">
            <div>
              <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                {presetLabel(previewPreset)}
                {visualizerSupportsAudioReactive(previewPreset) ? (
                  <Badge variant="pill" color="blue">
                    Audio reactive
                  </Badge>
                ) : null}
              </p>
              <p className="text-xs text-white/75">
                {visualizerDescription(previewPreset)}
              </p>
            </div>
            <Eye size={18} aria-hidden />
          </div>
        </div>
        {visualizerSupportsAudioReactive(previewPreset) ? (
          <label className="border-border text-foreground-secondary flex items-center gap-2 border-t px-4 py-3 text-xs">
            <input
              type="checkbox"
              checked={previewSettings.audioReactive}
              onChange={(event) =>
                saveTuning(previewPreset, {
                  ...previewSettings,
                  audioReactive: event.target.checked,
                })
              }
            />
            <span>
              Audio reactivity
              <span className="text-foreground-tertiary ml-1">
                (let the visualizer respond to the playing track)
              </span>
            </span>
          </label>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {VISUAL_PRESETS.map((id) => {
          const active = preset === id;
          const selected = previewPreset === id;
          const metadata = visualizerMetadata(id);
          const Icon = metadata.Icon;
          return (
            <div
              key={id}
              className={`flex items-center gap-3 rounded-lg border p-3 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background-secondary'}`}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-pressed={selected}
                onClick={() => setPreviewPreset(id)}
              >
                <span className="bg-background text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                  <Icon size={18} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {presetLabel(id)}
                      {active ? ' · active' : ''}
                    </span>
                    {metadata.audioReactive ? (
                      <Badge variant="pill" color="blue">
                        Audio reactive
                      </Badge>
                    ) : null}
                  </span>
                  <span className="text-foreground-secondary block text-xs">
                    {metadata.description}
                  </span>
                </span>
              </button>
              {id !== 'MINIMAL' ? (
                <Button
                  size="icon-sm"
                  variant="secondary"
                  aria-label={`Configure ${presetLabel(id)}`}
                  title={`Configure ${presetLabel(id)}`}
                  onClick={() => {
                    setPreviewPreset(id);
                    setConfigurationPreset(id);
                  }}
                >
                  <SettingsIcon size={15} aria-hidden />
                </Button>
              ) : null}
              <Button
                size="sm"
                variant={active ? 'secondary' : 'default'}
                disabled={active || saving === id}
                onClick={() => usePreset(id)}
              >
                {saving === id ? 'Applying…' : active ? 'In use' : 'Use'}
              </Button>
            </div>
          );
        })}
      </div>

      {configurationPreset && configurationSettings ? (
        <Dialog.Root
          isOpen
          onClose={() => setConfigurationPreset(null)}
          className="max-w-lg"
        >
          <Dialog.Title>
            Configure {presetLabel(configurationPreset)}
          </Dialog.Title>
          <Dialog.Description>
            Tune this visualizer while its live preview stays visible behind the
            dialog.
          </Dialog.Description>
          <div className="flex flex-col gap-4">
            <div>
              <Slider
                label="Speed"
                min={0.25}
                max={2}
                step={0.05}
                value={configurationSettings.speed}
                showValue
                onValueChange={(value) =>
                  saveTuning(configurationPreset, {
                    ...configurationSettings,
                    speed: value,
                  })
                }
              >
                <Slider.Surface>
                  <Slider.Track />
                  <Slider.RangeInput />
                </Slider.Surface>
              </Slider>
              <p className="text-foreground-secondary mt-1 text-xs">
                Controls how quickly the shapes, particles, and camera movement
                evolve.
              </p>
            </div>
            <div>
              <Slider
                label="Intensity"
                min={0.25}
                max={2}
                step={0.05}
                value={configurationSettings.intensity}
                showValue
                onValueChange={(value) =>
                  saveTuning(configurationPreset, {
                    ...configurationSettings,
                    intensity: value,
                  })
                }
              >
                <Slider.Surface>
                  <Slider.Track />
                  <Slider.RangeInput />
                </Slider.Surface>
              </Slider>
              <p className="text-foreground-secondary mt-1 text-xs">
                Controls how strongly the scene responds to audio levels.
              </p>
            </div>
            <div>
              <Slider
                label="Scale"
                min={0.5}
                max={2}
                step={0.05}
                value={configurationSettings.scale}
                showValue
                onValueChange={(value) =>
                  saveTuning(configurationPreset, {
                    ...configurationSettings,
                    scale: value,
                  })
                }
              >
                <Slider.Surface>
                  <Slider.Track />
                  <Slider.RangeInput />
                </Slider.Surface>
              </Slider>
              <p className="text-foreground-secondary mt-1 text-xs">
                Grows or shrinks the whole scene.
              </p>
            </div>
            {visualizerSupportsAudioReactive(configurationPreset) ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={configurationSettings.audioReactive}
                  onChange={(event) =>
                    saveTuning(configurationPreset, {
                      ...configurationSettings,
                      audioReactive: event.target.checked,
                    })
                  }
                />
                <span>
                  Audio reactivity
                  <span className="text-foreground-secondary ml-1 text-xs">
                    (respond to the playing track, instead of a gentle idle
                    animation)
                  </span>
                </span>
              </label>
            ) : null}
            <Button
              size="sm"
              variant="text"
              className="self-start"
              onClick={() =>
                saveTuning(configurationPreset, DEFAULT_VISUAL_PRESET_SETTINGS)
              }
            >
              Reset to default
            </Button>
          </div>
          <Dialog.Actions>
            <Dialog.Close>Done</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Root>
      ) : null}
      <p className="text-foreground-secondary text-xs">
        Header style, color scheme, and enable/disable live in{' '}
        <button
          type="button"
          className="underline underline-offset-2"
          onClick={() => useSettingsModalStore.getState().open('channel')}
        >
          Settings → Channel &amp; design
        </button>
        .
      </p>
    </div>
  );
}

// ── Import / Export / Fingerprinting: one tagged registry ──────────────────

type ServiceAction =
  | { kind: 'deep-link'; to: string; label?: string }
  | {
      kind: 'oauth';
      integrationId: IntegrationId;
      oauthPath: string;
      instructionsHref?: string;
      instructionsLabel?: string;
    }
  | { kind: 'info' };

type ServicePlugin = {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: PluginCategoryId[];
  action: ServiceAction;
};

// 'url' and 'radio' are paste-a-link tools (capabilities.import: false —
// they seed a smart-link target / play a stream, not pull tracks into the
// archive), so they don't belong in this "services you can pull tracks and
// albums in from" list. They remain fully reachable from the Sources page.
const NON_IMPORT_TOOL_IDS = new Set<IntegrationId>(['url', 'radio']);

// Real "log in with the provider" links for the sources that have one —
// shown under the OAuth card's "Not connected yet" state. Google Drive
// omits one since almost every visitor already has a Google account.
const OAUTH_SOURCE_INSTRUCTIONS: Partial<
  Record<IntegrationId, { instructionsHref: string; instructionsLabel: string }>
> = {
  bandcamp: {
    instructionsHref: 'https://bandcamp.com/login',
    instructionsLabel: 'Log into Bandcamp',
  },
  soundcloud: {
    instructionsHref: 'https://soundcloud.com',
    instructionsLabel: 'Log into SoundCloud',
  },
  mixcloud: {
    instructionsHref: 'https://www.mixcloud.com',
    instructionsLabel: 'Log into Mixcloud',
  },
};

const IMPORT_SERVICE_PLUGINS: ServicePlugin[] = importSourcePlugins
  .filter(
    (s) =>
      IMPORT_SOURCE_KINDS.has(s.kind) &&
      s.id !== 'hearthis' &&
      !NON_IMPORT_TOOL_IDS.has(s.id),
  )
  .map((s) => ({
    id: s.id,
    name: s.name,
    author: s.kind === 'oauth' ? 'Connect' : 'Tool',
    description: s.description,
    tags: ['import'],
    // Every oauth-kind source configures inline (connect status, and for
    // Bandcamp/SoundCloud a real album/track picker) via OAuthServiceCard —
    // never a deep-link to the old per-source Sources page.
    action:
      s.kind === 'oauth'
        ? {
            kind: 'oauth' as const,
            integrationId: s.id,
            oauthPath: s.oauthStartPath ?? '',
            ...OAUTH_SOURCE_INSTRUCTIONS[s.id],
          }
        : {
            kind: 'deep-link' as const,
            to: s.studioDeepLink ?? `/sources/${s.id}`,
          },
  }));

// Bandcamp/SoundCloud/Mixcloud's export entries were just a "manage the
// connection under Sources" pointer to the same account already fully
// configurable from the Import card above — drop the duplicate rather than
// re-point it at the retired Sources deep-link. (hearthis has never shown
// here — it has its own Import-tagged plugin below.)
const EXPORT_SERVICE_PLUGINS: ServicePlugin[] = EXPORT_TARGETS.filter(
  (target) =>
    !['hearthis', 'bandcamp', 'soundcloud', 'mixcloud'].includes(target.id),
).map((t) => ({
  id: `export-${t.id}`,
  name: t.label,
  author: 'Tahti distribution',
  description: t.note,
  tags: ['export'],
  action: { kind: 'deep-link', to: t.to },
}));

// hearthis.at is an import source (see the file-level doc comment).
const HEARTHIS_PLUGIN: ServicePlugin = {
  id: 'hearthis',
  name: 'hearthis.at',
  author: 'Import',
  description:
    "Search hearthis.at's public catalogue to import tracks and sets.",
  tags: ['import'],
  // HearthisCard configures inline (ConfigurableCard) and ignores this
  // action entirely — see ServiceCard's id === 'hearthis' branch.
  action: { kind: 'info' },
};

const MUSICBRAINZ_PLUGIN: ServicePlugin = {
  id: 'musicbrainz',
  name: 'MusicBrainz',
  author: 'Connect',
  description:
    'Connect your MusicBrainz editor account so releases can be cross-referenced and registered under your identity.',
  tags: ['fingerprinting'],
  action: {
    kind: 'oauth',
    integrationId: 'musicbrainz',
    oauthPath: '/api/me/musicbrainz/oauth/start',
    instructionsHref: 'https://musicbrainz.org/register',
    instructionsLabel: 'Create a free MusicBrainz account',
  },
};

const ACOUSTID_PLUGIN: ServicePlugin = {
  id: 'acoustid',
  name: 'AcoustID',
  author: 'Built-in',
  description:
    'Matches uploaded tracks against AcoustID for catalog metadata — always on, no configuration needed.',
  tags: ['fingerprinting'],
  action: { kind: 'info' },
};

const SERVICE_PLUGINS: ServicePlugin[] = [
  ...IMPORT_SERVICE_PLUGINS,
  ...EXPORT_SERVICE_PLUGINS,
  HEARTHIS_PLUGIN,
  MUSICBRAINZ_PLUGIN,
  ACOUSTID_PLUGIN,
];

/** Paste a DSP URL (Spotify/Bandcamp/etc.) to seed a smart-link target on a
 * release — not a track/album import, so it doesn't belong in the Import
 * list above. Ported from the retired Sources page's `url` tab; the
 * "Open releases editor" action closes Add-ons first since it's a real
 * navigation to a different page. */
function DspUrlPasteCard() {
  const [urlPaste, setUrlPaste] = useState('');

  return (
    <ConfigurableCard
      title="URL / DSP paste"
      header={(open) => (
        <PluginStoreItem
          name="URL / DSP paste"
          author="Tool"
          description="Paste Spotify/Bandcamp/etc. URLs to seed smart-link targets on a release."
          isInstalled={false}
          onInstall={open}
          labels={{ install: 'Configure' }}
        />
      )}
    >
      <p className="text-foreground-secondary text-sm">
        Paste a DSP URL to open Studio releases (smart-link targets).
      </p>
      <Input
        className="w-full"
        size="sm"
        value={urlPaste}
        onChange={(e) => setUrlPaste(e.target.value)}
        placeholder="https://open.spotify.com/track/…"
      />
      <Link
        to="/studio/releases"
        onClick={() => useSettingsModalStore.getState().close()}
      >
        <Button size="sm">
          <Link2Icon size={16} aria-hidden className="mr-1.5" />
          Open releases editor
        </Button>
      </Link>
    </ConfigurableCard>
  );
}

function ServiceCategory({ categoryId }: { categoryId: PluginCategoryId }) {
  const plugins = SERVICE_PLUGINS.filter((p) => p.tags.includes(categoryId));
  return (
    <InstalledAvailableTabs
      ids={plugins.map((p) => p.id)}
      renderItem={(id) => {
        const plugin = plugins.find((p) => p.id === id)!;
        return <ServiceCard key={id} plugin={plugin} />;
      }}
    />
  );
}

function ServiceCard({ plugin }: { plugin: ServicePlugin }) {
  // hearthis/spotify/oauth each track their own real status and write it
  // to usePluginInstallStore themselves (see those cards) — only the
  // remaining kinds (deep-link, info) are decided here, once, up front so
  // this early-return-heavy component never calls the hook conditionally.
  useEffect(() => {
    if (
      plugin.id === 'hearthis' ||
      plugin.id === 'spotify' ||
      plugin.action.kind === 'oauth'
    ) {
      return;
    }
    usePluginInstallStore
      .getState()
      .setInstalled(plugin.id, plugin.action.kind === 'info');
  }, [plugin.id, plugin.action.kind]);

  if (plugin.id === 'hearthis') {
    return <HearthisCard plugin={plugin} />;
  }
  if (plugin.id === 'spotify') {
    return <SpotifyCard plugin={plugin} />;
  }
  if (plugin.action.kind === 'oauth') {
    return <OAuthServiceCard plugin={plugin} action={plugin.action} />;
  }

  const header = (
    <PluginStoreItem
      name={plugin.name}
      author={plugin.author}
      description={plugin.description}
      isInstalled={plugin.action.kind === 'info'}
      onInstall={() => {}}
      labels={{
        install:
          plugin.action.kind === 'deep-link'
            ? (plugin.action.label ?? 'Open')
            : undefined,
        installed: 'Active',
      }}
    />
  );

  if (plugin.action.kind === 'deep-link') {
    return (
      <Link
        to={plugin.action.to}
        onClick={() => useSettingsModalStore.getState().close()}
      >
        {header}
      </Link>
    );
  }
  return header;
}

function SpotifyCard({ plugin }: { plugin: ServicePlugin }) {
  const [profile, setProfile] = useState<SpotifyArtistProfile | null>(null);
  const [configured, setConfigured] = useState(true);
  const [artistUrl, setArtistUrl] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifySearchTrack[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchSpotifyArtistProfile().then((result) => {
      setConfigured(result.data.configured);
      setProfile(result.data.profile);
      if (result.data.profile?.name) {
        setQuery(result.data.profile.name);
      }
    });
  }, []);

  useEffect(() => {
    usePluginInstallStore.getState().setInstalled(plugin.id, Boolean(profile));
  }, [plugin.id, profile]);

  const search = async () => {
    if (!query.trim()) {
      return;
    }
    setBusy(true);
    const result = await searchSpotifyTracks(query.trim());
    setTracks(result.data);
    setSelected(new Set());
    setBusy(false);
  };

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const importSelected = async () => {
    const chosen = tracks.filter((track) => selected.has(track.id));
    if (chosen.length === 0) {
      return;
    }
    setBusy(true);
    const result = await importSpotifyTracks(
      chosen.map((track) => ({
        trackId: track.id,
        title: track.name,
        externalUrl: track.externalUrl,
      })),
    );
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      `Added ${result.count} Spotify item${result.count === 1 ? '' : 's'} as embeds.`,
    );
    setSelected(new Set());
    setImportOpen(false);
  };

  return (
    <ConfigurableCard
      title={plugin.name}
      header={
        <PluginStoreItem
          name={plugin.name}
          author={plugin.author}
          description="Link your Spotify artist profile and choose tracks to embed in your Tahti library."
          isInstalled={Boolean(profile)}
          onInstall={() => setImportOpen(true)}
          labels={{
            install: profile ? 'Import' : 'Configure',
            installed: 'Configured',
          }}
        />
      }
    >
      {!configured ? (
        <p className="text-foreground-secondary text-sm">
          Spotify import is not available until the platform Spotify credentials
          are configured.
        </p>
      ) : profile ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>Linked{profile.name ? `: ${profile.name}` : ''}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setImportOpen(true)}
            >
              <SearchIcon size={14} aria-hidden className="mr-1.5" /> Choose
              content
            </Button>
            <Button
              size="sm"
              variant="text"
              onClick={() => {
                void unlinkSpotifyArtistProfile().then((result) => {
                  if (result.ok) {
                    setProfile(null);
                  } else {
                    setMessage(result.error);
                  }
                });
              }}
            >
              <XIcon size={14} aria-hidden className="mr-1.5" /> Unlink
            </Button>
          </div>
          {message && (
            <p className="text-foreground-secondary text-xs">{message}</p>
          )}
        </>
      ) : (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!artistUrl.trim()) {
              return;
            }
            setBusy(true);
            void linkSpotifyArtistProfile(artistUrl.trim()).then((result) => {
              setBusy(false);
              if (!result.ok) {
                setMessage(result.error);
              } else {
                setProfile(result.data.profile);
                setQuery(result.data.profile?.name ?? '');
              }
            });
          }}
        >
          <Input
            label="Spotify artist URL"
            value={artistUrl}
            onChange={(event) => setArtistUrl(event.target.value)}
            placeholder="https://open.spotify.com/artist/…"
          />
          <Button size="sm" type="submit" disabled={busy || !artistUrl.trim()}>
            {busy ? 'Linking…' : 'Link profile'}
          </Button>
        </form>
      )}
      <Dialog.Root
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        className="max-w-xl"
      >
        <Dialog.Title>Choose Spotify content</Dialog.Title>
        <Dialog.Description>
          Search the linked artist or another Spotify query, select the items
          you want, and add them as provider embeds.
        </Dialog.Description>
        <div className="flex items-end gap-3 py-4">
          <Input
            className="min-w-0 flex-1"
            label="Search Spotify"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button
            size="sm"
            onClick={() => void search()}
            disabled={busy || !query.trim()}
          >
            <SearchIcon size={15} aria-hidden /> Search
          </Button>
        </div>
        <div className="border-border flex max-h-72 flex-col gap-2 overflow-y-auto rounded-md border p-2">
          {tracks.map((track) => (
            <label
              key={track.id}
              className="border-border flex cursor-pointer items-center gap-2 rounded border p-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.has(track.id)}
                onChange={() => toggle(track.id)}
              />
              <span className="min-w-0 flex-1 truncate">{track.name}</span>
              <span className="text-foreground-secondary truncate text-xs">
                {track.artists?.join(', ')}
              </span>
              <CheckSquareIcon
                size={15}
                className="text-foreground-secondary"
                aria-hidden
              />
            </label>
          ))}
          {tracks.length === 0 && (
            <p className="text-foreground-secondary py-5 text-sm">
              Search to see Spotify content.
            </p>
          )}
        </div>
        <Dialog.Actions>
          <Dialog.Close>Cancel</Dialog.Close>
          <Button
            onClick={() => void importSelected()}
            disabled={busy || selected.size === 0}
          >
            Add selected ({selected.size})
          </Button>
        </Dialog.Actions>
      </Dialog.Root>
    </ConfigurableCard>
  );
}

function OAuthServiceCard({
  plugin,
  action,
}: {
  plugin: ServicePlugin;
  action: Extract<ServiceAction, { kind: 'oauth' }>;
}) {
  const [status, setStatus] = useState<{
    connected: boolean;
    username?: string | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [profileDraft, setProfileDraft] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [bandcampAlbums, setBandcampAlbums] = useState<BandcampAlbum[]>([]);
  const [bandcampBusy, setBandcampBusy] = useState(false);
  const [bandcampMessage, setBandcampMessage] = useState<string | null>(null);
  const [scTracks, setScTracks] = useState<SoundcloudTrack[]>([]);
  const [scBusy, setScBusy] = useState(false);
  const [scMessage, setScMessage] = useState<string | null>(null);

  const reload = () =>
    void fetchConnectionStatus(action.integrationId).then((r) =>
      setStatus(r.data),
    );

  useEffect(reload, [action.integrationId]);

  useEffect(() => {
    usePluginInstallStore
      .getState()
      .setInstalled(plugin.id, Boolean(status?.connected));
  }, [plugin.id, status?.connected]);

  useEffect(() => {
    if (action.integrationId !== 'bandcamp' || !status?.connected) {
      return;
    }
    setBandcampBusy(true);
    setBandcampMessage(null);
    void fetchBandcampAlbums().then((result) => {
      setBandcampAlbums(result.data);
      setBandcampMessage(result.message ?? null);
      setBandcampBusy(false);
    });
  }, [action.integrationId, status?.connected]);

  useEffect(() => {
    if (action.integrationId !== 'soundcloud' || !status?.connected) {
      return;
    }
    void fetchSoundcloudTracks().then((r) => setScTracks(r.data));
  }, [action.integrationId, status?.connected]);

  useEffect(() => {
    if (action.integrationId !== 'soundcloud') {
      return;
    }
    void fetchMeProfile().then((r) => {
      const value = r.data.socialLinks?.soundcloud ?? '';
      setProfileUrl(value);
      setProfileDraft(value);
    });
  }, [action.integrationId]);

  const saveProfileUrl = () => {
    const value = profileDraft.trim();
    if (!value) {
      return;
    }
    setProfileMsg(null);
    void fetchMeProfile().then((profile) =>
      patchMeProfile({
        socialLinks: {
          ...(profile.data.socialLinks ?? {}),
          soundcloud: value,
        },
      }).then((r) => {
        if (!r.ok) {
          setProfileMsg(r.error);
          return;
        }
        setProfileUrl(value);
        setProfileDraft(value);
        setProfileMsg('Saved.');
      }),
    );
  };

  const disconnect = () => {
    setBusy(true);
    void disconnectIntegration(
      action.integrationId as
        | 'bandcamp'
        | 'soundcloud'
        | 'google-drive'
        | 'mixcloud'
        | 'musicbrainz',
    ).then(() => {
      setBusy(false);
      reload();
    });
  };

  return (
    <ConfigurableCard
      title={plugin.name}
      header={
        <PluginStoreItem
          name={plugin.name}
          author={plugin.author}
          description={plugin.description}
          isInstalled={Boolean(status?.connected)}
          onInstall={() => {
            window.location.href = oauthStartUrl(action.oauthPath);
          }}
          labels={{ install: 'Connect', installed: 'Connected' }}
        />
      }
    >
      {status?.connected ? (
        <>
          <p className="text-sm">
            Connected{status.username ? ` as ${status.username}` : ''}.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            disabled={busy}
            onClick={disconnect}
          >
            {busy ? 'Disconnecting…' : 'Disconnect'}
          </Button>
          {action.integrationId === 'bandcamp' && (
            <div className="border-border flex flex-col gap-3 border-t pt-3">
              <p className="text-sm font-medium">Your Bandcamp discography</p>
              {bandcampBusy ? (
                <p className="text-foreground-secondary text-sm">
                  Loading your releases…
                </p>
              ) : bandcampAlbums.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  {bandcampMessage ?? 'No Bandcamp releases were found.'}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {bandcampAlbums.map((album) => (
                    <li
                      key={album.id}
                      className="border-border flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
                    >
                      <div className="bg-background-secondary size-10 shrink-0 overflow-hidden rounded-md">
                        {album.coverUrl ? (
                          <img
                            src={album.coverUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {album.title}
                        </div>
                        <div className="text-foreground-secondary text-xs">
                          {album.type ?? 'Release'}
                          {album.trackCount != null
                            ? ` · ${album.trackCount} tracks`
                            : ''}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setBandcampMessage(null);
                          void importBandcampAlbum(album).then((result) => {
                            setBandcampMessage(
                              result.ok
                                ? `Imported ${result.count} item${result.count === 1 ? '' : 's'}.`
                                : result.error,
                            );
                          });
                        }}
                      >
                        Import
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {bandcampMessage && bandcampAlbums.length > 0 ? (
                <p className="text-foreground-secondary text-xs" role="status">
                  {bandcampMessage}
                </p>
              ) : null}
            </div>
          )}
          {action.integrationId === 'soundcloud' && (
            <div className="border-border flex flex-col gap-3 border-t pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">Your SoundCloud tracks</p>
                {scTracks.length > 0 && (
                  <Button
                    size="sm"
                    disabled={scBusy}
                    onClick={() => {
                      setScBusy(true);
                      void importSoundcloudTracks(
                        scTracks.map((track) => ({
                          trackId: track.id,
                          title: track.title,
                        })),
                      ).then((r) => {
                        setScBusy(false);
                        setScMessage(
                          r.ok
                            ? `Queued all ${r.count} SoundCloud tracks. Check Studio → Music.`
                            : r.error,
                        );
                      });
                    }}
                  >
                    {scBusy ? 'Importing…' : `Import all (${scTracks.length})`}
                  </Button>
                )}
              </div>
              {scTracks.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No tracks returned.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {scTracks.map((track) => (
                    <li
                      key={track.id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {track.title}
                      </span>
                      <Button
                        size="sm"
                        disabled={scBusy}
                        onClick={() => {
                          setScBusy(true);
                          void importSoundcloudTracks([
                            { trackId: track.id, title: track.title },
                          ]).then((r) => {
                            setScBusy(false);
                            setScMessage(
                              r.ok
                                ? `Queued import (${r.count}). Check Studio → Music.`
                                : r.error,
                            );
                          });
                        }}
                      >
                        Import
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {scMessage && (
                <p className="text-foreground-secondary text-xs" role="status">
                  {scMessage}
                </p>
              )}
              <Input
                label="SoundCloud profile URL"
                value={profileDraft}
                onChange={(e) => setProfileDraft(e.target.value)}
                placeholder="https://soundcloud.com/your-name"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!profileDraft.trim() || profileDraft === profileUrl}
                  onClick={saveProfileUrl}
                >
                  Save profile URL
                </Button>
                {profileMsg && (
                  <p className="text-foreground-secondary text-xs">
                    {profileMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-foreground-secondary text-sm">
            Not connected yet.
          </p>
          {action.instructionsHref && action.instructionsLabel && (
            <a
              href={action.instructionsHref}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline underline-offset-2"
            >
              {action.instructionsLabel} →
            </a>
          )}
        </>
      )}
    </ConfigurableCard>
  );
}

const HEARTHIS_IMPORTS_STORAGE_KEY = 'tahti-web-hearthis-imports';
const NEW_PLAYLIST_DESTINATION = '__new_playlist__';

function HearthisCard({ plugin }: { plugin: ServicePlugin }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);

  const [handle, setHandle] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [library, setLibrary] = useState<HearthisLibrary | null>(null);
  const [libraryBusy, setLibraryBusy] = useState(false);
  const [tab, setTab] = useState<'tracks' | 'sets' | 'collections' | 'search'>(
    'tracks',
  );
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<HearthisTrack[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [destinationCollections, setDestinationCollections] = useState<
    StudioCollection[]
  >([]);
  const [destinationId, setDestinationId] = useState('');
  const [newDestinationName, setNewDestinationName] = useState('');

  useEffect(() => {
    void fetchMeProfile().then((r) => {
      setHandle(r.data.socialLinks?.hearthisAt ?? null);
    });
  }, []);

  useEffect(() => {
    usePluginInstallStore.getState().setInstalled(plugin.id, Boolean(handle));
  }, [plugin.id, handle]);

  const loadLibrary = () => {
    if (!user) {
      return;
    }
    setLibraryBusy(true);
    void Promise.all([fetchHearthisLibrary(), fetchStudioCollections()]).then(
      ([libraryResult, collectionResult]) => {
        setLibraryBusy(false);
        setLibrary(libraryResult.data);
        setDestinationCollections(collectionResult.data);
        setDestinationId(
          (current) =>
            current || (collectionResult.data.find((c) => c.id)?.id ?? ''),
        );
      },
    );
  };

  useEffect(loadLibrary, [user]);

  useEffect(() => {
    if (!user || typeof localStorage === 'undefined') {
      return;
    }
    try {
      const stored = JSON.parse(
        localStorage.getItem(`${HEARTHIS_IMPORTS_STORAGE_KEY}:${user.id}`) ??
          '[]',
      ) as unknown;
      setImportedIds(
        new Set(
          Array.isArray(stored)
            ? stored.filter((id): id is string => typeof id === 'string')
            : [],
        ),
      );
    } catch {
      setImportedIds(new Set());
    }
  }, [user]);

  const save = () => {
    const value = draft.trim().replace(/^@/, '');
    if (!value) {
      return;
    }
    setSaving(true);
    setMsg(null);
    void fetchMeProfile().then((profile) =>
      patchMeProfile({
        socialLinks: { ...(profile.data.socialLinks ?? {}), hearthisAt: value },
      }).then((r) => {
        setSaving(false);
        if (!r.ok) {
          setMsg(r.error);
          return;
        }
        setHandle(value);
        setDraft('');
        setMsg('Saved.');
        loadLibrary();
      }),
    );
  };

  const visibleTracks =
    tab === 'tracks'
      ? (library?.tracks ?? [])
      : tab === 'sets'
        ? (library?.sets ?? [])
        : tab === 'search'
          ? hits
          : [];
  const playlistDestinations = destinationCollections.filter(
    (c) => !c.style || c.style === 'PLAYLIST',
  );

  const toggleSelected = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resolveDestinationId = async (): Promise<string | null> => {
    if (destinationId !== NEW_PLAYLIST_DESTINATION) {
      return destinationId || null;
    }
    const name = newDestinationName.trim();
    if (!name) {
      setMsg('Give the new playlist a name first.');
      return null;
    }
    const created = await createStudioCollection({
      name,
      style: 'PLAYLIST',
      isPublic: false,
    });
    if (!created.ok || !created.data.id) {
      setMsg(created.ok ? 'Created playlist has no import ID.' : created.error);
      return null;
    }
    setDestinationCollections((current) => [created.data, ...current]);
    setDestinationId(created.data.id);
    setNewDestinationName('');
    toast.success(`Created playlist “${created.data.name}”.`);
    return created.data.id;
  };

  const persistImportedIds = (nextImportedIds: Set<string>) => {
    if (user && typeof localStorage !== 'undefined') {
      localStorage.setItem(
        `${HEARTHIS_IMPORTS_STORAGE_KEY}:${user.id}`,
        JSON.stringify([...nextImportedIds]),
      );
    }
  };

  const importTracksToDestination = async (tracks: HearthisTrack[]) => {
    const resolvedDestinationId = await resolveDestinationId();
    if (!resolvedDestinationId) {
      setMsg((current) => current ?? 'Choose or create a playlist first.');
      return;
    }
    const pendingTracks = tracks.filter((track) => !importedIds.has(track.id));
    if (pendingTracks.length === 0) {
      setMsg(
        'Already imported — each hearthis.at item can only be imported once.',
      );
      toast.info('These hearthis.at tracks are already in your library.');
      return;
    }
    setBusy(true);
    const notificationId = toast.loading(
      `Import started for ${pendingTracks.length} item${pendingTracks.length === 1 ? '' : 's'}…`,
    );
    const result = await importHearthisTracks(
      resolvedDestinationId,
      pendingTracks,
    );
    setBusy(false);
    setSelected(new Set());
    const nextImportedIds = new Set(importedIds);
    result.items.forEach((item) => nextImportedIds.add(item.trackId));
    setImportedIds(nextImportedIds);
    persistImportedIds(nextImportedIds);
    const completionMessage =
      result.failed > 0
        ? `Imported ${result.imported}; ${result.failed} could not be imported.`
        : result.artworkFailed > 0
          ? `Imported ${result.imported} item${result.imported === 1 ? '' : 's'}; ${result.artworkFailed} cover${result.artworkFailed === 1 ? '' : 's'} could not be stored.`
          : `Import completed — ${result.imported} item${result.imported === 1 ? '' : 's'} added to the playlist.`;
    setMsg(completionMessage);
    const firstItem = result.items[0];
    if (firstItem) {
      toast.success(completionMessage, {
        id: notificationId,
        action: {
          label: result.items.length === 1 ? 'Open track' : 'Open first track',
          onClick: () =>
            void navigate({
              to: '/studio/sounds/$id',
              params: { id: firstItem.soundId },
            }),
        },
      });
    } else {
      toast.error(completionMessage, { id: notificationId });
    }
  };

  const importTracksAsCollection = async (
    name: string,
    description: string,
    tracks: HearthisTrack[],
    coverUrl?: string | null,
  ) => {
    const pendingTracks = tracks.filter((track) => !importedIds.has(track.id));
    if (pendingTracks.length === 0) {
      setMsg('Already imported — no duplicate collection was created.');
      toast.info('These hearthis.at items are already in your library.');
      return;
    }
    setBusy(true);
    const notificationId = toast.loading(`Import started for “${name}”…`);
    const created = await createStudioCollection({
      name,
      description,
      style: 'PLAYLIST',
      isPublic: true,
    });
    if (!created.ok || !created.data.id) {
      setBusy(false);
      setMsg(
        created.ok ? 'Created collection has no import ID.' : created.error,
      );
      toast.error('Could not create the destination collection.', {
        id: notificationId,
      });
      return;
    }
    const result = await importHearthisTracks(created.data.id, pendingTracks);
    if (coverUrl) {
      await patchStudioCollection(created.data.slug, { coverUrl });
    }
    setBusy(false);
    const nextImportedIds = new Set(importedIds);
    result.items.forEach((item) => nextImportedIds.add(item.trackId));
    setImportedIds(nextImportedIds);
    persistImportedIds(nextImportedIds);
    const completionMessage =
      result.failed > 0
        ? `Created “${name}” with ${result.imported} items; ${result.failed} failed.`
        : result.artworkFailed > 0
          ? `Created “${name}” with ${result.imported} items; ${result.artworkFailed} cover${result.artworkFailed === 1 ? '' : 's'} could not be stored.`
          : `Import completed — created “${name}” with ${result.imported} item${result.imported === 1 ? '' : 's'}.`;
    setMsg(completionMessage);
    toast.success(completionMessage, {
      id: notificationId,
      action: {
        label: 'Open collection',
        onClick: () =>
          void navigate({
            to: '/studio/collections/$slug',
            params: { slug: created.data.slug },
          }),
      },
    });
    const collectionsResult = await fetchStudioCollections();
    setDestinationCollections(collectionsResult.data);
  };

  const importCollection = async (
    collection: NonNullable<HearthisLibrary>['collections'][number],
  ) => {
    setBusy(true);
    try {
      const tracks = await fetchHearthisCollectionTracks(collection.permalink);
      await importTracksAsCollection(
        collection.title,
        collection.description,
        tracks,
        collection.coverUrl,
      );
    } catch (error) {
      setBusy(false);
      setMsg(
        error instanceof Error ? error.message : 'Collection import failed.',
      );
    }
  };

  const importSelection = async () => {
    if (tab === 'collections') {
      const collections = (library?.collections ?? []).filter((c) =>
        selected.has(c.id),
      );
      for (const collection of collections) {
        await importCollection(collection);
      }
      setSelected(new Set());
      return;
    }
    const tracks = visibleTracks.filter((track) => selected.has(track.id));
    await importTracksToDestination(tracks);
  };

  return (
    <ConfigurableCard
      title={plugin.name}
      dialogClassName="max-w-3xl"
      header={(open) => (
        <PluginStoreItem
          icon={<SourceServiceIcon id="hearthis" />}
          name={plugin.name}
          author={plugin.author}
          description={plugin.description}
          isInstalled={Boolean(handle)}
          onInstall={open}
          labels={{ install: 'Configure', installed: 'Configured' }}
        />
      )}
    >
      <div className="border-border bg-background-secondary/40 flex flex-wrap items-center gap-2 rounded-lg border p-3">
        {handle ? (
          <span className="text-sm">
            Connected as <span className="font-medium">@{handle}</span>
          </span>
        ) : (
          <span className="text-foreground-secondary text-sm">
            Add your hearthis.at username to load your library.
          </span>
        )}
        <Input
          className="min-w-[10rem] flex-1"
          size="sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={handle ? 'Change username…' : 'hearthis.at username'}
          aria-label="hearthis.at username"
        />
        <Button size="sm" disabled={saving || !draft.trim()} onClick={save}>
          {saving ? 'Saving…' : handle ? 'Update' : 'Connect'}
        </Button>
      </div>
      {msg && (
        <p className="text-foreground-secondary text-xs" role="status">
          {msg}
        </p>
      )}

      {handle && (
        <>
          <nav
            className="flex flex-wrap gap-2"
            aria-label="hearthis.at library"
          >
            {(
              [
                ['tracks', 'Tracks', library?.tracks.length ?? 0],
                ['sets', 'DJ sets', library?.sets.length ?? 0],
                [
                  'collections',
                  'Collections',
                  library?.collections.length ?? 0,
                ],
                ['search', 'Search', hits.length],
              ] as const
            ).map(([id, label, count]) => (
              <Button
                key={id}
                size="sm"
                variant={tab === id ? 'default' : 'secondary'}
                onClick={() => {
                  setTab(id);
                  setSelected(new Set());
                }}
              >
                {id === 'collections' ? (
                  <FolderDownIcon size={14} className="mr-1.5" aria-hidden />
                ) : id === 'search' ? (
                  <SearchIcon size={14} className="mr-1.5" aria-hidden />
                ) : (
                  <CheckSquareIcon size={14} className="mr-1.5" aria-hidden />
                )}
                {label} ({count})
              </Button>
            ))}
          </nav>

          {tab === 'search' && (
            <div className="flex flex-wrap gap-2">
              <Input
                className="min-w-[200px] flex-1"
                size="sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search hearthis.at"
              />
              <Button
                size="sm"
                disabled={!q.trim() || libraryBusy}
                onClick={() => {
                  setLibraryBusy(true);
                  void searchHearthisTracks(q.trim()).then((result) => {
                    setLibraryBusy(false);
                    setHits(result.data);
                  });
                }}
              >
                <SearchIcon size={16} aria-hidden className="mr-1.5" />
                {libraryBusy ? 'Searching…' : 'Search'}
              </Button>
            </div>
          )}

          {tab !== 'collections' && (
            <div className="border-border bg-background-secondary/40 flex flex-wrap items-center gap-2 rounded-lg border p-3">
              <Select
                className="min-w-48 flex-1"
                options={[
                  { id: '', label: 'Choose destination playlist' },
                  { id: NEW_PLAYLIST_DESTINATION, label: 'New playlist…' },
                  ...playlistDestinations.map((c) => ({
                    id: c.id ?? c.slug,
                    label: c.name,
                  })),
                ]}
                value={destinationId}
                onValueChange={setDestinationId}
              />
              {destinationId === NEW_PLAYLIST_DESTINATION ? (
                <Input
                  size="sm"
                  value={newDestinationName}
                  onChange={(e) => setNewDestinationName(e.target.value)}
                  aria-label="New playlist name"
                  placeholder="Playlist name"
                  className="min-w-48 flex-1"
                />
              ) : null}
              <Button
                size="sm"
                variant="secondary"
                disabled={visibleTracks.length === 0}
                onClick={() =>
                  setSelected(
                    new Set(
                      visibleTracks
                        .filter((track) => !importedIds.has(track.id))
                        .map((track) => track.id),
                    ),
                  )
                }
              >
                <CheckSquareIcon size={15} className="mr-1.5" aria-hidden />
                Select all
              </Button>
              <Button
                size="sm"
                disabled={
                  busy ||
                  !destinationId ||
                  (destinationId === NEW_PLAYLIST_DESTINATION &&
                    !newDestinationName.trim()) ||
                  selected.size === 0
                }
                onClick={() => void importSelection()}
              >
                <DownloadIcon size={15} className="mr-1.5" aria-hidden />
                Import selected ({selected.size})
              </Button>
            </div>
          )}

          {tab === 'collections' ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {(library?.collections ?? []).map((collection) => (
                <li
                  key={collection.id}
                  className="border-border flex items-center gap-3 rounded-lg border p-3"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(collection.id)}
                    onChange={() => toggleSelected(collection.id)}
                    aria-label={`Select ${collection.title}`}
                  />
                  <MediaArtwork
                    size="sm"
                    src={collection.coverUrl}
                    alt={collection.title}
                    imageReveal={false}
                    className="border-border shrink-0 rounded border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {collection.title}
                    </p>
                    <p className="text-foreground-secondary text-xs">
                      {collection.trackCount} items
                    </p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void importCollection(collection)}
                    aria-label={`Import ${collection.title} as collection`}
                    title="Import as collection"
                  >
                    <FolderDownIcon size={15} />
                  </Button>
                </li>
              ))}
              {(library?.collections.length ?? 0) > 0 && (
                <li className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setSelected(
                        new Set(library?.collections.map((c) => c.id)),
                      )
                    }
                  >
                    <CheckSquareIcon size={15} className="mr-1.5" aria-hidden />
                    Select all
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy || selected.size === 0}
                    onClick={() => void importSelection()}
                  >
                    <FolderDownIcon size={15} className="mr-1.5" aria-hidden />
                    Import selected ({selected.size})
                  </Button>
                </li>
              )}
            </ul>
          ) : (
            <ul className="flex flex-col gap-2">
              {visibleTracks.map((track) => (
                <li
                  key={track.id}
                  className="border-border flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(track.id)}
                    disabled={importedIds.has(track.id)}
                    onChange={() => toggleSelected(track.id)}
                    aria-label={`Select ${track.title}`}
                  />
                  <MediaArtwork
                    size="sm"
                    src={track.coverUrl}
                    alt={track.title}
                    imageReveal={false}
                    onPlay={() => play(playableFromHearthis(track))}
                    playLabel="Preview"
                    onQueue={() => enqueue(playableFromHearthis(track))}
                    queueLabel="Queue"
                    className="border-border shrink-0 rounded border"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {track.title}
                    </div>
                    <div className="text-foreground-secondary truncate text-xs">
                      {track.username}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={
                      busy ||
                      !destinationId ||
                      (destinationId === NEW_PLAYLIST_DESTINATION &&
                        !newDestinationName.trim()) ||
                      importedIds.has(track.id)
                    }
                    onClick={() => void importTracksToDestination([track])}
                  >
                    <DownloadIcon size={15} className="mr-1.5" aria-hidden />
                    {importedIds.has(track.id) ? 'Imported' : 'Import'}
                  </Button>
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground-secondary shrink-0 text-xs underline-offset-2 hover:underline"
                  >
                    hearthis.at ↗
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!libraryBusy &&
            tab !== 'search' &&
            tab !== 'collections' &&
            visibleTracks.length === 0 && (
              <p className="text-foreground-secondary text-sm">
                No {tab} found for this profile.
              </p>
            )}
        </>
      )}

      <p className="text-foreground-secondary text-xs">
        A hearthis.at Premium account is required to export your own tracks
        there — importing from hearthis.at works on any account.
      </p>
    </ConfigurableCard>
  );
}

// ── Multicast / Audio plugins ───────────────────────────────────────────────

type MulticastConfiguring = {
  provider: MulticastProviderId;
  existing: RtmpTarget | null;
};

function MulticastConfigureDialog({
  configuring,
  onClose,
  onSaved,
}: {
  configuring: MulticastConfiguring;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { provider, existing } = configuring;
  const isCustom = provider === 'CUSTOM';
  const [label, setLabel] = useState(existing?.label ?? '');
  const [address, setAddress] = useState('');
  const [port, setPort] = useState('1935');
  const [streamKey, setStreamKey] = useState('');
  const [enabled, setEnabled] = useState(existing?.enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setError(null);
    if (existing) {
      // The API only lets an existing target's label/enabled state change
      // -- its stream key and RTMP address are fixed at creation, so there
      // is nothing else here to resend.
      setSaving(true);
      void patchRtmpTarget(existing.id, {
        label: label.trim() || undefined,
        enabled,
      }).then((result) => {
        setSaving(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onSaved();
      });
      return;
    }
    if (!streamKey.trim() || (isCustom && !address.trim())) {
      setError(
        isCustom
          ? 'RTMP address and stream key are required.'
          : 'Stream key is required.',
      );
      return;
    }
    const rtmpUrl = isCustom
      ? `${address.trim().replace(/\/$/, '')}:${port.trim() || '1935'}`
      : undefined;
    setSaving(true);
    void createRtmpTarget({
      provider,
      streamKey: streamKey.trim(),
      label: label.trim() || undefined,
      rtmpUrl,
      enabled,
    }).then((result) => {
      setSaving(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  };

  return (
    <Dialog.Root
      isOpen
      onClose={() => !saving && onClose()}
      className="max-w-lg"
    >
      <Dialog.Title>Configure {multicastProviderLabel(provider)}</Dialog.Title>
      <Dialog.Description>
        {existing
          ? 'Update the destination label and whether it mirrors your live stream.'
          : 'Enter the credential this platform uses for live streaming. Custom RTMP also needs its server address and port.'}
      </Dialog.Description>
      <div className="mt-4 flex flex-col gap-3">
        <Input
          label="Label (optional)"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={multicastProviderLabel(provider)}
        />
        {existing ? (
          <p className="text-foreground-secondary text-xs">
            {existing.rtmpUrl}
            {existing.keyLast4 ? ` · key ···${existing.keyLast4}` : ''}
          </p>
        ) : (
          <>
            {isCustom ? (
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <Input
                  label="RTMP address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="rtmp://stream.example.com/live"
                />
                <Input
                  label="Port"
                  value={port}
                  onChange={(event) => setPort(event.target.value)}
                  placeholder="1935"
                  inputMode="numeric"
                />
              </div>
            ) : (
              <p className="text-foreground-secondary text-xs">
                Ingest server:{' '}
                {multicastProviders.find((item) => item.id === provider)
                  ?.rtmpUrlHint ?? 'the platform chooses the ingest server'}
              </p>
            )}
            <Input
              label={isCustom ? 'Stream key' : 'Stream key / API key'}
              value={streamKey}
              onChange={(event) => setStreamKey(event.target.value)}
              placeholder={
                isCustom ? 'Paste stream key' : 'Paste platform credential'
              }
            />
          </>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          <span>Enabled — mirror the live stream here</span>
        </label>
        {error ? (
          <p className="text-accent-red text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <Dialog.Actions>
        <Dialog.Close>Cancel</Dialog.Close>
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Dialog.Actions>
    </Dialog.Root>
  );
}

function MulticastCategory() {
  const [targets, setTargets] = useState<RtmpTarget[] | null>(null);
  const [configuring, setConfiguring] = useState<MulticastConfiguring | null>(
    null,
  );

  const reload = () => {
    void fetchRtmpTargets().then((r) => setTargets(r.data));
  };

  useEffect(() => {
    void fetchRtmpTargets().then((r) => setTargets(r.data));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
        Stream destinations
      </h3>
      {targets == null ? (
        <PageLoading label="Loading multistream destinations…" />
      ) : (
        <ul className="flex flex-col gap-2">
          {multicastProviders.map((destination) => {
            const target = targets.find((t) => t.provider === destination.id);
            return (
              <PluginItem
                key={destination.id}
                icon={<Cast size={22} aria-hidden />}
                name={destination.label}
                author="Multicast"
                description={
                  target
                    ? `${target.rtmpUrl}${target.keyLast4 ? ` · key ···${target.keyLast4}` : ''}`
                    : destination.rtmpUrlHint
                      ? `Mirror your live stream via ${destination.rtmpUrlHint}.`
                      : 'Mirror your live stream to a custom RTMP server.'
                }
                rightAccessory={
                  <Badge
                    variant="pill"
                    color={target?.enabled ? 'green' : undefined}
                    className="flex items-center gap-1"
                  >
                    <span
                      className={`size-1.5 rounded-full ${target?.enabled ? 'bg-accent-green' : 'bg-foreground-secondary'}`}
                      aria-hidden
                    />
                    {target
                      ? target.enabled
                        ? 'Enabled'
                        : 'Disabled'
                      : 'Not configured'}
                  </Badge>
                }
                onViewDetails={() =>
                  setConfiguring({
                    provider: destination.id,
                    existing: target ?? null,
                  })
                }
                onRemove={
                  target
                    ? () => void deleteRtmpTarget(target.id).then(reload)
                    : undefined
                }
              />
            );
          })}
        </ul>
      )}
      {configuring ? (
        <MulticastConfigureDialog
          configuring={configuring}
          onClose={() => setConfiguring(null)}
          onSaved={() => {
            setConfiguring(null);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

function AudioPluginToggleRow({
  name,
  author,
  description,
  enabled,
  onToggle,
}: {
  name: string;
  author: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-border bg-background-secondary/40 flex items-center gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <PluginStoreItem
          name={name}
          author={author}
          description={description}
          onInstall={onToggle}
          labels={{ install: enabled ? 'Activated' : 'Activate' }}
          isInstalled={enabled}
        />
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? 'Deactivate' : 'Activate'} ${name}`}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors ${enabled ? 'border-primary bg-primary' : 'border-border bg-background'}`}
      >
        <span
          className={`size-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

function AudioPluginsCategory() {
  const enabledPluginIds = useAudioFxStore((state) => state.enabledPluginIds);
  const togglePlugin = useAudioFxStore((state) => state.togglePlugin);
  const masteringEnabled = useMasteringFeatureStore((state) => state.enabled);
  const setMasteringEnabled = useMasteringFeatureStore(
    (state) => state.setEnabled,
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Not the same "Mastering" as the Pro Editor's own EQ/Comp/Limiter/
       * Filter chain panel below (also confusingly labeled "Mastering"
       * there) — this is the client-side reference-track matching tool,
       * see plugins/mastering/README.md. */}
      <AudioPluginToggleRow
        name="Mastering (reference matching)"
        author="Client-side · always available"
        description="Match a track's loudness and tonal balance toward a reference track — the 'Master' / 'Match to a reference track' entry points on Sounds and the track editor."
        enabled={masteringEnabled}
        onToggle={() => setMasteringEnabled(!masteringEnabled)}
      />
      <p className="text-foreground-secondary text-xs">
        Enabled by default. Turning this off hides the mastering entry points;
        it doesn't touch any saved mastering output.
      </p>
      <div className="border-border my-1 border-t" />
      {ALL_PLUGIN_IDS.map((id) => {
        const meta = AUDIO_FX_PLUGINS[id];
        const enabled = enabledPluginIds.includes(id);
        return (
          <AudioPluginToggleRow
            key={id}
            name={meta.label}
            author="Pro Editor"
            description={meta.description}
            enabled={enabled}
            onToggle={() => togglePlugin(id)}
          />
        );
      })}
      <p className="text-foreground-secondary text-xs">
        Only activated audio plugins are available to add in the Pro Editor.
      </p>
    </div>
  );
}

// ── Radio / Embed / Discovery / Channel: per-page listener & artist
// widgets, each configured here rather than in a separate settings
// section — see the file-level doc comment on PluginCategoryId. ───────────

/** "Bring your own stream" — distinct from the curated station directory
 * below it (an admin-approved list for the main player bar): this pastes
 * one personal M3U/direct-stream URL, or searches the public Radio Browser
 * directory, and plays/queues/favorites the result. Ported from the
 * retired Sources page's `radio` tab. */
function PersonalRadioStreamCard() {
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const toggleFavoriteTrack = useLibraryStore((s) => s.toggleFavoriteTrack);
  const isFavoriteTrack = useLibraryStore((s) => s.isFavoriteTrack);

  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [station, setStation] = useState<PublicRadioStation | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicRadioStation[]>([]);

  const openStation = (next: PublicRadioStation) => {
    setStation(next);
    setNowPlaying(null);
    setNote(null);
    void readIcyStreamTitle(next.streamUrl).then(setNowPlaying);
  };

  const resolveUrl = () => {
    const input = url.trim();
    if (!input) {
      return;
    }
    setBusy(true);
    setNote(null);
    void resolveStreamUrl(input).then(async ({ streamUrl, title }) => {
      const found = await lookupStationByUrl(streamUrl);
      setBusy(false);
      const next: PublicRadioStation = found ?? {
        id: streamUrl,
        name: title || streamUrl,
        streamUrl,
        source: 'unknown',
      };
      if (!found) {
        setNote(
          'Not in the public station directory — playing the stream directly with the name from the playlist, if any.',
        );
      }
      openStation(next);
    });
  };

  return (
    <ConfigurableCard
      title="Personal radio stream"
      dialogClassName="max-w-2xl"
      header={() => (
        <Box
          variant="tertiary"
          className="flex-row items-center justify-between gap-4"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-foreground inline-flex flex-row items-baseline gap-2 text-lg leading-tight font-bold select-none">
              Personal radio stream
              {station !== null && (
                <Badge variant="pill" color="green">
                  Configured
                </Badge>
              )}
            </h3>
            <p className="text-foreground-secondary line-clamp-2 text-sm">
              Paste an M3U/M3U8 playlist or a direct stream URL, or search the
              public Radio Browser directory — plays via the main player,
              separate from the curated stations below.
            </p>
          </div>
        </Box>
      )}
    >
      <div className="flex flex-col gap-3">
        <p className="text-foreground-secondary text-sm">
          Station metadata is looked up in the public Radio Browser directory;
          live "now playing" is read from the stream's ICY metadata when the
          server allows it.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-[240px] flex-1"
            size="sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/stream.m3u8"
          />
          <Button size="sm" disabled={!url.trim() || busy} onClick={resolveUrl}>
            <RadioIcon size={16} aria-hidden className="mr-1.5" />
            {busy ? 'Resolving…' : 'Resolve'}
          </Button>
        </div>
        {note && <p className="text-foreground-secondary text-xs">{note}</p>}
      </div>

      {station && (
        <div className="border-border flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3">
          <MediaArtwork
            size="sm"
            src={station.favicon}
            alt={station.name}
            imageReveal={false}
            onPlay={() => play(playableFromRadioStation(station, nowPlaying))}
            playLabel="Play"
            onQueue={() =>
              enqueue(playableFromRadioStation(station, nowPlaying))
            }
            queueLabel="Queue"
            onFavorite={() =>
              toggleFavoriteTrack(playableFromRadioStation(station, nowPlaying))
            }
            favorited={isFavoriteTrack(`radio:${station.id}`)}
            className="border-border shrink-0 rounded border"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{station.name}</div>
            <div className="text-foreground-secondary truncate text-xs">
              {nowPlaying
                ? `Now playing: ${nowPlaying}`
                : nowPlaying === null
                  ? 'Live "now playing" unavailable for this stream'
                  : '…'}
            </div>
            {station.tags && station.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {station.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="pill" color="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-sm font-bold tracking-wide uppercase">
          Search the public directory
        </h3>
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-[200px] flex-1"
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Station name"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              void searchStationsByName(query.trim()).then(setResults);
            }}
          >
            <SearchIcon size={16} aria-hidden className="mr-1.5" />
            Search
          </Button>
        </div>
        {results.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {results.map((s) => (
              <li
                key={s.id}
                className="border-border hover:bg-background-secondary flex items-center gap-1 rounded-md border pr-1"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center justify-between px-3 py-2 text-left text-sm"
                  onClick={() => openStation(s)}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="text-foreground-secondary ml-2 shrink-0 text-xs">
                    {s.codec}
                    {s.bitrateKbps ? ` ${s.bitrateKbps}kbps` : ''}
                  </span>
                </button>
                <FavoriteButton
                  size="sm"
                  isFavorite={isFavoriteTrack(`radio:${s.id}`)}
                  onToggle={() =>
                    toggleFavoriteTrack(playableFromRadioStation(s))
                  }
                  ariaLabelAdd={`Add ${s.name} to library`}
                  ariaLabelRemove={`Remove ${s.name} from library`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-sm font-bold tracking-wide uppercase">
          Common stations
        </h3>
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {COMMON_STATIONS.map((s) => (
            <li
              key={s.id}
              className="border-border hover:bg-background-secondary flex items-center gap-1 rounded-md border pr-1"
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center justify-between px-3 py-2 text-left text-sm"
                onClick={() => openStation(s)}
              >
                <span className="truncate">{s.name}</span>
                <span className="text-foreground-secondary ml-2 shrink-0 text-xs">
                  {s.tags?.[0]}
                </span>
              </button>
              <FavoriteButton
                size="sm"
                isFavorite={isFavoriteTrack(`radio:${s.id}`)}
                onToggle={() =>
                  toggleFavoriteTrack(playableFromRadioStation(s))
                }
                ariaLabelAdd={`Add ${s.name} to library`}
                ariaLabelRemove={`Remove ${s.name} from library`}
              />
            </li>
          ))}
        </ul>
      </div>
    </ConfigurableCard>
  );
}

function RadioBrowserStationRow({
  station,
  onPlay,
  isFavorite,
  onToggleFavorite,
}: {
  station: PublicRadioStation;
  onPlay: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <li className="border-border hover:bg-background-secondary flex items-center gap-2 rounded-md border p-1.5 pr-1">
      <div className="border-border bg-background flex size-9 shrink-0 items-center justify-center overflow-hidden rounded border">
        {station.favicon ? (
          <img
            src={station.favicon}
            alt=""
            className="size-full object-contain"
            onError={(e) => {
              e.currentTarget.remove();
            }}
          />
        ) : (
          <RadioIcon
            size={16}
            className="text-foreground-secondary"
            aria-hidden
          />
        )}
      </div>
      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col items-start text-left"
        onClick={onPlay}
      >
        <span className="w-full truncate text-sm">{station.name}</span>
        <span className="text-foreground-secondary w-full truncate text-xs">
          {station.country ?? station.tags?.[0] ?? 'Unknown'}
        </span>
      </button>
      <Button
        size="icon-sm"
        variant="secondary"
        aria-label={`Play ${station.name}`}
        onClick={onPlay}
      >
        <PlayIcon size={14} aria-hidden />
      </Button>
      <FavoriteButton
        size="sm"
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
        ariaLabelAdd={`Add ${station.name} to library`}
        ariaLabelRemove={`Remove ${station.name} from library`}
      />
    </li>
  );
}

/** Full radio-browser.info directory: search + genre/country filters, a
 * Finnish-stations banner, and a popular-stations list — separate from
 * `PersonalRadioStreamCard`'s single-URL/search-only tool above it. Off by
 * default (third-party API, not Tahti-hosted); enabling it reveals the
 * browsing UI inline rather than behind another settings dialog. */
function RadioBrowserDirectoryCard() {
  const enabled = useRadioBrowserStore((s) => s.enabled);
  const setEnabled = useRadioBrowserStore((s) => s.setEnabled);
  const play = usePlayerStore((s) => s.play);
  const toggleFavoriteTrack = useLibraryStore((s) => s.toggleFavoriteTrack);
  const isFavoriteTrack = useLibraryStore((s) => s.isFavoriteTrack);

  const [loaded, setLoaded] = useState(false);
  const [stationCount, setStationCount] = useState<number | null>(null);
  const [finnishStations, setFinnishStations] = useState<PublicRadioStation[]>(
    [],
  );
  const [countries, setCountries] = useState<RadioBrowserCountry[]>([]);
  const [tags, setTags] = useState<RadioBrowserTag[]>([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState<PublicRadioStation[]>([]);
  const [searching, setSearching] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (!enabled || loaded) {
      return;
    }
    setLoaded(true);
    void fetchStationCount().then(setStationCount);
    void searchStations({ countryCode: 'FI', limit: 8 }).then(
      setFinnishStations,
    );
    void fetchCountryList().then(setCountries);
    void fetchTagList().then(setTags);
    void searchStations({ limit: 20 }).then(setResults);
  }, [enabled, loaded]);

  const runSearch = () => {
    setSearching(true);
    setIsFiltered(Boolean(query.trim() || genre || country));
    void searchStations({
      name: query,
      tag: genre || undefined,
      countryCode: country || undefined,
      limit: 30,
    }).then((r) => {
      setResults(r);
      setSearching(false);
    });
  };

  const playStation = (station: PublicRadioStation) =>
    play(playableFromRadioStation(station));
  const favoriteProps = (station: PublicRadioStation) => ({
    isFavorite: isFavoriteTrack(`radio:${station.id}`),
    onToggleFavorite: () =>
      toggleFavoriteTrack(playableFromRadioStation(station)),
  });

  return (
    <div className="flex flex-col gap-2">
      <AudioPluginToggleRow
        name="Radio Browser directory"
        author="radio-browser.info · community directory"
        description="Browse and search 50,000+ public internet radio stations, with genre and country filters — separate from the personal stream tool above."
        enabled={enabled}
        onToggle={() => setEnabled(!enabled)}
      />
      {enabled && (
        <div className="border-border flex flex-col gap-4 rounded-lg border p-4">
          <div className="border-primary/30 bg-primary/5 flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold tracking-wide uppercase">
                Finnish stations
              </h3>
              <span className="text-foreground-secondary text-xs">
                {stationCount
                  ? `${stationCount.toLocaleString()} public stations total`
                  : null}
              </span>
            </div>
            {finnishStations.length === 0 ? (
              <p className="text-foreground-secondary text-xs">
                Loading Finnish stations…
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {finnishStations.map((s) => (
                  <RadioBrowserStationRow
                    key={s.id}
                    station={s}
                    onPlay={() => playStation(s)}
                    {...favoriteProps(s)}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[200px] flex-1"
              size="sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  runSearch();
                }
              }}
              placeholder="Search stations"
            />
            <Select
              className="min-w-[150px] flex-1"
              options={[
                { id: '', label: 'All genres' },
                ...tags.map((t) => ({
                  id: t.name,
                  label: `${t.name} (${t.stationCount})`,
                })),
              ]}
              value={genre}
              onValueChange={setGenre}
            />
            <Select
              className="min-w-[150px] flex-1"
              options={[
                { id: '', label: 'All countries' },
                ...countries.map((c) => ({
                  id: c.code,
                  label: `${c.name} (${c.stationCount})`,
                })),
              ]}
              value={country}
              onValueChange={setCountry}
            />
            <Button size="sm" disabled={searching} onClick={runSearch}>
              <SearchIcon size={16} aria-hidden className="mr-1.5" />
              {searching ? 'Searching…' : 'Search'}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-display text-sm font-bold tracking-wide uppercase">
              {isFiltered ? 'Results' : 'Popular stations'}
            </h3>
            {results.length === 0 ? (
              <p className="text-foreground-secondary text-xs">
                No stations found.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {results.map((s) => (
                  <RadioBrowserStationRow
                    key={s.id}
                    station={s}
                    onPlay={() => playStation(s)}
                    {...favoriteProps(s)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RadioCategory() {
  const play = usePlayerStore((s) => s.play);
  const currentId = usePlayerStore((s) => s.currentId);
  const playbackStatus = usePlayerStore((s) => s.status);
  const setPlaybackStatus = usePlayerStore((s) => s.setStatus);
  const enabledStationIds = useListenerWidgetsStore((s) => s.enabledStationIds);
  const toggleStation = useListenerWidgetsStore((s) => s.toggleStation);
  const stationOverrides = useListenerWidgetsStore((s) => s.stationOverrides);
  const updateStation = useListenerWidgetsStore((s) => s.updateStation);
  const [editingStation, setEditingStation] = useState<RadioStation | null>(
    null,
  );
  const [logoUrlDraft, setLogoUrlDraft] = useState('');
  const [streamUrlDraft, setStreamUrlDraft] = useState('');
  const [streamTestBusy, setStreamTestBusy] = useState(false);
  const [streamTestResult, setStreamTestResult] =
    useState<RadioStreamTestResult | null>(null);
  useEffect(() => {
    setLogoUrlDraft(editingStation?.logoUrl ?? '');
    setStreamUrlDraft(editingStation?.streamUrl ?? '');
    setStreamTestBusy(false);
    setStreamTestResult(null);
  }, [editingStation]);
  const [expandedStationIds, setExpandedStationIds] = useState<Set<string>>(
    new Set(),
  );
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestLogoUrl, setSuggestLogoUrl] = useState('');
  const [suggestLanguage, setSuggestLanguage] = useState('');
  const [suggestBitrate, setSuggestBitrate] = useState('');
  const [suggestStreamUrl, setSuggestStreamUrl] = useState('');
  const [suggestBusy, setSuggestBusy] = useState(false);
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null);
  const [installTab, setInstallTab] = useState<'installed' | 'available'>(
    'installed',
  );
  const stationInstalledCount = RADIO_STATIONS.filter((s) =>
    enabledStationIds.includes(s.id),
  ).length;
  const stationAvailableCount = RADIO_STATIONS.length - stationInstalledCount;

  return (
    <div className="flex flex-col gap-3">
      <PersonalRadioStreamCard />
      <RadioBrowserDirectoryCard />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSuggestOpen((v) => !v)}
        >
          {suggestOpen ? 'Cancel' : 'Suggest a station'}
        </Button>
      </div>

      {suggestOpen && (
        <form
          className="border-border bg-background-secondary/40 flex flex-col gap-3 rounded-lg border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSuggestBusy(true);
            setSuggestMsg(null);
            void import('../api/admin')
              .then(({ submitRadioStationSuggestion }) =>
                submitRadioStationSuggestion({
                  name: suggestName.trim(),
                  logoUrl: suggestLogoUrl.trim(),
                  language: suggestLanguage.trim(),
                  bitrateKbps: suggestBitrate.trim(),
                  streamUrl: suggestStreamUrl.trim(),
                }),
              )
              .then((r) => {
                setSuggestBusy(false);
                if (!r.ok) {
                  setSuggestMsg(r.error);
                  return;
                }
                setSuggestMsg('Thanks — sent to the Tahti team for review.');
                setSuggestName('');
                setSuggestLogoUrl('');
                setSuggestLanguage('');
                setSuggestBitrate('');
                setSuggestStreamUrl('');
              });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Station name"
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
              required
            />
            <Input
              label="Language"
              value={suggestLanguage}
              onChange={(e) => setSuggestLanguage(e.target.value)}
              placeholder="Finnish"
            />
            <Input
              label="Bitrate (kbps)"
              value={suggestBitrate}
              onChange={(e) => setSuggestBitrate(e.target.value)}
              placeholder="128"
            />
            <Input
              label="Logo URL"
              value={suggestLogoUrl}
              onChange={(e) => setSuggestLogoUrl(e.target.value)}
              placeholder="https://…"
            />
            <Input
              label="Stream URL"
              value={suggestStreamUrl}
              onChange={(e) => setSuggestStreamUrl(e.target.value)}
              placeholder="https://stream.example.fi/station.mp3"
              className="sm:col-span-2"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              type="submit"
              disabled={
                suggestBusy || !suggestName.trim() || !suggestStreamUrl.trim()
              }
            >
              {suggestBusy ? 'Sending…' : 'Send for review'}
            </Button>
            {suggestMsg && (
              <p className="text-foreground-secondary text-xs">{suggestMsg}</p>
            )}
          </div>
        </form>
      )}

      <div
        className="flex gap-1"
        role="tablist"
        aria-label="Installed or available"
      >
        <button
          type="button"
          role="tab"
          aria-selected={installTab === 'installed'}
          onClick={() => setInstallTab('installed')}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            installTab === 'installed'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:bg-background-secondary'
          }`}
        >
          Installed ({stationInstalledCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={installTab === 'available'}
          onClick={() => setInstallTab('available')}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            installTab === 'available'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:bg-background-secondary'
          }`}
        >
          Available ({stationAvailableCount})
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {RADIO_STATIONS.filter(
          (s) =>
            enabledStationIds.includes(s.id) === (installTab === 'installed'),
        ).map((baseStation) => {
          const station = {
            ...baseStation,
            ...stationOverrides[baseStation.id],
          };
          const enabled = enabledStationIds.includes(station.id);
          const sourceConfigured = Boolean(station.streamUrl);
          const stationPlayableId = `radio-widget:${station.id}`;
          const stationIsCurrent = currentId === stationPlayableId;
          const stationIsPlaying =
            stationIsCurrent &&
            (playbackStatus === 'playing' || playbackStatus === 'loading');
          const stationExpanded = expandedStationIds.has(station.id);
          return (
            <PluginItem
              key={station.id}
              icon={
                <img
                  src={station.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              }
              name={
                enabled ? (
                  <>
                    {station.name}
                    <Badge variant="pill" color="green" className="ml-2">
                      Enabled
                    </Badge>
                  </>
                ) : (
                  station.name
                )
              }
              author={station.language}
              description={`${station.genre} · ${station.bitrateKbps}kbps ${station.codec} · ${sourceConfigured ? 'Source configured' : 'Add a stream source in Configure'}`}
              warning={!sourceConfigured}
              warningText={
                sourceConfigured
                  ? undefined
                  : 'This station needs a stream source before it can be played.'
              }
              disabled={!enabled && sourceConfigured}
              rightAccessory={
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={enabled ? undefined : 'secondary'}
                      title={enabled ? 'Disable' : 'Enable'}
                      aria-label={`${enabled ? 'Disable' : 'Enable'} ${station.name}`}
                      aria-pressed={enabled}
                      onClick={() => toggleStation(station.id)}
                    >
                      {enabled ? (
                        <CheckCircle2Icon size={14} aria-hidden />
                      ) : (
                        <PlusCircleIcon size={14} aria-hidden />
                      )}
                    </Button>
                    {sourceConfigured && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        title={
                          stationExpanded ? 'Hide controls' : 'Show controls'
                        }
                        aria-label={
                          stationExpanded
                            ? `Hide controls for ${station.name}`
                            : `Show controls for ${station.name}`
                        }
                        aria-expanded={stationExpanded}
                        onClick={() =>
                          setExpandedStationIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(station.id)) {
                              next.delete(station.id);
                            } else {
                              next.add(station.id);
                            }
                            return next;
                          })
                        }
                      >
                        {stationExpanded ? (
                          <ChevronUpIcon size={14} aria-hidden />
                        ) : (
                          <ChevronDownIcon size={14} aria-hidden />
                        )}
                      </Button>
                    )}
                  </div>
                  {sourceConfigured && stationExpanded && (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={stationIsPlaying ? undefined : 'secondary'}
                      title={stationIsPlaying ? 'Pause' : 'Preview'}
                      aria-label={
                        stationIsPlaying
                          ? `Pause ${station.name}`
                          : `Preview ${station.name}`
                      }
                      aria-pressed={stationIsPlaying}
                      onClick={() => {
                        if (stationIsCurrent) {
                          setPlaybackStatus(
                            stationIsPlaying ? 'paused' : 'playing',
                          );
                          return;
                        }
                        play(
                          radioStationPlayable({
                            ...station,
                            streamUrl: station.streamUrl!,
                          }),
                        );
                      }}
                    >
                      {stationIsPlaying ? (
                        <PauseIcon size={14} aria-hidden />
                      ) : (
                        <PlayIcon size={14} aria-hidden />
                      )}
                    </Button>
                  )}
                </div>
              }
              onViewDetails={() => setEditingStation(station)}
              labels={{ by: 'language' }}
            />
          );
        })}
      </div>

      <Dialog.Root
        isOpen={editingStation !== null}
        onClose={() => setEditingStation(null)}
        className="max-w-lg"
      >
        {editingStation && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              updateStation(editingStation.id, {
                name: String(form.get('name') ?? '').trim(),
                language: String(form.get('language') ?? '').trim(),
                genre: String(form.get('genre') ?? '').trim(),
                bitrateKbps: Number(form.get('bitrateKbps') ?? 0),
                codec: String(form.get('codec') ?? '').trim(),
                logoUrl: String(form.get('logoUrl') ?? '').trim(),
                streamUrl: streamUrlDraft.trim() || null,
                detailUrl: String(form.get('detailUrl') ?? '').trim(),
              });
              setEditingStation(null);
            }}
          >
            <Dialog.Title>Edit {editingStation.name}</Dialog.Title>
            <Dialog.Description>
              Update the station metadata, cover image, and programming source.
            </Dialog.Description>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                name="name"
                label="Station name"
                defaultValue={editingStation.name}
              />
              <Input
                name="language"
                label="Language"
                defaultValue={editingStation.language}
              />
              <Input
                name="genre"
                label="Genre"
                defaultValue={editingStation.genre}
              />
              <Input
                name="bitrateKbps"
                label="Bitrate (kbps)"
                defaultValue={String(editingStation.bitrateKbps)}
                inputMode="numeric"
              />
              <Input
                name="codec"
                label="Codec"
                defaultValue={editingStation.codec}
              />
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm font-medium">Cover image</span>
                <RoundImageUploadButton
                  label="Station cover image"
                  value={logoUrlDraft}
                  onChange={(logoUrl) => {
                    setLogoUrlDraft(logoUrl);
                    updateStation(editingStation.id, { logoUrl });
                  }}
                />
                <input type="hidden" name="logoUrl" value={logoUrlDraft} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Input
                  name="streamUrl"
                  label="Programming source / stream URL"
                  value={streamUrlDraft}
                  onChange={(e) => {
                    setStreamUrlDraft(e.target.value);
                    setStreamTestResult(null);
                  }}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!streamUrlDraft.trim() || streamTestBusy}
                    onClick={() => {
                      setStreamTestBusy(true);
                      setStreamTestResult(null);
                      void testRadioStream(streamUrlDraft.trim()).then(
                        (result) => {
                          setStreamTestBusy(false);
                          setStreamTestResult(result);
                        },
                      );
                    }}
                  >
                    {streamTestBusy ? 'Testing…' : 'Test stream'}
                  </Button>
                  {streamTestResult && (
                    <p
                      className={`text-xs ${streamTestResult.ok ? 'text-accent-green' : 'text-foreground-secondary'}`}
                    >
                      {streamTestResult.ok ? '✓ ' : ''}
                      {streamTestResult.message}
                    </p>
                  )}
                </div>
              </div>
              <Input
                name="detailUrl"
                label="Station details URL"
                defaultValue={editingStation.detailUrl}
                className="sm:col-span-2"
              />
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button type="submit">Save station</Button>
            </Dialog.Actions>
          </form>
        )}
      </Dialog.Root>
    </div>
  );
}

function ListenCategory() {
  const [installTab, setInstallTab] = useState<'installed' | 'available'>(
    'installed',
  );
  const installedTypeIds = useListenerWidgetsStore((s) => s.installedTypeIds);
  const instances = useListenerWidgetsStore((s) => s.instances);
  const installType = useListenerWidgetsStore((s) => s.installType);
  const uninstallType = useListenerWidgetsStore((s) => s.uninstallType);
  const addInstance = useListenerWidgetsStore((s) => s.addInstance);
  const removeInstance = useListenerWidgetsStore((s) => s.removeInstance);
  const [inputByType, setInputByType] = useState<Record<string, string>>({});
  const [soundcloudProfile, setSoundcloudProfile] = useState('');
  const [soundcloudProfileLoading, setSoundcloudProfileLoading] =
    useState(true);
  const [soundcloudProfileError, setSoundcloudProfileError] = useState<
    string | null
  >(null);
  const [savingSoundcloudProfile, setSavingSoundcloudProfile] = useState(false);

  useEffect(() => {
    void fetchMeProfile().then((profile) => {
      const accountLink = profile.data.socialLinks?.soundcloud ?? '';
      setSoundcloudProfile(soundcloudProfileUrl(accountLink) ?? accountLink);
      setSoundcloudProfileLoading(false);
    });
  }, []);

  const addWidgetInstance = async (typeId: string, label: string) => {
    const rawInput =
      inputByType[typeId] ?? (typeId === 'soundcloud' ? soundcloudProfile : '');
    const input = rawInput.trim();
    if (!input) {
      if (typeId === 'soundcloud') {
        setSoundcloudProfileError(
          'Add your SoundCloud profile URL before configuring this widget.',
        );
      }
      return;
    }

    if (typeId !== 'soundcloud') {
      addInstance(typeId, input, label);
      setInputByType((prev) => ({ ...prev, [typeId]: '' }));
      return;
    }

    const normalizedProfile = soundcloudProfileUrl(input);
    if (!normalizedProfile) {
      setSoundcloudProfileError(
        'Use a SoundCloud profile URL such as https://soundcloud.com/your-name.',
      );
      return;
    }

    setSavingSoundcloudProfile(true);
    setSoundcloudProfileError(null);
    const profile = await fetchMeProfile();
    const saved = await patchMeProfile({
      socialLinks: {
        ...(profile.data.socialLinks ?? {}),
        soundcloud: normalizedProfile,
      },
    });
    setSavingSoundcloudProfile(false);
    if (!saved.ok) {
      setSoundcloudProfileError(saved.error);
      return;
    }
    setSoundcloudProfile(normalizedProfile);
    addInstance('soundcloud', normalizedProfile, 'SoundCloud');
    setInputByType((prev) => ({ ...prev, soundcloud: normalizedProfile }));
  };

  const favoritesInstalled = installedTypeIds.includes('favorites');
  const installedCount =
    (favoritesInstalled ? 1 : 0) +
    LISTENER_WIDGET_TYPES.filter((t) => installedTypeIds.includes(t.id)).length;
  const availableCount = LISTENER_WIDGET_TYPES.length + 1 - installedCount;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex gap-1"
        role="tablist"
        aria-label="Installed or available"
      >
        <button
          type="button"
          role="tab"
          aria-selected={installTab === 'installed'}
          onClick={() => setInstallTab('installed')}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            installTab === 'installed'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:bg-background-secondary'
          }`}
        >
          Installed ({installedCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={installTab === 'available'}
          onClick={() => setInstallTab('available')}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            installTab === 'available'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:bg-background-secondary'
          }`}
        >
          Available ({availableCount})
        </button>
      </div>
      {favoritesInstalled === (installTab === 'installed') && (
        <ConfigurableCard
          title="Favorites"
          header={
            <PluginStoreItem
              name="Favorites"
              author="Tahti"
              description="Show your favorite channels and tracks as a section on Listen."
              category="Listen"
              isInstalled={favoritesInstalled}
              onInstall={() => installType('favorites')}
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
              onClick={() => uninstallType('favorites')}
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
            header={
              <PluginStoreItem
                name={type.name}
                author={type.author}
                description={type.description}
                category={type.category}
                isInstalled={isInstalled}
                onInstall={() => installType(type.id)}
              />
            }
          >
            {isInstalled ? (
              <div className="border-border ml-2 flex flex-col gap-3 border-l pl-4">
                {typeInstances.map((instance) => (
                  <ListenerWidgetEmbed
                    key={instance.id}
                    instance={instance}
                    onRemove={() => removeInstance(instance.id)}
                  />
                ))}
                <form
                  className="flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void addWidgetInstance(type.id, type.name);
                  }}
                >
                  <Input
                    label={
                      type.id === 'soundcloud'
                        ? 'SoundCloud profile URL'
                        : `Add a ${type.name} link`
                    }
                    value={
                      inputByType[type.id] ??
                      (type.id === 'soundcloud' ? soundcloudProfile : '')
                    }
                    onChange={(e) =>
                      type.id === 'soundcloud'
                        ? (setSoundcloudProfileError(null),
                          setInputByType((prev) => ({
                            ...prev,
                            [type.id]: e.target.value,
                          })))
                        : setInputByType((prev) => ({
                            ...prev,
                            [type.id]: e.target.value,
                          }))
                    }
                    placeholder={type.placeholder}
                    className="min-w-[18rem] flex-1"
                    required={type.id === 'soundcloud'}
                    disabled={
                      type.id === 'soundcloud' && soundcloudProfileLoading
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
                {type.id === 'soundcloud' && soundcloudProfileError && (
                  <p className="text-destructive text-xs" role="alert">
                    {soundcloudProfileError}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-foreground-secondary text-xs">
                    {type.helpText}
                  </p>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => uninstallType(type.id)}
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
  );
}

function DiscoveryCategory() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <p className="text-foreground-secondary text-sm">
        Sign in to install add-ons on your Listen page.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DiscoverWidgetPlugins />
      <DiscoWidgetManagerPanel scope="LISTENER" />
    </div>
  );
}

const DISCOVER_WIDGET_DETAILS: Record<DiscoverWidgetId, string> = {
  'this-week-most-played':
    'See the tracks getting the most attention across Tahti this week.',
  'this-week-least-played':
    'Find overlooked tracks from this week and give them a listen.',
  'new-to-you':
    'Get recommendations from artists and tracks you have not heard yet.',
  'latest-tracks': 'Browse the newest tracks published by Tahti artists.',
  'most-played':
    'Explore the most-played tracks across the full Tahti catalog.',
  loved: 'Discover tracks that the Tahti community is saving and enjoying.',
  'artist-of-the-week': 'Meet a featured artist that changes each week.',
  'random-artist':
    'Get a fresh artist pick on a schedule you choose on Discover.',
  'public-playlists':
    'Find public playlists to follow, play, and embed from the Discover page.',
};

const DISCOVER_WIDGET_LABELS: Record<DiscoverWidgetId, string> = {
  'this-week-most-played': 'This week: most played',
  'this-week-least-played': 'This week: least played',
  'new-to-you': 'New to you',
  'latest-tracks': 'Latest tracks',
  'most-played': 'Most played',
  loved: 'Loved by the community',
  'artist-of-the-week': 'Artist of the week',
  'random-artist': 'Random artist',
  'public-playlists': 'Public playlists',
};

function DiscoverWidgetPlugins() {
  const enabledWidgets = useDiscoverStore((state) => state.enabledWidgets);
  const addWidget = useDiscoverStore((state) => state.addWidget);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase">
          Discover page widgets
        </h3>
        <p className="text-foreground-secondary mt-1 text-xs">
          Add these built-in discovery panels to your Discover page. Arrange
          them and tune their filters from Discover.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {ALL_WIDGET_IDS.map((id) => (
          <PluginStoreItem
            key={id}
            name={DISCOVER_WIDGET_LABELS[id]}
            author="Tahti"
            description={DISCOVER_WIDGET_DETAILS[id]}
            category="Discover"
            isInstalled={enabledWidgets.includes(id)}
            onInstall={() => addWidget(id)}
            labels={{ installed: 'Added' }}
          />
        ))}
      </div>
    </section>
  );
}

function ChannelCategory() {
  const user = useAuthStore((s) => s.user);

  if (!user?.channel) {
    return (
      <p className="text-foreground-secondary text-sm">
        Go live or set up your channel to install add-ons there.
      </p>
    );
  }

  return <DiscoWidgetManagerPanel scope="ARTIST" />;
}
