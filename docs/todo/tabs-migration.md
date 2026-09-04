# Tabs migration worklist

**Status:** complete for migratable surfaces.  
**Canonical component:** `@tahti-player/ui` `Tabs` (+ `TabLabel` for icon / count pill).  
**Storybook:** `Layout/Tabs` — Basic, With icons, With count pills, Icons + count pills, Vertical icon-only.

## Done

- Extended declarative `TabsItem` with optional `icon` + `count`; exported `TabLabel`.
- `Tabs.Tab` forwards `title` / `aria-label` for icon-only rails.
- Stories for icon, count-pill, and vertical icon-only tabs.
- Plugin store / listen add-ons / radio stations Installed–Available + hearthis library.
- `SectionTabs`, Admin primary, moderation pending count pill, orphan pages.
- Settings section bodies: `tabLabel()` helper → `icon` prop on `Tabs` items (Settings **nav** chrome stays `SettingsPanel`).
- Studio: branding, stats, governance, updates, sounds, show detail counts, events, moderation, distribution, release/sound edit, channel setup/radio, stash, pro-editor stems, collections filter, editor “Open from library” vertical tabs, revenue.
- Public: Discover, Listen, Artist, Library, Channel overview/manage, radio schedule, radio up-next/just-played, channel radio programme/rotation, stream manager, collections type filter, account, history, onboarding.
- Right rail expanded **and** collapsed (vertical icon-only `Tabs`).
- Player desktop: Plugins, Themes, History tab icons.
- `InPageNav` wraps `Tabs` + `TabLabel` (orphan in live routes).

## Keep as-is (not tab strips)

| Surface | Notes |
| --- | --- |
| `SettingsPanel` **nav** | Dedicated settings list/detail chrome — not `Tabs` |
| Create-collection style chips | Form picker for one style, not a section tab row |
| Artist-role / show-type / duration toggles | Multi/single select chips, not tabs |
| Plugin adapters | Shared `InstalledAvailableTabs` covers store categories; no leftover Button strips found |

## Rules

1. New tab rows → Storybook `Tabs` (composition or `items`).
2. If an icon is assigned on the tab definition, render it via `TabLabel` / `icon=`.
3. Item counts → `Badge` pill via `count=` / `TabLabel count`, not raw `(N)` text.
4. Filter chips (`FilterChips`) stay filters — not tabs (collections type filters use `Tabs` because icons + counts are assigned).
