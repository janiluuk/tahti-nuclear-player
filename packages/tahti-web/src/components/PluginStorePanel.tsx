import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { PluginItem, PluginStoreItem, Tabs } from '@nuclearplayer/ui';

import { fetchRtmpTargets, type RtmpTarget } from '../api/broadcast';
import { VISUAL_PRESETS } from '../api/channel-design';
import { SOURCE_DEFS } from '../api/sources';
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

/** Unified browser across the app's 7 independent "plugin-shaped"
 * subsystems — see PLUGIN-STORE-PLAN.md for what actually turning each
 * one into a real, removable plugin would take. This view is the
 * navigation/launcher layer over the *existing* implementations, not a
 * new plugin runtime: themes apply in place (the one category with a
 * trivial, safe global toggle), everything else opens its real settings
 * surface, which still owns the actual editing UI. */
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
      {categoryId === 'export' && <ExportCategory />}
      {categoryId === 'import' && <ImportCategory />}
      {categoryId === 'multicast' && <MulticastCategory />}
      {categoryId === 'fingerprinting' && <FingerprintingCategory />}
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
  const openSettings = useSettingsModalStore((s) => s.open);
  return (
    <div className="flex flex-col gap-2">
      {VISUAL_PRESETS.map((id) => (
        <PluginStoreItem
          key={id}
          name={presetLabel(id)}
          author="Tahti"
          description={VISUALIZER_DESCRIPTIONS[id] ?? 'Visual preset'}
          onInstall={() => openSettings('channel')}
          labels={{ install: 'Open in Channel design' }}
        />
      ))}
    </div>
  );
}

function ExportCategory() {
  return (
    <div className="flex flex-col gap-2">
      {EXPORT_TARGETS.map((t) => (
        <Link key={t.id} to={t.to}>
          <PluginStoreItem
            name={t.label}
            author="Tahti distribution"
            description={t.note}
            onInstall={() => {}}
            labels={{ install: 'Open' }}
          />
        </Link>
      ))}
    </div>
  );
}

function ImportCategory() {
  return (
    <div className="flex flex-col gap-2">
      {SOURCE_DEFS.filter((s) => IMPORT_SOURCE_KINDS.has(s.kind)).map((s) => (
        <Link key={s.id} to={s.studioDeepLink ?? `/sources/${s.id}`}>
          <PluginStoreItem
            name={s.name}
            author={s.kind === 'oauth' ? 'Connect' : 'Tool'}
            description={s.description}
            onInstall={() => {}}
            labels={{ install: 'Open' }}
          />
        </Link>
      ))}
    </div>
  );
}

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

function FingerprintingCategory() {
  return (
    <div className="flex flex-col gap-2">
      <PluginStoreItem
        name="AcoustID"
        author="Built-in"
        description="Matches uploaded tracks against AcoustID for catalog metadata — the only provider wired up today."
        isInstalled
        onInstall={() => {}}
        labels={{ installed: 'Active' }}
      />
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
