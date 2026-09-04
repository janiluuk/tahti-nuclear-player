# Channel Designer → artist page full control

**Status:** done for look-extras persistence (2026-09-04). Sibling
[tahti-org#435](https://github.com/janiluuk/tahti-org/pull/435) merged +
prod migrated. Nuclear prefers live API fields; localStorage is cache-only.

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
- Links/Text overlay save PATCHes `/api/me/channel/visual` (+ text-layer)

## Remaining (optional)

1. **`textOverlay*` ↔ `textLayer*`** — still a separate text-layer PATCH;
   naming mismatch is intentional (designer vs API).
2. E2E parity still targets `/channel/` more than `/u/:username` (spec exists:
   `e2e/channel-designer-artist-look.spec.ts`).

## Files

- `EntitySocialHeader.tsx`, `ArtistView.tsx`, `ChannelView.tsx`,
  `ChannelBackdropCard.tsx`, `ChannelDesigner.tsx`, `channel-design.ts`
- Storybook: EntitySocialHeader GRADIENT story
