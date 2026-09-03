# Icon-button Tooltip sweep

**Status:** planned. List from 2026-09-04 scan (`Button` `size="icon"` / `icon-sm"` in `tahti-web` + `@tahti-player/ui`).
**Storybook:** `Components/Tooltip` → `SidebarIcons` (icon `Button` wrapped in `Tooltip`). Player transport already does this for shuffle / repeat / discovery in `PlayerBarControls`.
**Count:** 296 icon buttons; **8** already wrapped; **288** missing.

Every icon-only control must use Storybook `Tooltip` for the hover/focus label. Keep `aria-label` for assistive tech. Do not treat native `title=` as the tooltip.

```tsx
<Tooltip content="Configure visualizer" side="top">
  <Button size="icon-sm" aria-label="Configure visualizer">
    <SettingsIcon size={15} aria-hidden />
  </Button>
</Tooltip>
```

Prefer wrapping once in shared primitives (`DialogXClose`, `Pagination`, `PluginItem`, `MediaArtwork`, `PlayerBarControls`) so consumers inherit it.

## Leave

- Buttons with visible text (not icon-only)
- `Tooltip` “?” help badges (form-help sweep, not this list)
- Drag handles if the label is already in surrounding copy **and** `aria-label` is set — still wrap if the control is icon-only
- Full-screen player / Pro Editor take-over: still wrap; missing chrome is fine, missing tooltip is not

## `@tahti-player/ui` (do first)

| File | Missing | Notes |
| --- | --- | --- |
| `PlayerBar/PlayerBarControls.tsx` | 3 | Previous / play-pause / next — shuffle/repeat already wrapped |
| `PlayerBar/PlayerBarVolume.tsx` | 1 | Mute |
| `PluginItem/PluginItem.tsx` | 3 | Settings / reload / remove |
| `Pagination/Pagination.tsx` | 2 | Prev / next |
| `Dialog/DialogXClose.tsx` | 1 | Close — every dialog |
| `MediaArtwork/MediaArtwork.tsx` | 4 | Play and overlay actions |
| `TrackTable/Cells/ActionsCell.tsx` | 4 | Row actions |
| `TrackTable/Cells/RemoveCell.tsx` | 1 | |
| `TrackTable/Toolbar.tsx` | 2 | (scan: size=icon) |
| `NewsWidget/NewsWidget.tsx` | 2 | Slider chevrons |
| `CardsRow/CardsRow.tsx` | 2 | Scroll chevrons |
| `QueueItem/QueueItemExpanded.tsx` | 2 | |
| `TopBarNavigation.tsx` | 2 | Back / forward |
| `TahtiJam/TahtiJamControls.tsx` | 5 | |
| `TahtiJam/TahtiJamQueueItem.tsx` | 1 | |
| `HistoryRow/HistoryRow.tsx` | 1 | |
| `LogViewer/LogDateRangeFilter.tsx` | 1 | |
| `PlayerWorkspace/PlayerWorkspaceSidebar.tsx` | 1 | Collapse |
| `SettingsPanel/SettingsPanelContent.tsx` | 1 | Back |
| `ThemeStoreItem/ThemeStoreItem.tsx` | 3 | (if still icon-only) |

## Listener + chrome (`packages/tahti-web`)

| File | Missing | Typical labels |
| --- | --- | --- |
| `ConnectedPlayerBar.tsx` | 2 | Queue / extra transport |
| `FullScreenPlayer.tsx` | 1 | Minimize |
| `MobileChrome.tsx` | 1 | Close |
| `RightRailPanel.tsx` | 1 | Close / collapse |
| `GlobalSearch.tsx` | 1 | Clear / close |
| `SidebarQueuePanel.tsx` | 3 | Clear / extra / shuffle |
| `ListenView.tsx` | 2 | Radio play / open radio |
| `DiscoverView.tsx` | 1 | Add a widget |
| `FeedView.tsx` | 2 | Previous / next |
| `CollectionView.tsx` | 2 | Edit in Studio / add to queue |
| `ArtistView.tsx` | 4 | Subscribe / press kit / channel |
| `ChannelView.tsx` | 6 | Chat, download playlist, remove block |
| `RadioView.tsx` | 2 | Open channel / calendar |
| `RadioScheduleView.tsx` | 3 | Green room / week nav |
| `RadioShowView.tsx` | 1 | Green room |
| `TrackDetailView.tsx` | 1 | |
| `LibraryMediaView.tsx` | 1 | Remove file |
| `MyDiscographyView.tsx` | 4 | Pin / edit / editor |
| `MyCollectionsView.tsx` | 1 | Open in Studio |
| `ListenerWidgetsSection.tsx` | 2 | Remove station |
| `ListenerWidgetEmbed.tsx` | 1 | Remove |
| `ListenAddonsPanel.tsx` | 1 | Configure (gear) |
| `ListenWidgetStoreDialog.tsx` | 1 | Open store |
| `NewsFeedWidget.tsx` | 1 | Remove |
| `discover/WidgetCard.tsx` | 4 | Play / like / queue |
| `ImageLightbox.tsx` | 3 | Close / prev / next |
| `RadioBookingCalendar.tsx` | 4 | Month nav / book / full calendar |
| `ScheduleDialog.tsx` | 2 | Book / full calendar |

