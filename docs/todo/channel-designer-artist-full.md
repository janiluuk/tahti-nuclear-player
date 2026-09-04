# Channel Designer → artist page full control

**Status:** client wired to look-extras API (2026-09-04). Sibling
`feat/channel-look-extras` adds Prisma columns + PATCH/GET; Nuclear sends
look extras on `/api/me/channel/visual` and normalizes `channelLinksJson`.

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

## Remaining

1. **Merge sibling [tahti-org#435](https://github.com/janiluuk/tahti-org/pull/435)**
   (`feat/channel-look-extras`); then drop localStorage as source of truth
   (keep as cache until migration is live in all envs). Nuclear client
   wiring shipped as `0.0.71` (`56a2fcdeb`).
2. **`textOverlay*` ↔ `textLayer*`** — still a separate text-layer PATCH;
   naming mismatch is intentional (designer vs API).
3. E2E parity still targets `/channel/` more than `/u/:username`.

## Files

- `EntitySocialHeader.tsx`, `ArtistView.tsx`, `ChannelView.tsx`,
  `ChannelBackdropCard.tsx`, `ChannelDesigner.tsx`, `channel-design.ts`
- Storybook: EntitySocialHeader GRADIENT story
