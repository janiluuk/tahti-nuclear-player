/**
 * A multistream destination Tahti can mirror a broadcast to. `id` is the
 * wire value stored on `RtmpTarget.provider` (see `api/broadcast.ts`) — add
 * a destination by adding an entry here, not by hardcoding a string in a
 * host view's dropdown.
 */
export interface MulticastProvider {
  id: string;
  label: string;
  /** Example ingest URL shown as a hint in the add-destination form. */
  rtmpUrlHint?: string;
}
