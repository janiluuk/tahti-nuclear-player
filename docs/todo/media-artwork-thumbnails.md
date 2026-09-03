# MediaArtwork thumbnail migration

Track: Storybook / `@tahti-player/ui` MediaArtwork update (`thumb` size;
queue/favorite overlays only on `lg`/`fill`).

Durable notes live in `packages/tahti-web/UI-REDESIGN-WORKLOG.md`
(2026-09-04 — MediaArtwork thumbnails).

## Done

- PluginStorePanel (HearThis + personal radio)
- HistoryRow
- WidgetTrackRow
- CollectionTrackList
- MyDiscographyView / GlobalSearch / Smart links (LibrarySmartLinksView) /
  Library media (LibraryMediaView) — already on `ImageReveal` as of
  2026-09-04, no `<img>` left.
- Studio lists: StudioPlaylistsView (collection rows), StudioShowsView
  (show rows)
- RadioView (now-playing hero, just-played rows) / ReleasesPanel (release
  table rows) — swapped raw `<img>` + text-fallback div to `MediaArtwork`.
  `MediaIconActions` stays beside the artwork as-is: `MediaArtwork` only
  exposes queue/favorite overlay actions at `lg`/`fill` sizes (by design,
  to avoid crowding row-context thumbs — see `MediaArtwork.tsx`), so the
  existing separate action row is still the right shape at `sm`/`md`.

## Remaining (not in this pass)

- StudioSoundView banner preview and StudioReleaseDetailView artwork
  preview are upload-widget previews, not list thumbs — out of scope here,
  tracked under `image-upload-hover-lightbox.md` instead.
- AdminRadioView / RadioSubmissionsTab / RadioStationSuggestionsTab still
  have raw `<img>` (station logos, not grid thumbs) — low priority,
  unaudited.
