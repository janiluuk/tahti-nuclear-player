import { Link } from '@tanstack/react-router';
import {
  Cast,
  CheckSquareIcon,
  Eye,
  LinkIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  FilePicker,
  Input,
  PluginItem,
  PluginStoreItem,
  Select,
  Slider,
  Tabs,
} from '@nuclearplayer/ui';

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
  type VisualSettingsMap,
} from '../api/channel-design';
import {
  fetchSpotifyArtistProfile,
  linkSpotifyArtistProfile,
  unlinkSpotifyArtistProfile,
} from '../api/distribution';
import {
  disconnectIntegration,
  fetchConnectionStatus,
  importSpotifyTracks,
  oauthStartUrl,
  searchSpotifyTracks,
  type IntegrationId,
  type SpotifySearchTrack,
} from '../api/sources';
import { fetchMeProfile, patchMeProfile } from '../api/studio-extras';
import type { SpotifyArtistProfile } from '../api/studio-types';
import { uploadUserMediaFile } from '../api/user-media';
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
import {
  multicastProviderLabel,
  multicastProviders,
  type MulticastProviderId,
} from '../plugins/multicast';
import { useThemeStore } from '../plugins/themes';
import { visualizerMetadata } from '../plugins/visualizers';
import { useAuthStore } from '../stores/authStore';
import { useListenerWidgetsStore } from '../stores/listenerWidgetsStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { ChannelVisualizer } from './ChannelVisualizer';
import { DiscoWidgetManagerPanel } from './disco-widgets/DiscoWidgetManagerPanel';
import { ListenerWidgetEmbed } from './ListenerWidgetEmbed';
import { NuclearPluginAddonsCategory } from './NuclearPluginAddonsCategory';
import { PageLoading } from './PageStates';
import { ThemeVisualizationSettings } from './ThemeVisualizationSettings';

function visualizerDescription(id: string): string {
  return visualizerMetadata(id).description;
}

const IMPORT_SOURCE_KINDS = new Set(['oauth', 'search', 'tool']);

/** Fold-out shell shared by every configurable plugin card: a gear toggle
 * next to the card that reveals an inline settings form below it (tabs
 * inside `children` when there's enough to configure to warrant them —
 * see VisualizersCategory). Not every plugin gets a gear: deep-link-only
 * entries (most Export/Import targets) have nothing to configure here —
 * their real settings UI is one click away at `action.to`. */
function ConfigurableCard({
  header,
  children,
  title,
  defaultOpen = false,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">{header}</div>
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
        className="max-w-lg"
      >
        <Dialog.Title>Configure {title}</Dialog.Title>
        <Dialog.Description>
          Changes are saved for this add-on.
        </Dialog.Description>
        <div className="flex flex-col gap-3">{children}</div>
        <Dialog.Actions>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Root>
    </div>
  );
}

/** Unified browser across the app's plugin-shaped subsystems — see
 * PLUGIN-STORE-PLAN.md for what actually turning each one into a real,
 * removable plugin would take. This view is the navigation/config layer
 * over the *existing* implementations, not a new plugin runtime: themes
 * apply in place, visualizer/hearthis/embed/MusicBrainz configure in dialogs
 * (real API calls, not stubs), everything else opens its real settings
 * surface, which still owns the actual editing UI.
 *
 * Import/Export/Fingerprinting share one tagged registry (`SERVICE_PLUGINS`
 * below) so shared services can stay a single entry without duplicating
 * their configuration UI. */
