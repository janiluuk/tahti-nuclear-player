import type { MulticastProvider } from './types';

/**
 * Mirrors `PROVIDER_RTMP_URLS` in `tahti-org/apps/api/src/routes/me/rtmp-targets.ts`
 * — the API is the source of truth for which providers have a fixed ingest
 * URL vs. need `CUSTOM` + a user-supplied `rtmpUrl`. Keep in sync with that
 * file when the API adds a provider.
 */
export const multicastProviders: MulticastProvider[] = [
  {
    id: 'YOUTUBE',
    label: 'YouTube',
    rtmpUrlHint: 'rtmp://a.rtmp.youtube.com/live2',
  },
  { id: 'TWITCH', label: 'Twitch', rtmpUrlHint: 'rtmp://live.twitch.tv/app' },
  {
    id: 'FACEBOOK',
    label: 'Facebook',
    rtmpUrlHint: 'rtmps://live-api-s.facebook.com:443/rtmp',
  },
  { id: 'KICK', label: 'Kick' },
  {
    id: 'TIKTOK',
    label: 'TikTok',
    rtmpUrlHint: 'rtmp://push-rtmp.tiktok.com/live/',
  },
  {
    id: 'MIXCLOUD_LIVE',
    label: 'Mixcloud Live',
    rtmpUrlHint: 'rtmp://broadcast.mixcloud.com/live',
  },
  {
    id: 'INSTAGRAM',
    label: 'Instagram',
    rtmpUrlHint: 'rtmps://live-upload.instagram.com:443/rtmp',
  },
  { id: 'CUSTOM', label: 'Custom RTMP' },
];

export function multicastProviderLabel(id: string): string {
  return multicastProviders.find((p) => p.id === id)?.label ?? id;
}
