# News widget (RSS slider)

Wire Storybook `NewsWidget` as a Listen add-on. Configure a thumbnail and RSS
URL; show a widescreen article slider on Listen and/or Discover.

## Approach

- Install from Add-ons → Listen (same store as Favorites / SoundCloud).
- Each instance: title, RSS URL, uploaded thumbnail, Listen / Discover toggles
  (default both).
- Fetch the feed through sibling `GET /api/me/rss-feed?url=` (SSRF-guarded
  proxy). Parse RSS 2.0 / Atom in tahti-web. Mock fixtures when
  `VITE_FORCE_MOCK=1`.
- Render `NewsWidget` full-width (not the 2-col embed grid / 3-col Discover
  cards). Thumbnail is the header mark and the fallback image for items
  without enclosure art.
- Not an iframe embed — keep it out of `LISTENER_WIDGET_TYPES`.