export function PluginStorePanel() {
  const [category, setCategory] = useState<PluginCategoryId>('themes');

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

  return (
    <div className="flex flex-col gap-3">
      <p className="text-foreground-secondary text-sm">
        {category.description}
      </p>
      {categoryId === 'themes' && <ThemesCategory />}
      {categoryId === 'visualizers' && <VisualizersCategory />}
      {(categoryId === 'export' ||
        categoryId === 'import' ||
        categoryId === 'fingerprinting') && (
        <ServiceCategory categoryId={categoryId} />
      )}
      {categoryId === 'multicast' && <MulticastCategory />}
      {categoryId === 'audio-plugins' && <AudioPluginsCategory />}
      {categoryId === 'radio' && <RadioCategory />}
      {categoryId === 'embed' && <EmbedCategory />}
      {categoryId === 'discovery' && <DiscoveryCategory />}
      {categoryId === 'channel' && <ChannelCategory />}
      {categoryId === 'nuclear-plugins' && <NuclearPluginAddonsCategory />}
    </div>
  );
}

function ThemesCategory() {
  const themes = useThemeStore((s) => s.themes);
  const customThemes = useThemeStore((s) => s.customThemes);
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const all = [
    ...themes.map((t) => ({ id: t.id, name: t.name, author: 'Tahti' })),
    ...Object.entries(customThemes).map(([id, t]) => ({
      id,
      name: t.name ?? 'Custom theme',
      author: 'Imported',
    })),
  ];

  const themeCard = (theme: (typeof all)[number]) => (
    <PluginStoreItem
      key={theme.id}
      name={theme.name}
      author={theme.author}
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
  const [audioReactive, setAudioReactive] = useState(true);

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

  const saveTuning = (
    id: string,
    next: { speed: number; intensity: number },
  ) => {
    const nextMap = { ...settingsMap, [id]: next };
    setSettingsMap(nextMap);
    void patchChannelVisual({ visualSettings: nextMap });
  };

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
              audioReactive={audioReactive}
              className="h-full w-full"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-white">
            <div>
              <p className="text-sm font-semibold">
                {presetLabel(previewPreset)}
              </p>
              <p className="text-xs text-white/75">
                {visualizerDescription(previewPreset)}
              </p>
            </div>
            <Eye size={18} aria-hidden />
          </div>
        </div>
        {previewPreset !== 'MINIMAL' ? (
          <label className="border-border text-foreground-secondary flex items-center gap-2 border-t px-4 py-3 text-xs">
            <input
              type="checkbox"
              checked={audioReactive}
              onChange={(event) => setAudioReactive(event.target.checked)}
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
                  <span className="block truncate text-sm font-medium">
                    {presetLabel(id)}
                    {active ? ' · active' : ''}
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
      instructionsHref: string;
      instructionsLabel: string;
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

const IMPORT_SERVICE_PLUGINS: ServicePlugin[] = importSourcePlugins
  .filter((s) => IMPORT_SOURCE_KINDS.has(s.kind) && s.id !== 'hearthis')
  .map((s) => ({
    id: s.id,
    name: s.name,
    author: s.kind === 'oauth' ? 'Connect' : 'Tool',
    description: s.description,
    tags: ['import'],
    action: { kind: 'deep-link', to: s.studioDeepLink ?? `/sources/${s.id}` },
  }));

const EXPORT_SERVICE_PLUGINS: ServicePlugin[] = EXPORT_TARGETS.filter(
  (target) => target.id !== 'hearthis',
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
  action: { kind: 'deep-link', to: '/sources/hearthis' },
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

function ServiceCategory({ categoryId }: { categoryId: PluginCategoryId }) {
  const plugins = SERVICE_PLUGINS.filter((p) => p.tags.includes(categoryId));
  return (
    <div className="flex flex-col gap-2">
      {plugins.map((p) => (
        <ServiceCard key={p.id} plugin={p} />
      ))}
    </div>
  );
}

function ServiceCard({ plugin }: { plugin: ServicePlugin }) {
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
    return <Link to={plugin.action.to}>{header}</Link>;
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
        <div className="flex gap-2 py-3">
          <Input
            label="Search Spotify"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button
            className="mt-6"
            size="sm"
            onClick={() => void search()}
            disabled={busy || !query.trim()}
          >
            <SearchIcon size={15} aria-hidden /> Search
          </Button>
        </div>
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
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

  const reload = () =>
    void fetchConnectionStatus(action.integrationId).then((r) =>
      setStatus(r.data),
    );

  useEffect(reload, [action.integrationId]);

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
            <Link to="/sources/$id" params={{ id: 'bandcamp' }}>
              <Button size="sm" variant="secondary">
                Open discography importer
              </Button>
            </Link>
          )}
          {action.integrationId === 'soundcloud' && (
            <div className="border-border flex flex-col gap-3 border-t pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link to="/sources/$id" params={{ id: 'soundcloud' }}>
                  <Button size="sm" variant="secondary">
                    Import SoundCloud tracks
                  </Button>
                </Link>
                <p className="text-foreground-secondary text-xs">
                  Import individual tracks or your entire catalog.
                </p>
              </div>
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
          <a
            href={action.instructionsHref}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline underline-offset-2"
          >
            {action.instructionsLabel} →
          </a>
        </>
      )}
    </ConfigurableCard>
  );
}

const HEARTHIS_SOURCES_PATH: string = '/sources/hearthis';

function HearthisCard({ plugin }: { plugin: ServicePlugin }) {
  const [handle, setHandle] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchMeProfile().then((r) => {
      setHandle(r.data.socialLinks?.hearthisAt ?? null);
    });
  }, []);

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
      }),
    );
  };

  return (
    <ConfigurableCard
      title={plugin.name}
      header={
        <Link to={HEARTHIS_SOURCES_PATH}>
          <PluginStoreItem
            name={plugin.name}
            author={plugin.author}
            description={plugin.description}
            isInstalled={Boolean(handle)}
            onInstall={() => {}}
            labels={{ install: 'Open', installed: 'Configured' }}
          />
        </Link>
      }
    >
      <p className="text-foreground-secondary text-sm">
        {handle
          ? `Current handle: @${handle}`
          : 'Add your hearthis.at username to import your tracks and sets.'}
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <Input
          label="hearthis.at username"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={handle ?? 'yourhandle'}
        />
        <Button size="sm" disabled={saving || !draft.trim()} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {msg && <p className="text-foreground-secondary text-xs">{msg}</p>}
      <p className="text-foreground-secondary text-xs">
        A hearthis.at Premium account is required to export your own tracks
        there — importing from hearthis.at works on any account.
      </p>
    </ConfigurableCard>
  );
}

