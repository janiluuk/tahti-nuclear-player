# Icon-button Tooltip sweep

**Status:** in progress (listener surface + remaining UI primitives done 2026-09-04).
**Storybook:** `Components/Tooltip` → `SidebarIcons`.
**Next:** Studio toolbars, then Admin / PluginStorePanel. Re-scan before claiming 0.

Every icon-only control must use Storybook `Tooltip` for the hover/focus label. Keep `aria-label` for assistive tech. Do not treat native `title=` as the tooltip.

```tsx
<Tooltip content="Configure visualizer" side="top">
  <Button size="icon-sm" aria-label="Configure visualizer">
    <SettingsIcon size={15} aria-hidden />
  </Button>
</Tooltip>
```

Prefer wrapping once in shared primitives so consumers inherit it.

## Leave

- Buttons with visible text (not icon-only)
- `Tooltip` “?” help badges (form-help sweep, not this list)
- Drag handles if the label is already in surrounding copy **and** `aria-label` is set — still wrap if the control is icon-only
- Full-screen player / Pro Editor take-over: still wrap; missing chrome is fine, missing tooltip is not

## Done — `@tahti-player/ui`

| File | Notes |
| --- | --- |
| `PlayerBar/PlayerBarControls.tsx` | Previous / play-pause / next |
| `PlayerBar/PlayerBarVolume.tsx` | Mute |
| `PluginItem/PluginItem.tsx` | Settings / reload / remove |
| `Pagination/Pagination.tsx` | Prev / next |
| `Dialog/DialogXClose.tsx` | Close |
| `MediaArtwork/MediaArtwork.tsx` | Play and overlay actions |
| `TrackTable/Cells/ActionsCell.tsx` | Row actions |
| `TrackTable/Cells/RemoveCell.tsx` | Remove |
| `TrackTable/Toolbar.tsx` | aria-labels (already wrapped) |
| `NewsWidget/NewsWidget.tsx` | Slider chevrons |
| `CardsRow/CardsRow.tsx` | Scroll chevrons |
| `QueueItem/QueueItemExpanded.tsx` | Expand actions |
| `TopBarNavigation.tsx` | Back / forward |
| `TahtiJam/TahtiJamControls.tsx` | Transport |
| `TahtiJam/TahtiJamQueueItem.tsx` | Queue remove |
| `HistoryRow/HistoryRow.tsx` | Add to queue |
| `LogViewer/LogDateRangeFilter.tsx` | Clear range |
| `PlayerWorkspace/PlayerWorkspaceSidebar.tsx` | Collapse |
| `SettingsPanel/SettingsPanelContent.tsx` | Back |
| `ThemeStoreItem/ThemeStoreItem.tsx` | Already wrapped |

## Done — listener + chrome (`packages/tahti-web`)

| File | Notes |
| --- | --- |
| `ConnectedPlayerBar.tsx` | Queue / extra transport |
| `FullScreenPlayer.tsx` | Minimize |
| `MobileChrome.tsx` | Close |
| `RightRailPanel.tsx` | Ack / rail actions |
| `GlobalSearch.tsx` | Clear / close |
| `SidebarQueuePanel.tsx` | Clear / shuffle / extras |
| `ListenView.tsx` | Radio play / open radio |
| `DiscoverView.tsx` | Add a widget |
| `FeedView.tsx` | Previous / next |
| `CollectionView.tsx` | Edit in Studio / add to queue |
| `ArtistView.tsx` | Subscribe / press kit / channel / play |
| `ChannelView.tsx` | Chat, favorite, play, playlist, remove block |
| `RadioView.tsx` | Open channel / book slot |
| `RadioScheduleView.tsx` | Green room / week nav |
| `RadioShowView.tsx` | Green room |
| `TrackDetailView.tsx` | Favorite |
| `LibraryMediaView.tsx` | Remove file |
| `MyDiscographyView.tsx` | Pin / play / edit / editor |
| `MyCollectionsView.tsx` | Open in Studio |
| `ListenerWidgetsSection.tsx` | Remove station |
| `ListenerWidgetEmbed.tsx` | Remove |
| `ListenAddonsPanel.tsx` | Configure |
| `ListenWidgetStoreDialog.tsx` | Open store |
| `NewsFeedWidget.tsx` | Remove |
| `discover/WidgetCard.tsx` | Configure / reorder / remove |
| `ImageLightbox.tsx` | Close / prev / next |
| `RadioBookingCalendar.tsx` | Month nav / book / calendar |
| `ScheduleDialog.tsx` | Book / full calendar |

## Studio (next)

Heaviest: `StudioProEditorView` (12), `StudioCollectionEditView` (7), `ChannelDesigner` (8), `PluginStorePanel` (13).

| File | Missing |
| --- | --- |
| `StudioProEditorView.tsx` | 12 |
| `StudioCollectionEditView.tsx` | 7 |
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
| `PluginStorePanel.tsx` | 13 |
| `AdminStreamManagerPanel.tsx` | 9 |
| `AdminStorageView.tsx` | 7 |
| `AdminAgmView.tsx` | 4 |
| `AdminDiscoWidgetsView.tsx` | 3 |
| `AdminMissedShowsView.tsx` | 3 |
| `AdminNewsView.tsx` | 2 |
| `SelectsTab.tsx` | 2 |
| `AdminUserEditPanel.tsx` | 3 |
| `DiscoWidgetManagerPanel.tsx` | 3 |
| `SettingsPanels.tsx` | 5 |
| `AdminAnnouncementsView.tsx` | 1 |
| `AdminFinancialView.tsx` | 1 |
| `AdminGrantsView.tsx` | 1 |
| `AdminI18nView.tsx` | 1 |
| `AdminStorageUserView.tsx` | 1 |
| `PinnedAnnouncementsPanel.tsx` | 2 |
| `DiscordBotAddonCard.tsx` | 1 |

## Order of work

1. ~~UI primitives.~~
2. ~~App chrome.~~
3. ~~Listener hubs.~~
4. ~~Remaining listener views + widgets + leftover UI primitives.~~
5. Studio toolbars (Pro Editor, collection editor, Channel Designer).
6. Admin stream manager + storage + PluginStorePanel.
7. Remainder. Re-run the scan; target **0** icon `Button`s without a wrapping `Tooltip`.

After wrapping, drop redundant native `title=` when `Tooltip` + `aria-label` already say the same thing.
