/**
 * Every provider `RtmpTarget.provider` (`api/broadcast.ts`) is allowed to
 * be, mirroring `PROVIDER_RTMP_URLS` in
 * `tahti-org/apps/api/src/routes/me/rtmp-targets.ts`. Add a provider here
 * first, then in `providers.ts` — the compiler then makes sure the two
 * can't drift back apart the way the pre-extraction dropdown did.
 */
export type MulticastProviderId =
  | 'YOUTUBE'
  | 'TWITCH'
  | 'FACEBOOK'
  | 'KICK'
  | 'TIKTOK'
  | 'MIXCLOUD_LIVE'
  | 'INSTAGRAM'
  | 'CUSTOM';

/**
 * A multistream destination Tahti can mirror a broadcast to. `id` is the
 * wire value stored on `RtmpTarget.provider` — add a destination by
 * adding an entry here, not by hardcoding a string in a host view's
 * dropdown.
 */
export interface MulticastProvider {
  id: MulticastProviderId;
  label: string;
  /** Example ingest URL shown as a hint in the add-destination form. */
  rtmpUrlHint?: string;
}
