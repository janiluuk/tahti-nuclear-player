# Generic Storybook UI sweep (2026-09-04)

**Status:** executed (this pass).

Swapped hand-rolled controls onto Storybook primitives without dropping
live data, overlays, routes, or actions.

## Done

1. ViewShell Listen/Discover + icon Tooltip UI primitives (in-flight batch)
2. Studio Upload Configure Enable/Disable → `Toggle`
3. Label-only segment strips → `FilterChips` (Admin Top lists, Radio schedule,
   Branding Append/Replace, Channel radio Shuffle/In order, Shows mode/hours)
4. Studio empty `<p>` → `EmptyState` (Sounds, Stash, Recordings, Venues, Shows,
   Stats empties)
5. Short Discover ViewShell subtitles

## Still open

- Remaining ViewShell migrations (Help, Studio list headers, Admin)
- Remaining icon-button Tooltip surfaces (chrome / Studio / Admin)
- More Studio EmptyState / FilterChips from `studio-storybook-sweep.md`

Keep StudioNav / Listen tabs / Admin tabs mounted.
