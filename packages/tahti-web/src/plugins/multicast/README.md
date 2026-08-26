# Multicast

The list of RTMP destinations a broadcast can mirror to (YouTube, Twitch,
Facebook, Kick, TikTok, Mixcloud Live, Instagram, or a custom RTMP URL) —
a typed registry, not a behavioral plugin. Each provider is just data:
`{id, label, rtmpUrlHint?}`. `RtmpTarget` CRUD (`src/api/broadcast.ts`)
does the actual work; this registry only supplies the dropdown options and
display labels.

## Contract

```ts
type MulticastProviderId =
  | 'YOUTUBE' | 'TWITCH' | 'FACEBOOK' | 'KICK'
  | 'TIKTOK' | 'MIXCLOUD_LIVE' | 'INSTAGRAM' | 'CUSTOM';

interface MulticastProvider {
  id: MulticastProviderId; // wire value stored on RtmpTarget.provider
  label: string;
  rtmpUrlHint?: string; // shown as a hint in the add-destination form
}
```

`RtmpTarget.provider` (`api/broadcast.ts`) is typed `MulticastProviderId`,
not a plain `string` — a typo in any consumer is a compile error, not a
silent untyped value on the wire.

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

`StudioGoLiveView.tsx` (add-destination dropdown + display labels),
`StreamManagerPanel.tsx` (read-only display labels), and `ConnectionsPanel`
in `SettingsPanels.tsx` (Settings → Broadcast → Multistream — its own
add-destination form, a `Select` sourced from `multicastProviders`).

## Known gap

`StudioGoLiveView`'s add-destination form and `SettingsPanels.tsx`'s
`ConnectionsPanel` are two separate components, each with their own
add-destination form reading the same registry. De-duplicating those into
one shared host component is real UI work, not something this extraction
attempted — see
[`../../../PLUGIN-STORE-PLAN.md`](../../../PLUGIN-STORE-PLAN.md) §3.
