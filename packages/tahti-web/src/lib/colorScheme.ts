/**
 * Normalize channel/artist color schemes from API (`bg`/`text`) or legacy
 * public DTOs (`background`/`foreground`) into one shape for UI/visualizers.
 */
export type NormalizedColorScheme = {
  accent: string;
  highlight: string;
  bg: string;
  text: string;
  muted: string;
  /** Aliases for older call sites. */
  background: string;
  foreground: string;
};

const FALLBACK: NormalizedColorScheme = {
  accent: '#22D3EE',
  highlight: '#A78BFA',
  bg: '#0B1220',
  text: '#F8FAFC',
  muted: '#64748B',
  background: '#0B1220',
  foreground: '#F8FAFC',
};

export type LooseColorScheme =
  | {
      accent?: string | null;
      highlight?: string | null;
      bg?: string | null;
      text?: string | null;
      muted?: string | null;
      background?: string | null;
      foreground?: string | null;
    }
  | null
  | undefined;

export function normalizeColorScheme(
  scheme: LooseColorScheme,
): NormalizedColorScheme {
  if (!scheme) {
    return { ...FALLBACK };
  }
  const bg = scheme.bg ?? scheme.background ?? FALLBACK.bg;
  const text = scheme.text ?? scheme.foreground ?? FALLBACK.text;
  const accent = scheme.accent ?? FALLBACK.accent;
  const highlight = scheme.highlight ?? FALLBACK.highlight;
  const muted = scheme.muted ?? FALLBACK.muted;
  return {
    accent,
    highlight,
    bg,
    text,
    muted,
    background: bg,
    foreground: text,
  };
}

/** CSS variables for painting channel-branded chrome (header card, sections). */
export function colorSchemeCssVars(
  scheme: LooseColorScheme,
): Record<string, string> {
  const n = normalizeColorScheme(scheme);
  return {
    '--channel-bg': n.bg,
    '--channel-text': n.text,
    '--channel-accent': n.accent,
    '--channel-highlight': n.highlight,
    '--channel-muted': n.muted,
  };
}
