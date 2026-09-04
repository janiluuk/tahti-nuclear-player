# Channel Designer: background layer, presets, playlists

**Status:** implemented locally (pending version bump / deploy).

## Ask

- Cannot change page background color; Layers lacks banner/background.
- Presets: short descriptions only.
- Remove Tune-in actions.
- Drop page Text overlay block (already under Player); add **Add playlist**
  (pick from own library; multiple allowed).
- Playlist widget settings: choose which playlist; choose Cards vs Tracklist.

## Plan

1. Layers: always-on **Background** row → select `header` / Look Backdrop;
   surface page background color pickers prominently (not only behind
   “separate palette” / below the fold).
2. Shorten `CHANNEL_LAYOUT_PRESETS[].description`.
3. Remove `actions` from types, meta, defaults, presets, render.
4. Remove `textOverlay` page block; keep player text overlay in Look → Player.
5. Add `playlist` page item (multi like embed) with `playlistSlug`; Add picker
   via `fetchStudioCollections`; render track list on channel page.
6. Playlist Look settings: swap playlist via picker; `playlistDisplay`
   `tracklist` | `cards` (PlayableTrackTable vs CardGrid + Card).

## Done this slice

- `playlistDisplay` on layout + `setPlaylistDisplay`; normalize persists it.
- ChannelView Look → playlist: picker + FilterChips Tracklist/Cards.
- `ChannelPlaylistBlock` renders cards or tracklist from `display`.
