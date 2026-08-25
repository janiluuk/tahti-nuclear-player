import { checkTrackFingerprint, refingerprintTrack } from '../../api/studio';
import type { FingerprintProvider } from './types';

/** Tahti's only fingerprint provider today. Wraps the existing AcoustID
 * calls in `api/studio.ts` (which own the HTTP plumbing/mock fallback
 * shared with the rest of the studio API surface) behind the plugin
 * contract, so a second provider only needs a sibling module, not changes
 * here. */
export const acoustIdProvider: FingerprintProvider = {
  id: 'acoustid',
  label: 'AcoustID',
  match: refingerprintTrack,
  check: checkTrackFingerprint,
};
