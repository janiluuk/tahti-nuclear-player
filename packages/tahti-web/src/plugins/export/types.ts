/**
 * A place a release or track can be pushed out to. This is a metadata
 * registry, not a behavioral plugin yet — every DSP with a fixed `to`
 * pointing at `/studio/distribution` goes through the same one Revelator
 * submission regardless of which target's tile got clicked, and the
 * Sources-backed targets (`bandcamp`, `soundcloud`, ...) deep-link into
 * the existing Sources flow rather than exposing their own submit/status
 * behavior. See PLUGIN-STORE-PLAN.md §4 for what a real `ExportProvider`
 * (submit/status/webhook) would need — that doesn't exist in the API yet,
 * so this doesn't fake one.
 */
export type ExportTarget = {
  id: string;
  label: string;
  note: string;
  color: string;
  to: string;
  supportsTracks: boolean;
};