## Studio

Heaviest: `StudioProEditorView` (12), `StudioCollectionEditView` (7), `ChannelDesigner` (8), `PluginStorePanel` (13, shared with Settings add-ons).

| File | Missing |
| --- | --- |
| `StudioProEditorView.tsx` | 12 — preview, cut, trim, silence, clear, plugin remove |
| `StudioCollectionEditView.tsx` | 7 — reorder, remove, add, preview |
| `StudioSoundsView.tsx` | 5 |
| `StudioSoundView.tsx` | 5 |
| `StudioReleasesView.tsx` | 5 |
| `StudioReleaseDetailView.tsx` | 3 |
| `StudioScheduleView.tsx` | 5 |
| `StudioUpdatesView.tsx` | 5 |
| `StudioEditorListView.tsx` | 4 |
| `StudioModerationView.tsx` | 4 |
| `StudioPlaylistsView.tsx` | 2 |
| `StudioShowsView.tsx` | 2 |
| `StudioCollectionsView.tsx` | 2 |
| `StudioBrandingView.tsx` | 2 |
| `StudioGoLiveView.tsx` | 2 |
| `StudioUploadView.tsx` | 2 |
| `StudioVenuesView.tsx` | 2 |
| `StudioEventsView.tsx` | 1 |
| `StudioRecordingsView.tsx` | 1 |
| `StudioStashView.tsx` | 1 |
| `StudioShowDetailView.tsx` | 1 |
| `StudioRevenueView.tsx` | 1 |
| `StudioDistributionView.tsx` | 1 |
| `TrackEditDialog.tsx` | 5 |
| `StreamManagerPanel.tsx` | 5 |
| `ArtistGalleryPanel.tsx` | 6 |
| `StashFilesPanel.tsx` | 4 |
| `ChannelDesigner.tsx` | 8 |
| `ChannelElementEditor.tsx` | 3 |
| `ChannelLayersMenu.tsx` | 3 |
| `ChannelRotationEditor.tsx` | 3 |
| `ChannelAnnouncementsPanel.tsx` | 2 |
| `ChannelLinksEditor.tsx` | 1 |
| `ChannelRadioPlaylistPanel.tsx` | 1 |
| `ThemeEditor.tsx` | 2 |
| `TrackInfoDialog.tsx` | 2 |
| `TracklistEditor.tsx` | 1 |
| `TrackCreditsEditor.tsx` | 1 |
| `TrackExportPanel.tsx` | 1 |
| `MediaIconActions.tsx` | 1 |
| `StudioSoundRowMenu.tsx` | 1 |
| `ShowEpisodeList.tsx` | 1 |
| `SoundShareLinksSection.tsx` | 1 |
| `SubgenreTagInput.tsx` | 1 |
| `AudienceVisibilitySection.tsx` | 1 |
| `MulticastSection.tsx` | 1 |
| `ArtistImagePurposePicker.tsx` | 1 |

## Admin + Settings add-ons

| File | Missing |
| --- | --- |
| `PluginStorePanel.tsx` | 13 — configure, queue, play, about |
| `AdminStreamManagerPanel.tsx` | 9 — listen, details, restart, skip, pause, resume, offline, refresh |
| `AdminStorageView.tsx` | 7 |
| `AdminAgmView.tsx` | 4 |
| `AdminDiscoWidgetsView.tsx` | 3 |
| `AdminMissedShowsView.tsx` | 3 |
| `AdminNewsView.tsx` | 2 |
| `SelectsTab.tsx` | 2 |
| `AdminUserEditPanel.tsx` | 3 |
| `DiscoWidgetManagerPanel.tsx` | 3 |
| `SettingsPanels.tsx` | 5 — about add-ons, theme configure/rename/export |
| `AdminAnnouncementsView.tsx` | 1 |
| `AdminFinancialView.tsx` | 1 |
| `AdminGrantsView.tsx` | 1 |
| `AdminI18nView.tsx` | 1 |
| `AdminStorageUserView.tsx` | 1 |
| `PinnedAnnouncementsPanel.tsx` | 2 |
| `DiscordBotAddonCard.tsx` | 1 |

## Order of work

1. UI primitives (Dialog close, Pagination, PluginItem, PlayerBar, MediaArtwork, TrackTable).
2. App chrome (player bar, rail, mobile, fullscreen, search).
3. Listener hubs and widgets.
4. Studio toolbars (Pro Editor, collection editor, Channel Designer).
5. Admin stream manager + storage + PluginStorePanel.
6. Remainder. Re-run the scan; target **0** icon `Button`s without a wrapping `Tooltip`.

After wrapping, drop redundant native `title=` when `Tooltip` + `aria-label` already say the same thing.