// ── Multicast / Audio plugins ───────────────────────────────────────────────

function MulticastCategory() {
  const [targets, setTargets] = useState<RtmpTarget[] | null>(null);
  const [provider, setProvider] = useState<MulticastProviderId>('TWITCH');
  const [streamKey, setStreamKey] = useState('');
  const [address, setAddress] = useState('');
  const [port, setPort] = useState('1935');
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const reload = () => {
    void fetchRtmpTargets().then((r) => setTargets(r.data));
  };

  useEffect(() => {
    void fetchRtmpTargets().then((r) => setTargets(r.data));
  }, []);

  const isCustom = provider === 'CUSTOM';
  const addDestination = () => {
    if (!streamKey.trim() || (isCustom && !address.trim())) {
      return;
    }
    const rtmpUrl = isCustom
      ? `${address.trim().replace(/\/$/, '')}:${port.trim() || '1935'}`
      : undefined;
    void createRtmpTarget({
      provider,
      streamKey: streamKey.trim(),
      label: label.trim() || undefined,
      rtmpUrl,
    }).then((result) => {
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setStreamKey('');
      setAddress('');
      setLabel('');
      setMessage(`${multicastProviderLabel(provider)} destination added.`);
      reload();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h3 className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
          Stream destinations
        </h3>
        {multicastProviders.map((destination) => {
          const configured = targets?.some(
            (target) => target.provider === destination.id,
          );
          return (
            <PluginStoreItem
              key={destination.id}
              name={destination.label}
              author="Multicast"
              description={
                destination.rtmpUrlHint
                  ? `Mirror your live stream via ${destination.rtmpUrlHint}.`
                  : 'Mirror your live stream to a custom RTMP server.'
              }
              isInstalled={configured}
              onInstall={() => {
                setProvider(destination.id);
                setMessage(`${destination.label} selected below.`);
              }}
              labels={{
                install: 'Configure',
                installed: 'Configured',
              }}
            />
          );
        })}
      </div>

      <h3 className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
        Configured destinations
      </h3>
      {targets == null ? (
        <PageLoading label="Loading multistream destinations…" />
      ) : targets.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No multistream destinations configured yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {targets.map((t) => (
            <PluginItem
              key={t.id}
              icon={<Cast size={22} aria-hidden />}
              name={t.label || t.provider}
              author={multicastProviderLabel(t.provider)}
              description={`${t.enabled ? 'Enabled' : 'Disabled'} · ${t.rtmpUrl}${t.keyLast4 ? ` · key ···${t.keyLast4}` : ''}`}
              disabled={!t.enabled}
              rightAccessory={
                <Button
                  size="sm"
                  variant="text"
                  onClick={() =>
                    void patchRtmpTarget(t.id, {
                      enabled: !t.enabled,
                    }).then(reload)
                  }
                >
                  {t.enabled ? 'Disable' : 'Enable'}
                </Button>
              }
              onRemove={() => void deleteRtmpTarget(t.id).then(reload)}
            />
          ))}
        </ul>
      )}
      <div className="border-border flex flex-col gap-3 rounded-lg border p-3">
        <div>
          <h3 className="font-semibold">Add destination</h3>
          <p className="text-foreground-secondary text-xs">
            Choose a platform and enter the credential it uses for live
            streaming. Custom RTMP also needs its server address and port.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Platform"
            value={provider}
            onValueChange={(value) => setProvider(value as MulticastProviderId)}
            options={multicastProviders.map((item) => ({
              id: item.id,
              label: item.label,
            }))}
          />
          <Input
            label="Label (optional)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={multicastProviderLabel(provider)}
          />
        </div>
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
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label={isCustom ? 'Stream key' : 'Stream key / API key'}
            value={streamKey}
            onChange={(event) => setStreamKey(event.target.value)}
            placeholder={
              isCustom ? 'Paste stream key' : 'Paste platform credential'
            }
          />
          <Button
            size="sm"
            disabled={!streamKey.trim() || (isCustom && !address.trim())}
            onClick={addDestination}
          >
            Add destination
          </Button>
        </div>
        {message && (
          <p className="text-foreground-secondary text-xs">{message}</p>
        )}
      </div>
    </div>
  );
}

function AudioPluginsCategory() {
  const enabledPluginIds = useAudioFxStore((state) => state.enabledPluginIds);
  const togglePlugin = useAudioFxStore((state) => state.togglePlugin);

  return (
    <div className="flex flex-col gap-2">
      {ALL_PLUGIN_IDS.map((id) => {
        const meta = AUDIO_FX_PLUGINS[id];
        const enabled = enabledPluginIds.includes(id);
        return (
          <div
            key={id}
            className="border-border bg-background-secondary/40 flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0 flex-1">
              <PluginStoreItem
                name={meta.label}
                author="Pro Editor"
                description={meta.description}
                onInstall={() => togglePlugin(id)}
                labels={{ install: enabled ? 'Activated' : 'Activate' }}
                isInstalled={enabled}
              />
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label={`${enabled ? 'Deactivate' : 'Activate'} ${meta.label}`}
              onClick={() => togglePlugin(id)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors ${enabled ? 'border-primary bg-primary' : 'border-border bg-background'}`}
            >
              <span
                className={`size-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
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
  const [logoUrlManualOpen, setLogoUrlManualOpen] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  useEffect(() => {
    setLogoUrlDraft(editingStation?.logoUrl ?? '');
    setLogoUrlManualOpen(false);
  }, [editingStation]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestLogoUrl, setSuggestLogoUrl] = useState('');
  const [suggestLanguage, setSuggestLanguage] = useState('');
  const [suggestBitrate, setSuggestBitrate] = useState('');
  const [suggestStreamUrl, setSuggestStreamUrl] = useState('');
  const [suggestBusy, setSuggestBusy] = useState(false);
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
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

      <div className="flex flex-col gap-2">
        {RADIO_STATIONS.map((baseStation) => {
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
              name={station.name}
              author={station.language}
              description={`${station.genre} · ${station.bitrateKbps}kbps ${station.codec} · ${sourceConfigured ? 'Source configured' : 'Add a stream source in Configure'}`}
              warning={!sourceConfigured}
              warningText="This station needs a stream source before it can be played."
              disabled={!enabled && sourceConfigured}
              rightAccessory={
                <div className="flex gap-1">
                  <Button
                    size="icon-sm"
                    variant={stationIsPlaying ? undefined : 'secondary'}
                    disabled={!sourceConfigured}
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
                  <Button
                    size="sm"
                    variant={enabled ? undefined : 'secondary'}
                    onClick={() => toggleStation(station.id)}
                  >
                    {enabled ? 'Enabled' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => setEditingStation(station)}
                  >
                    Configure
                  </Button>
                </div>
              }
              onViewDetails={
                sourceConfigured ? undefined : () => setEditingStation(station)
              }
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
                streamUrl: String(form.get('streamUrl') ?? '').trim() || null,
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
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Cover image</span>
                  <Button
                    size="icon-sm"
                    variant="text"
                    aria-label="Use an image URL instead"
                    title="Use an image URL instead"
                    aria-pressed={logoUrlManualOpen}
                    onClick={() => setLogoUrlManualOpen((open) => !open)}
                  >
                    <LinkIcon size={15} aria-hidden />
                  </Button>
                </div>
                {logoUrlManualOpen ? (
                  <Input
                    label="Cover image URL"
                    value={logoUrlDraft}
                    onChange={(event) => setLogoUrlDraft(event.target.value)}
                  />
                ) : (
                  <FilePicker
                    accept="image/jpeg,image/png,image/webp"
                    disabled={logoUploading}
                    labels={{
                      title: 'Station cover image',
                      description: 'JPEG, PNG, or WebP',
                      browse: 'Choose image',
                    }}
                    onFiles={(files) => {
                      const file = files[0];
                      if (!file) {
                        return;
                      }
                      setLogoUploading(true);
                      void uploadUserMediaFile(file).then((result) => {
                        setLogoUploading(false);
                        if (!result.ok) {
                          toast.error(result.error);
                          return;
                        }
                        setLogoUrlDraft(result.data.url);
                      });
                    }}
                  />
                )}
                <input type="hidden" name="logoUrl" value={logoUrlDraft} />
                {logoUrlDraft && (
                  <img
                    src={logoUrlDraft}
                    alt=""
                    className="border-border mt-1 size-16 rounded-md border object-cover"
                  />
                )}
              </div>
              <Input
                name="streamUrl"
                label="Programming source / stream URL"
                defaultValue={editingStation.streamUrl ?? ''}
                className="sm:col-span-2"
              />
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

function EmbedCategory() {
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

  return (
    <div className="flex flex-col gap-3">
      <ConfigurableCard
        title="Favorites"
        header={
          <PluginStoreItem
            name="Favorites"
            author="Tahti"
            description="Show your favorite channels and tracks as a section on Listen."
            category="Listen"
            isInstalled={installedTypeIds.includes('favorites')}
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
      {LISTENER_WIDGET_TYPES.map((type) => {
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

  return <DiscoWidgetManagerPanel scope="LISTENER" />;
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
