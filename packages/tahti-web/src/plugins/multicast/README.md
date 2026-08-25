# Multicast

The list of RTMP destinations a broadcast can mirror to (YouTube, Twitch,
Facebook, Kick, TikTok, Mixcloud Live, Instagram, or a custom RTMP URL) —
a typed registry, not a behavioral plugin. Each provider is just data:
`{id, label, rtmpUrlHint?}`. `RtmpTarget` CRUD (`src/api/broadcast.ts`)
does the actual work; this registry only supplies the dropdown options and
display labels.

## Contract

```ts
interface MulticastProvider {
  id: string; // wire value stored on RtmpTarget.provider
  label: string;
  rtmpUrlHint?: string; // shown as a hint in the add-destination form
}
```

`multicastProviders: MulticastProvider[]` — the full list, in the order
the add-destination dropdown shows them. `multicastProviderLabel(id)` —
resolves an id to its display label, falling back to the raw id for an
unrecognized one.

## Source of truth

`providers.ts` mirrors `PROVIDER_RTMP_URLS` in
`tahti-org/apps/api/src/routes/me/rtmp-targets.ts` — **the API is
authoritative** on which providers exist and which have a fixed ingest URL
vs. requiring `CUSTOM` + a user-supplied one. This registry existing at
all is what caught a real bug: the old inline dropdown only had 5 of the
8 providers the API actually supported (missing TikTok, Mixcloud Live,
Instagram). When the API adds a provider, this file needs a matching
entry — nothing enforces that automatically, so check
`rtmp-targets.ts` if a provider looks stale.

## Consumers

`StudioGoLiveView.tsx` (the add-destination dropdown + display labels) and
`StreamManagerPanel.tsx` (read-only display labels).

## Known gap

`RtmpTarget.provider` (`api/broadcast.ts`) is still a plain `string`, not
typed against `MulticastProvider['id']` — nothing stops a typo creating an
untracked provider id. See
[`../../../PLUGIN-STORE-PLAN.md`](../../../PLUGIN-STORE-PLAN.md) §3 for
what a tighter version of this would need (also: de-duplicating
`StudioGoLiveView`'s add form from `StreamManagerPanel`'s display into one
shared component).
