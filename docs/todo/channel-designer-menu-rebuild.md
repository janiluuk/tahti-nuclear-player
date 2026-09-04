# Channel designer menu rebuild

**Status:** shipping with Storybook Backdrop primitives (0.0.80).

## Problem

Header style tabs (Gradient / Solid / Video / Slideshow) always showed the
same color preset block; switching tabs felt broken. Panel scrolled with the
page and needed internal scrolling just to navigate chrome.

## Goals

1. Exclusive per-style Look content (only the controls for the active style).
2. Slideshow is a first-class mode in the segmented control.
3. Designer shell is **fixed**, translucent; page scrolls behind it.
4. Tab / section chrome stays put — only the settings pane scrolls.

## Done

- Exclusive header-style bodies in `ChannelDesigner` (Gradient / Solid /
  Video / Slideshow).
- Fixed translucent layers dock (`ChannelLayersMenu` + `ChannelView` edit).
- Extracted `HeaderStyleTabs` + `PageBackgroundField` under
  `components/channel-designer/` with Storybook stories.
