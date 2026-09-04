# Channel Designer → artist page full control

**Status:** implemented client-side (2026-09-04). Remaining gaps are API.

## Done on artist page (`ArtistView`)

- Header: `headerStyle` (GRADIENT/SOLID/VIDEO_LOOP), `videoBackgroundUrl`,
  color scheme, visualizer preset + `visualSettingsJson` via
  `EntitySocialHeader`
- Player stage: separate player gradient when enabled, visualizer preset /
  settings, `NowPlayingOverlay`, player text overlay
- Page: background palette + ambient `backgroundVisualPreset` visualizer
- Look extras reload after Channel Designer save
- Designer: background visualizer preset picker (Backdrop)

## Done on channel page (`ChannelView`)

- Player vs header color schemes when `usePlayerGradient`
- Page background palette + ambient background visualizer
- Hero uses `visualSettingsJson` when present (else radio default tuning)

## Still unwired / missing (flagged)

1. **Live API columns** for look extras — `usePlayerGradient`,
   `playerColorSchemeJson`, `useBackgroundGradient`,
   `backgroundColorSchemeJson`, `backgroundVisualPreset`,
   `nowPlayingOverlay*`, `playerOverlay*`, `channelLinks`, `textOverlay*`
   remain `localStorage` (`tahti.channelLookExtras.{slug}`) until sibling
   API / Prisma adds them. Other browsers/devices will not see these.
2. **`brandAccentPreset`** not on `PublicChannel` — GRADIENT uses scheme
   colors; brand preset gradient string is designer-preview-only on live.
3. **`textLayer*` live API** vs designer `textOverlay*` naming mismatch —
   public GET may return text layers that designer still stores as extras.
4. **Nuclear app themes** (Settings themes) are global chrome, not a
   Channel Designer surface — by design.
5. E2E parity still targets `/channel/` more than `/u/:username`.

## Files

- `EntitySocialHeader.tsx`, `ArtistView.tsx`, `ChannelView.tsx`,
  `ChannelBackdropCard.tsx`, `ChannelDesigner.tsx`, `channel-design.ts`
- Storybook: EntitySocialHeader GRADIENT story
