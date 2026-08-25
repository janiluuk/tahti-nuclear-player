import { Link } from '@tanstack/react-router';
import { SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Button,
  Input,
  PluginItem,
  PluginStoreItem,
  Slider,
  Tabs,
} from '@nuclearplayer/ui';

import { fetchRtmpTargets, type RtmpTarget } from '../api/broadcast';
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
  disconnectIntegration,
  fetchConnectionStatus,
  oauthStartUrl,
  SOURCE_DEFS,
  type IntegrationId,
} from '../api/sources';
import { fetchMeProfile, patchMeProfile } from '../api/studio-extras';
import {
  PLUGIN_CATEGORIES,
  type PluginCategoryId,
} from '../content/pluginStoreCategories';
import { EXPORT_TARGETS } from '../lib/exportTargets';
import { ALL_PLUGIN_IDS, PLUGIN_META } from '../lib/proEditorPlugins';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { useThemeStore } from '../stores/themeStore';

const VISUALIZER_DESCRIPTIONS: Record<string, string> = {
  MINIMAL: 'A quiet baseline — subtle motion, no distraction.',
  WATER_RIPPLE: 'Concentric ripples reacting to the beat.',
  WAVEFORM_BARS: 'Classic vertical bar spectrum.',
  PARTICLE_FIELD: 'Drifting particles that pulse with the mix.',
  AURORA: 'Slow-moving colour bands, aurora-style.',
  REACTIVE_GRID: 'A grid that flexes with the low end.',
  CLOUDSCAPE: 'Soft volumetric clouds, gentle motion.',
  LINE_TANGLE: 'Generative tangled line art.',
  BACKDROP_BOX: 'A framed backdrop panel behind your stream.',
  LENS_FLARES: 'Cinematic flares timed to peaks.',
  IES_SPOTLIGHT: 'A studio spotlight sweep.',
};

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
  defaultOpen = false,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
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
      {open && (
        <div className="border-border bg-background-secondary/40 ml-2 flex flex-col gap-3 rounded-lg border p-4">
          {children}
        </div>
      )}
    </div>
  );
}

