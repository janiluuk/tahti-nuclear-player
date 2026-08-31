import type { EditList } from '../api/studio-types';

const SILENCE_THRESHOLD = 0.06;
const MIN_TRIM_SEC = 0.5;

/** Cuts leading/trailing near-silence off a track's peaks — a quick
 * approximation (peaks are already-bucketed amplitude, not raw PCM, so
 * this can't be as precise as a real silence-region detector) rather than
 * requiring the user to find and select the edges by hand. Shared by the
 * archive item quick-edit menu and the track edit dialog's Audio tab. */
export function autoTrimCuts(
  peaks: number[],
  durationSec: number,
): EditList['cuts'] {
  if (peaks.length === 0 || durationSec <= 0) {
    return [];
  }
  let lead = 0;
  while (lead < peaks.length && peaks[lead]! < SILENCE_THRESHOLD) {
    lead++;
  }
  let trail = peaks.length - 1;
  while (trail >= 0 && peaks[trail]! < SILENCE_THRESHOLD) {
    trail--;
  }
  const cuts: EditList['cuts'] = [];
  const leadSec = (lead / peaks.length) * durationSec;
  const trailSec = ((trail + 1) / peaks.length) * durationSec;
  if (leadSec >= MIN_TRIM_SEC) {
    cuts.push({ start: 0, end: leadSec });
  }
  if (durationSec - trailSec >= MIN_TRIM_SEC) {
    cuts.push({ start: trailSec, end: durationSec });
  }
  return cuts;
}
