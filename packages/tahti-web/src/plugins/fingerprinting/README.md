# Fingerprinting

Identifies whether an uploaded track matches something already released,
via AcoustID. Currently one provider, but structured as a real interface
so a second one is a sibling module, not a branch inside existing code.

## Contract

```ts
interface FingerprintProvider {
  id: string;
  label: string;
  match(releaseId: string, trackId: string): Promise<FingerprintOutcome>;
  check(releaseId: string, trackId: string): Promise<FingerprintOutcome>;
}

type FingerprintOutcome =
  | { ok: true; data: FingerprintResult }
  | { ok: false; error: string };
```

`match()` re-runs the fingerprint + match lookup and **replaces** whatever
is currently stored. `check()` runs the same lookup but **never
overwrites** the stored fingerprint/match — a preview-only "does this
match anything" call.

## Where the HTTP lives

`acoustid.ts` wraps `refingerprintTrack`/`checkTrackFingerprint` from
`../../api/studio.ts` rather than reimplementing the request logic here —
those functions share `api/studio.ts`'s private `requestJson`/mock-fallback
plumbing with ~1300 lines of unrelated studio API calls, so the actual
HTTP stayed there. This plugin is the *contract*, not a relocation of the
network code.

## Consumers

`FingerprintTrackPanel.tsx` (the per-track "Re-fingerprint" / "Check for a
match" widget on `StudioReleaseDetailView.tsx`) calls
`acoustIdProvider.match(...)` / `.check(...)` — never the raw
`api/studio.ts` functions directly.

## Extending

A second provider means a new module (e.g. `chromaprint.ts`) implementing
`FingerprintProvider`, added to `fingerprintProviders` in `index.ts`.
Nothing about `FingerprintTrackPanel.tsx` needs to change unless it needs
to let the user *pick* a provider (today it's hardcoded to
`acoustIdProvider`). See
[`../../../PLUGIN-STORE-PLAN.md`](../../../PLUGIN-STORE-PLAN.md) §6.