/** Unified browser across the app's plugin-shaped subsystems — see
 * PLUGIN-STORE-PLAN.md for what actually turning each one into a real,
 * removable plugin would take. This view is the navigation/config layer
 * over the *existing* implementations, not a new plugin runtime: themes
 * apply in place, visualizer/hearthis/MusicBrainz configure inline
 * (real API calls, not stubs), everything else opens its real settings
 * surface, which still owns the actual editing UI.
 *
 * Import/Export/Fingerprinting share one tagged registry (`SERVICE_PLUGINS`
 * below) so a service that spans categories — hearthis.at is both an
 * import source and an export target — is one entry with multiple tags,
 * not duplicated per category. */
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

  return (
    <div className="flex flex-col gap-2">
      {all.map((t) => (
        <PluginStoreItem
          key={t.id}
          name={t.name}
          author={t.author}
          description={t.id === themeId ? 'Currently applied' : 'Available'}
          isInstalled={t.id === themeId}
          onInstall={() => setTheme(t.id)}
          labels={{ install: 'Apply', installed: 'Active' }}
        />
      ))}
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
  const [settingsMap, setSettingsMap] = useState<VisualSettingsMap>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    void fetchChannelVisual().then((r) => {
      setPreset(r.data.visualPreset);
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

  return (
    <div className="flex flex-col gap-2">
      {VISUAL_PRESETS.map((id) => {
        const tuning = resolveVisualPresetSettings(settingsMap, id);
        const isTunable = id !== 'MINIMAL';
        return (
          <ConfigurableCard
            key={id}
            header={
              <PluginStoreItem
                name={presetLabel(id)}
                author="Tahti"
                description={VISUALIZER_DESCRIPTIONS[id] ?? 'Visual preset'}
                isInstalled={preset === id}
                onInstall={() => usePreset(id)}
                labels={{
                  install: saving === id ? 'Applying…' : 'Use this preset',
                  installed: 'In use',
                }}
              />
            }
          >
            {isTunable ? (
              <>
                <Slider
                  label="Speed"
                  min={0.25}
                  max={2}
                  step={0.05}
                  value={tuning.speed}
                  showValue
                  onValueChange={(v) => saveTuning(id, { ...tuning, speed: v })}
                >
                  <Slider.Surface>
                    <Slider.Track />
                    <Slider.RangeInput />
                  </Slider.Surface>
                </Slider>
                <Slider
                  label="Intensity"
                  min={0.25}
                  max={2}
                  step={0.05}
                  value={tuning.intensity}
                  showValue
                  onValueChange={(v) =>
                    saveTuning(id, { ...tuning, intensity: v })
                  }
                >
                  <Slider.Surface>
                    <Slider.Track />
                    <Slider.RangeInput />
                  </Slider.Surface>
                </Slider>
                <Button
                  size="sm"
                  variant="text"
                  className="self-start"
                  onClick={() => saveTuning(id, DEFAULT_VISUAL_PRESET_SETTINGS)}
                >
                  Reset to default
                </Button>
              </>
            ) : (
              <p className="text-foreground-secondary text-xs">
                Minimal has no tunable speed/intensity.
              </p>
            )}
          </ConfigurableCard>
        );
      })}
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

const IMPORT_SERVICE_PLUGINS: ServicePlugin[] = SOURCE_DEFS.filter(
  (s) => IMPORT_SOURCE_KINDS.has(s.kind) && s.id !== 'hearthis',
).map((s) => ({
  id: s.id,
  name: s.name,
  author: s.kind === 'oauth' ? 'Connect' : 'Tool',
  description: s.description,
  tags: ['import'],
  action: { kind: 'deep-link', to: s.studioDeepLink ?? `/sources/${s.id}` },
}));

const EXPORT_SERVICE_PLUGINS: ServicePlugin[] = EXPORT_TARGETS.map((t) => ({
  id: `export-${t.id}`,
  name: t.label,
  author: 'Tahti distribution',
  description: t.note,
  tags: ['export'],
  action: { kind: 'deep-link', to: t.to },
}));

// hearthis.at spans two categories — one entry, two tags — rather than a
// duplicated card per category (see the file-level doc comment).
const HEARTHIS_PLUGIN: ServicePlugin = {
  id: 'hearthis',
  name: 'hearthis.at',
  author: 'Import & export',
  description:
    "Search hearthis.at's public catalogue to import tracks and sets, or export your own releases there.",
  tags: ['import', 'export'],
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

  const reload = () =>
    void fetchConnectionStatus(action.integrationId).then((r) =>
      setStatus(r.data),
    );

  useEffect(reload, [action.integrationId]);

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
      defaultOpen={Boolean(status && !status.connected)}
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
      defaultOpen={handle === null}
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

  useEffect(() => {
    void fetchRtmpTargets().then((r) => setTargets(r.data));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {targets == null ? (
        <p className="text-foreground-secondary text-sm">Loading…</p>
      ) : targets.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No multistream destinations configured yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {targets.map((t) => (
            <PluginItem
              key={t.id}
              name={t.label || t.provider}
              author={t.provider}
              description={t.enabled ? 'Enabled' : 'Disabled'}
            />
          ))}
        </ul>
      )}
      <Link to="/studio/go-live">
        <PluginStoreItem
          name="Manage multistream destinations"
          author="Studio"
          description="Add, enable, or remove RTMP mirror destinations."
          onInstall={() => {}}
          labels={{ install: 'Open' }}
        />
      </Link>
    </div>
  );
}

function AudioPluginsCategory() {
  return (
    <div className="flex flex-col gap-2">
      {ALL_PLUGIN_IDS.map((id) => {
        const meta = PLUGIN_META[id];
        return (
          <Link key={id} to="/studio/archive">
            <PluginStoreItem
              name={meta.label}
              author="Pro Editor"
              description={meta.description}
              onInstall={() => {}}
              labels={{ install: 'Open Pro Editor' }}
            />
          </Link>
        );
      })}
    </div>
  );
}
