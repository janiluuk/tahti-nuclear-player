# Icon-button Tooltip sweep

**Status:** done for listed surfaces (2026-09-04). Re-scan before claiming absolute 0.
**Storybook:** `Components/Tooltip` → `SidebarIcons`.

Every icon-only control must use Storybook `Tooltip` for the hover/focus label. Keep `aria-label` for assistive tech. Do not treat native `title=` as the tooltip.

```tsx
<Tooltip content="Configure visualizer" side="top">
  <Button size="icon-sm" aria-label="Configure visualizer">
    <SettingsIcon size={15} aria-hidden />
  </Button>
</Tooltip>
```

## Done

- `@tahti-player/ui` primitives
- Listener + chrome
- Studio toolbars + panels
- **Admin + Settings add-ons** — PluginStorePanel, AdminStreamManager, Storage, AGM, Disco widgets, Missed shows, News, Selects, User edit, DiscoWidgetManager, SettingsPanels, Announcements/Financial/Grants/I18n/StorageUser, PinnedAnnouncements, DiscordBotAddonCard

## Follow-up

Re-run an icon-button scan across `packages/tahti-web` for any remaining `size="icon"` / `size="icon-sm"` without a wrapping `Tooltip`. Drop redundant `title=` when Tooltip + aria-label already say the same thing.
