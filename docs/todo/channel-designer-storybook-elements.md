# Channel Designer → Storybook elements

**Status:** in progress — stories land first; panels extract as we correct them.

## Goal

Review and fix Channel Designer UI **one element at a time** in Storybook
(`Tahti/Channel/Designer/*`), without needing the full channel edit chrome.

## Story inventory

| Story / element | Source | Notes |
| --- | --- | --- |
| Full designer | `ChannelDesigner` | Preview + controls |
| Look-only shell | `lookOnly` | Docked layers Look slot |
| Backdrop | `lookOpenSection=backdrop` | Header + page background |
| Player | `lookOpenSection=player` | Gradient / visualizer / overlay |
| Releases…Gallery | layout-only hints | Visibility eye only |
| Color scheme fields | `ColorSchemeFields` | Shared pickers |
| Layers menu | `ChannelLayersMenu` | Background row + Add playlist |
| Playlist picker | `ChannelPlaylistPicker` | Add vs settings (`applyOnChange`) |
| Playlist block | `ChannelPlaylistBlock` | Tracklist vs Cards |

## Correction order

1. ~~Color scheme fields (shared primitive)~~
2. Backdrop — `HeaderStyleTabs` + `PageBackgroundField` extracted; exclusive
   style bodies live; full Backdrop panel extract still open
3. Player (gradient / visualizer / overlays)
4. Layers menu + Background always-on row (fixed translucent dock shipped)
5. Playlist picker + block displays
6. Layout-only look rows (releases…gallery) copy/visibility

When correcting an element: extract its panel from `ChannelDesigner.tsx`
into `components/channel-designer/` if it is still an inline JSX blob,
wire the live designer to the extracted component, update the story.

## Out of scope for this pass

- Live Three.js dual-context issues (stories use `livePreview: false`
  unless explicitly testing visualizer)
- Saving / API (mock under Storybook `VITE_FORCE_MOCK`)
