import type { ProEditorPluginId } from '../../api/studio-types';
import { compPlugin } from './compressor';
import { eqPlugin } from './eq';
import { filterPlugin } from './filter';
import { limiterPlugin } from './limiter';
import type { AudioFxPlugin } from './types';

export type { AudioFxPlugin } from './types';

export const audioFxPlugins: AudioFxPlugin[] = [
  eqPlugin,
  compPlugin,
  limiterPlugin,
  filterPlugin,
];

export const ALL_PLUGIN_IDS: ProEditorPluginId[] = audioFxPlugins.map(
  (p) => p.id,
);

export const AUDIO_FX_PLUGINS: Record<ProEditorPluginId, AudioFxPlugin> =
  Object.fromEntries(audioFxPlugins.map((p) => [p.id, p])) as Record<
    ProEditorPluginId,
    AudioFxPlugin
  >;
