# Storybook surface cheat sheet (tahti-web)

Lookup before inventing UI. Stories live under `packages/storybook/src/` (shared) and `packages/storybook/src/tahti-web/` (app-local). Run `pnpm storybook`.

| Surface | Story title prefix / notes |
| --- | --- |
| App chrome / shell | `Tahti/...` AppShell, AppTopNav, SectionSidebar stories under `tahti-web/` |
| Page header (ordinary) | `ViewShell` — title + optional subtitle; nav tabs stay outside |
| Studio / Admin nav | `StudioNav`, `AdminNav`, `AdminGate`, `StudioGate` |
| Channel Designer panels | `Tahti/Channel/Designer/*` (BackdropPanel, PlayerPanel, ColorSchemeFields, Playlist, …) |
| Channel public / widgets | ChannelBackdropCard, ChannelChatPanel, ChannelControlsWidget, … |
| Forms | `Input`, `Select`, `Textarea`, `Toggle`, `Slider`, `FilePicker`, `FilterChips` |
| Feedback | `Badge`, `EmptyState`, `Loader`, `PageLoading`/`PageEmpty`/`PageError`, `Tooltip`, toast (Sonner) |
| Lists / media | `Card`/`CardGrid`, `TrackTable`, `TopList`, `MediaArtwork`, `ImageReveal`, `StatChip` |
| Player | `PlayerBar`, `QueuePanel`, `QueueItem`, `WaveformSeekbar` |
| Help | `KeyCombo`, KeyboardNavigation |

If nothing matches: add a story with today’s states, flag `Missing states:`, then use it. Flag unused stories `Orphan:`.

Full rules: root `AGENTS.md` → Storybook-first UI; `packages/tahti-web/AGENTS.md` → Design system.
