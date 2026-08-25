import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  CastIcon,
  FingerprintIcon,
  PaletteIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  type LucideIcon,
} from 'lucide-react';

/** The 7 categories the user asked to unify under one app-store-style
 * browser. Each one is a real, independent subsystem today (see
 * PLUGIN-STORE-PLAN.md for exactly where each lives and what moving it
 * behind a real plugin interface would take) — this registry is the
 * store's navigation layer, not a new plugin runtime. */
export type PluginCategoryId =
  | 'themes'
  | 'visualizers'
  | 'export'
  | 'import'
  | 'multicast'
  | 'fingerprinting'
  | 'audio-plugins';

export type PluginCategory = {
  id: PluginCategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const PLUGIN_CATEGORIES: PluginCategory[] = [
  {
    id: 'themes',
    label: 'Themes',
    description: 'App appearance — built-in palettes plus your own imports.',
    icon: PaletteIcon,
  },
  {
    id: 'visualizers',
    label: 'Visualizers',
    description:
      "Live visual presets for your channel page while you're on air.",
    icon: SparklesIcon,
  },
  {
    id: 'export',
    label: 'Export',
    description: 'DSPs your releases can be delivered to.',
    icon: ArrowUpFromLineIcon,
  },
  {
    id: 'import',
    label: 'Import',
    description: 'Services you can pull tracks and albums in from.',
    icon: ArrowDownToLineIcon,
  },
  {
    id: 'multicast',
    label: 'Multicast',
    description: 'Extra RTMP destinations your live stream mirrors to.',
    icon: CastIcon,
  },
  {
    id: 'fingerprinting',
    label: 'Fingerprinting',
    description: 'Audio fingerprint matching for catalog metadata.',
    icon: FingerprintIcon,
  },
  {
    id: 'audio-plugins',
    label: 'Audio plugins',
    description: 'DSP chain available in the Pro Editor.',
    icon: SlidersHorizontalIcon,
  },
];

export function pluginCategory(id: string): PluginCategory | undefined {
  return PLUGIN_CATEGORIES.find((c) => c.id === id);
}
