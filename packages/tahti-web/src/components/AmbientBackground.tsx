import { useThemeStore } from '../plugins/themes';
import { useAmbientStore } from '../stores/ambientStore';
import { ChannelVisualizer } from './ChannelVisualizer';
import { isThemeVisualizationEnabled } from './ThemeVisualizationSettings';

export const AMBIENT_SCHEME = {
  accent: '#22D3EE',
  highlight: '#A78BFA',
  bg: '#0A0E1A',
  text: '#F8FAFC',
  muted: '#64748B',
};

export function AmbientBackground() {
  const enabled = useAmbientStore((state) => state.enabled);
  const preset = useAmbientStore((state) => state.preset);
  const opacity = useAmbientStore((state) => state.opacity);
  const speed = useAmbientStore((state) => state.speed);
  const intensity = useAmbientStore((state) => state.intensity);
  const audioReactive = useAmbientStore((state) => state.audioReactive);
  const themeId = useThemeStore((state) => state.themeId);

  if (!enabled || !isThemeVisualizationEnabled(themeId)) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 mix-blend-screen"
      style={{ opacity }}
      aria-hidden
      data-ambient-background
    >
      <ChannelVisualizer
        preset={preset}
        colorScheme={AMBIENT_SCHEME}
        visualSettingsJson={`{"${preset}":{"speed":${speed},"intensity":${intensity}}}`}
        audioReactive={audioReactive}
        className="h-full w-full"
      />
    </div>
  );
}
