import { lazy, Suspense, useEffect, useMemo, useState } from 'react';

import type { ThreeVisualizerProps } from './visuals/ThreeVisualizer';

export type VisualColorScheme = {
  accent?: string;
  highlight?: string;
  bg?: string;
  text?: string;
  muted?: string;
};

type Props = {
  preset?: string | null;
  colorScheme?: VisualColorScheme | null;
  colorSchemeJson?: string | null;
  visualSettingsJson?: string | null;
  className?: string;
  artworkUrl?: string | null;
  audioReactive?: boolean;
};

const ThreeVisualizer = lazy(() =>
  import('./visuals/ThreeVisualizer').then((module) => ({
    default: module.ThreeVisualizer,
  })),
);

const DEFAULT_SCHEME: Required<VisualColorScheme> = {
  accent: '#22D3EE',
  highlight: '#A78BFA',
  bg: '#0B1220',
  text: '#F8FAFC',
  muted: '#64748B',
};

const DEFAULT_SETTINGS = {
  speed: 1,
  intensity: 1,
};

function parseJson<T>(json: string | null | undefined): Partial<T> {
  if (!json) {
    return {};
  }

  try {
    return JSON.parse(json) as Partial<T>;
  } catch {
    return {};
  }
}

function parseScheme(
  scheme: VisualColorScheme | null | undefined,
  json: string | null | undefined,
): Required<VisualColorScheme> {
  const parsed = parseJson<VisualColorScheme>(json);

  return {
    accent: scheme?.accent ?? parsed.accent ?? DEFAULT_SCHEME.accent,
    highlight:
      scheme?.highlight ?? parsed.highlight ?? DEFAULT_SCHEME.highlight,
    bg: scheme?.bg ?? parsed.bg ?? DEFAULT_SCHEME.bg,
    text: scheme?.text ?? parsed.text ?? DEFAULT_SCHEME.text,
    muted: scheme?.muted ?? parsed.muted ?? DEFAULT_SCHEME.muted,
  };
}

function parseSettings(
  json: string | null | undefined,
  preset: string,
): ThreeVisualizerProps['settings'] {
  const parsed =
    parseJson<Record<string, { speed?: number; intensity?: number }>>(json);
  const settings = parsed[preset];

  return {
    speed: settings?.speed ?? DEFAULT_SETTINGS.speed,
    intensity: settings?.intensity ?? DEFAULT_SETTINGS.intensity,
  };
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export const ChannelVisualizer = ({
  preset,
  colorScheme,
  colorSchemeJson,
  visualSettingsJson,
  className,
  artworkUrl,
  audioReactive = true,
}: Props) => {
  const [canAnimate, setCanAnimate] = useState(false);
  const mode = (preset ?? 'AURORA').toUpperCase();
  const scheme = useMemo(
    () => parseScheme(colorScheme, colorSchemeJson),
    [colorScheme, colorSchemeJson],
  );
  const settings = useMemo(
    () => parseSettings(visualSettingsJson, mode),
    [mode, visualSettingsJson],
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    setCanAnimate(!reducedMotion && mode !== 'MINIMAL' && supportsWebGL());
  }, [mode]);

  const fallback = (
    <div
      className={className}
      aria-hidden
      style={{
        background: `radial-gradient(ellipse at 30% 20%, ${scheme.highlight}55, transparent 55%), radial-gradient(ellipse at 70% 80%, ${scheme.accent}33, ${scheme.bg})`,
      }}
    />
  );

  if (!canAnimate) {
    return fallback;
  }

  return (
    <Suspense fallback={fallback}>
      <ThreeVisualizer
        className={className}
        preset={mode}
        scheme={scheme}
        settings={settings}
        artworkUrl={artworkUrl}
        audioReactive={audioReactive}
      />
    </Suspense>
  );
};
