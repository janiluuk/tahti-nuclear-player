/** Layout variations for the "now playing" title/artist text overlay shown
 * on a channel's hero (live broadcast or any archive track played from that
 * channel) — see NowPlayingOverlay.tsx for the actual rendering of each. */

export type NowPlayingOverlayPresetId =
  | 'classic'
  | 'centered'
  | 'minimal'
  | 'edge';

export type NowPlayingOverlayPreset = {
  id: NowPlayingOverlayPresetId;
  name: string;
  description: string;
};

export const NOW_PLAYING_OVERLAY_PRESETS: NowPlayingOverlayPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Cover thumbnail with stacked title and artist, bottom-left.',
  },
  {
    id: 'centered',
    name: 'Centered',
    description: 'Title and artist centered together over the artwork.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'One compact line — lets the artwork or visualizer breathe.',
  },
  {
    id: 'edge',
    name: 'Edge',
    description: 'Title bottom-left, artist bottom-right, cover top-right.',
  },
];

export const DEFAULT_NOW_PLAYING_OVERLAY_PRESET: NowPlayingOverlayPresetId =
  'classic';

export function isNowPlayingOverlayPreset(
  value: string | null | undefined,
): value is NowPlayingOverlayPresetId {
  return (
    !!value && NOW_PLAYING_OVERLAY_PRESETS.some((preset) => preset.id === value)
  );
}

export function resolveNowPlayingOverlayPreset(
  value: string | null | undefined,
): NowPlayingOverlayPresetId {
  return isNowPlayingOverlayPreset(value)
    ? value
    : DEFAULT_NOW_PLAYING_OVERLAY_PRESET;
}
