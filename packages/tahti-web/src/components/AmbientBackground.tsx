import { useAmbientStore } from '../stores/ambientStore';
import { ChannelVisualizer } from './ChannelVisualizer';

const AMBIENT_SCHEME = {
  accent: '#22D3EE',
  highlight: '#A78BFA',
  bg: '#0A0E1A',
  text: '#F8FAFC',
  muted: '#64748B',
};

export function AmbientBackground() {
  const enabled = useAmbientStore((state) => state.enabled);
  const preset = useAmbientStore((state) => state.preset);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-20 mix-blend-screen"
      aria-hidden
      data-ambient-background
    >
      <ChannelVisualizer
        preset={preset}
        colorScheme={AMBIENT_SCHEME}
        visualSettingsJson={`{"${preset}":{"speed":0.16,"intensity":0.7}}`}
        className="h-full w-full"
      />
    </div>
  );
}
