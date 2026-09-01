import type { AdvancedTheme } from '@nuclearplayer/themes';

/** Stable id so seeding is idempotent across reloads (unlike
 * `importCustomTheme`'s generated `custom:<slug>-<timestamp>` ids). */
export const TAHTI_BLUE_THEME_ID = 'custom:tahti-blue';

/** The tahti.live pitch palette, re-expressed as an installable custom
 * theme (see `packages/themes/src/basic/tahti-dark.css` for the built-in
 * chrome theme this mirrors — same OKLCH values, exact colour match).
 * Ships pre-installed in the theme store's "Your imported themes" list;
 * `vars` and `dark` are identical since the pitch has a single fixed-dark
 * identity, not a separate light variant. */
// The pitch has one fixed-dark identity, not a separate light variant, so
// the same values are used for both `vars` (light) and `dark` overrides —
// the theme looks identical whichever appearance mode is active.
const TAHTI_BLUE_VARS: Record<string, string> = {
  background: 'oklch(0.1663 0.0402 274.37)',
  'background-secondary': 'oklch(0.2264 0.0552 275.84)',
  'background-input': 'oklch(0.187 0.0486 275.27)',
  foreground: 'oklch(0.976 0.007 268.55)',
  'foreground-secondary': 'oklch(0.7359 0.055 275.54)',
  'foreground-input': 'oklch(0.976 0.007 268.55)',
  primary: 'oklch(0.68 0.16 55)',
  'primary-foreground': 'oklch(0.1663 0.0262 269.37)',
  secondary: 'oklch(0.39 0.105 183.63)',
  'secondary-foreground': 'oklch(0.96 0.025 183.63)',
  border: 'oklch(0.3482 0.0705 275.74)',
  'border-input': 'oklch(0.3482 0.0705 275.74)',
  ring: 'oklch(0.8131 0.165 75.04)',
  'accent-green': 'oklch(0.7923 0.13 183.63)',
  'accent-yellow': 'oklch(0.7334 0.1584 68.72)',
  'accent-purple': 'oklch(0.7289 0.1402 272.62)',
  'accent-blue': 'oklch(0.7289 0.1402 272.62)',
  'accent-orange': 'oklch(0.8131 0.165 75.04)',
  'accent-cyan': 'oklch(0.7923 0.13 183.63)',
  'accent-red': 'oklch(0.7088 0.1839 29.06)',
  'accent-foreground': 'oklch(0.1663 0.0262 269.37)',
  'radius-card': '16px',
  'radius-control': '10px',
  'radius-input': '8px',
  'radius-pill': '20px',
  'font-family': "'Inter', system-ui, -apple-system, sans-serif",
  'default-font-family': "'Inter', system-ui, -apple-system, sans-serif",
  'font-family-heading': "'Space Grotesk', var(--default-font-family)",
  'font-family-mono':
    "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export const TAHTI_BLUE_THEME: AdvancedTheme = {
  version: 1,
  name: 'Tahti Blue',
  author: 'Tahti',
  description:
    'Deep ink-blue background with an amber signal and teal accent — the tahti.live pitch palette.',
  tags: ['dark', 'tahti'],
  palette: [
    'oklch(0.68 0.16 55)',
    'oklch(0.7923 0.13 183.63)',
    'oklch(0.2264 0.0552 275.84)',
    'oklch(0.1663 0.0402 274.37)',
  ],
  vars: TAHTI_BLUE_VARS,
  dark: TAHTI_BLUE_VARS,
};

export const NUCLEAR_GREEN_THEME_ID = 'custom:nuclear-green';

/** Colours sampled directly from the user's `nuclear.png` reference
 * screenshot (the original Nuclear player's dark teal look) — not
 * hand-picked. One fixed-dark identity, like Tahti Blue: the reference has
 * no light variant. Deliberately doesn't touch `--shadow-x/y`,
 * `--border-width`, or radius — those are the shared neobrutalist depth
 * tokens (Button/Card in @nuclearplayer/ui already read them), and inherit
 * root's 2px offset-shadow/border treatment so this theme automatically
 * gets the same chunky depth as every other theme once applied. */
const NUCLEAR_GREEN_VARS: Record<string, string> = {
  background: '#0c1915',
  'background-secondary': '#142621',
  'background-input': '#0a1512',
  foreground: '#dadfde',
  'foreground-secondary': '#8fa39d',
  'foreground-input': '#dadfde',
  primary: '#338c77',
  'primary-foreground': '#dadfde',
  secondary: '#2b6357',
  'secondary-foreground': '#dadfde',
  border: '#435c55',
  'border-input': '#435c55',
  ring: '#338c77',
};

export const NUCLEAR_GREEN_THEME: AdvancedTheme = {
  version: 1,
  name: 'Nuclear Green',
  author: 'Tahti',
  description:
    "Deep green-black background with a teal signal — the original Nuclear player's dark look.",
  tags: ['dark', 'nuclear'],
  palette: ['#338c77', '#2b6357', '#142621', '#0c1915'],
  vars: NUCLEAR_GREEN_VARS,
  dark: NUCLEAR_GREEN_VARS,
};
