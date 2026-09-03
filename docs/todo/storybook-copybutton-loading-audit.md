# CopyButton and lazy-load/skeleton component audit

Scan of `packages/tahti-web` (production) for (1) copyable-value fields not
using the shared `CopyButton` (or using it without a toast/visible-full-value
layout), and (2) listing/grid widgets rendering images without the shared
`ImageReveal` lazy-load treatment. FilterChips coverage on real listing pages
was also checked. UI-only — no data/behavior changes.

## 1. CopyButton

`packages/ui/src/components/CopyButton/CopyButton.tsx` already existed and
was already used at 8 call sites across the app (go-live stream credentials,
share/embed dialogs, agenda builder, jam session code, release smartlinks).
Two gaps against the requested UX (inline label with the *full* value
visible, toast on copy, ~10s confirmed state):

- **Feedback duration was 2s, not ~10s**, and there was **no toast option**
  at all — every existing usage copies silently.
- **The paired `<code>` value next to `CopyButton` used `truncate`** at most
  call sites, hiding the value CopyButton is supposed to let you copy —
  directly contradicts "so the full text can be seen".
- `apps/tahti-web/src/components/ApiTokensPanel.tsx` (the user's named
  example) had a **hand-rolled** copy button (`<Button onClick={... manual
  navigator.clipboard.writeText ...}>`) instead of `CopyButton`, despite the
  value already being shown in full (a read-only `<Input>`, not truncated).

### Changed

- `packages/ui/src/components/CopyButton/CopyButton.tsx` — generic,
  backward-compatible additions only (existing call sites keep working
  unchanged since both are opt-in):
  - `feedbackDurationMs` prop, default bumped from 2000ms to **10_000ms**.
  - `toastMessage?: string | boolean` prop — `true` shows a generic "Copied
    to clipboard" toast via `sonner` (already a dependency of this package
    and already the toast library used throughout `tahti-web`); a string is
    shown as given. Omitted (the old behavior) stays silent.
  - Tests unaffected: `CopyButton.test.tsx`'s 3 tests and its snapshot still
    pass unchanged (`pnpm --filter @tahti-player/ui exec vitest run
    src/components/CopyButton` → 3 passed).
- `packages/tahti-web/src/components/ApiTokensPanel.tsx` — replaced the
  hand-rolled copy `<Button>` with `<CopyButton text={revealedToken}
  toastMessage="Token copied." />`, same layout (still next to the
  full-value `<Input>`).
- `packages/tahti-web/src/views/studio/StudioGoLiveView.tsx` (`CopyField`,
  the user's other named example) — the RTMP server/stream-key and Icecast
  fields: swapped `truncate` for `overflow-x-auto whitespace-nowrap` (full
  value stays visible/scrollable instead of ellipsis-cut) and added
  `toastMessage={\`${label} copied.\`}`.
- `packages/tahti-web/src/components/EmbedButton.tsx` — embed link + iframe
  snippet fields: same `truncate` → `overflow-x-auto whitespace-nowrap` fix,
  added toast messages.
- `packages/tahti-web/src/components/ChannelShareButton.tsx` — channel link,
  share message, embed link, iframe snippet (4 fields): same fix + toasts.
- `packages/tahti-web/src/components/SoundShareLinksSection.tsx` — sound
  share-link row: same fix + toast.
- **Not changed** (checked, no fix needed): `JamView.tsx` (short 6-char jam
  code, never truncated), `AdminAgmView.tsx` (button copies a
  computed agenda string, not paired with a truncated display field),
  `StudioReleasesView.tsx`'s `truncate` (that one's on a list row's
  secondary metadata line — type/state/track-count — not on the value the
  adjacent `CopyButton` actually copies, so it's a different, legitimate use
  of truncation for a compact row and out of scope here).

## 2. FilterChips on listings

Already correct — no swap needed. `ListenView.tsx` and `DiscoverView.tsx`
(the two listing/discovery pages) already import and use `FilterChips` for
genre/type filtering (confirmed in the prior
`storybook-cardsrow-combobox-audit.md` pass and re-verified here). The only
other hand-rolled toggle-group found (`RadioScheduleView.tsx`, "Show type:
Live set / Talk") is a **scheduling form input** (choosing a value when
booking a slot), not a listing filter — out of scope for "filters enabled on
listings" and left alone.

## 3. Lazy-load / skeleton (`ImageReveal`)

No standalone "Skeleton" component exists in `@tahti-player/ui` (grepped —
no match). The closest existing mechanism is `ImageReveal`'s own `placeholder`
prop (any `ReactNode`, shown centered while the image loads, then cross-faded
out) — this is the convention `Card`/`MediaArtwork` already use (a low-opacity
icon), not a shimmer/pulse block, so that's the pattern followed here rather
than inventing a new skeleton component.

`ImageReveal` (`packages/ui/src/components/ImageReveal/ImageReveal.tsx`,
defaults to `loading="lazy"` + fade-in reveal) was already wired into the
shared `Card`/`MediaArtwork`/`HistoryRow`/`ThumbnailCell` components — and
`ListenView.tsx`'s card grids already render through `Card`, so those were
**already covered**, nothing to change there.

Gap found: `DiscoverView.tsx` doesn't use `Card` — it renders through its own
`WidgetCard`/`WidgetTrackRow` components, which used plain `<img>` with no
lazy-load or reveal treatment.

### Changed

- `packages/tahti-web/src/components/discover/WidgetCard.tsx` — artist-of-
  the-week avatar and the collections-widget's per-row cover thumbnails
  (`collections.slice(0, MAX_ROWS).map(...)`, a real list of images) now
  render through `ImageReveal` instead of `<img>`.
- `packages/tahti-web/src/components/discover/WidgetTrackRow.tsx` — each
  track row's cover art (rendered once per row in the widget's track list)
  now renders through `ImageReveal` instead of `<img>`.

### Scanned, not changed

Broader grep for plain `<img>` across `packages/tahti-web/src/views` and
`components` turned up ~20 more files, but on inspection nearly all are
single-image contexts (avatar/artwork upload previews, one hero image on an
artist/channel page, a single admin form's preview) rather than
multi-item listing grids where lazy-load actually matters — swapping those
would be low-value churn, not what was asked. Worth a future pass if new
image-grid widgets are added: `MyDiscographyView.tsx`,
`LibraryMediaView.tsx`, `LibrarySmartLinksView.tsx`,
`StudioCollectionsView.tsx`, `AdminDiscoWidgetsView.tsx` are the most
grid-shaped of the remainder and the best candidates to check first.

`WidgetCard`'s whole-widget `loading` boolean still renders as a centered
`<Loader size="sm" />` spinner rather than a skeleton — left as-is since (a)
there's no skeleton component to swap to, and (b) that's a whole-widget
loading state (one fetch, one moment), not the "many items appearing at
once" case `ImageReveal`'s per-item reveal already addresses.
