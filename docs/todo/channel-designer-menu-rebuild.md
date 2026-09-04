# Channel designer menu rebuild

**Status:** shipped in tahti-web 0.0.80.

## Problem

Header style tabs (Gradient / Solid / Video / Slideshow) always showed the
same color preset block; switching tabs felt broken. Panel scrolled with the
page and needed internal scrolling just to navigate chrome.

## Goals

1. Exclusive per-style Look content (only the controls for the active style).
2. Slideshow is a first-class mode in the segmented control.
3. Designer shell is **fixed**, translucent; page scrolls behind it.
4. Tab / section chrome stays put — only the settings pane scrolls.

## Approach

- `ChannelLayersMenu`: translucent dock (`bg-background/75` + blur).
- `ChannelView` edit mode: fixed right panel; page scrolls in the left pane.
- Header style: segmented buttons + exclusive body branches.
- Colors: full palette for Gradient; accents for Solid/Video/Slideshow;
  page background always at top of Background section.
