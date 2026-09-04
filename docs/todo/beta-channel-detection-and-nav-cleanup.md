# Beta fixes: channel-detection scope + nav cleanup

## Reported by user (beta.tahti.live, janiluuk@gmail.com / yaniho channel)

1. Signing in kept showing "create a channel" almost everywhere, even though
   the account already owns the `yaniho` channel.
2. Favorites shows up twice — in the main sidebar and as a tab inside Listen.
3. Studio's own nav is crowded; Library used to be a top-level main-menu item
   and should move back there instead of living inside Studio's submenu.

## 1. Channel-required gating scope

`StudioGate` (`packages/tahti-web/src/components/StudioGate.tsx`) defaults
`requireChannel` to `true`, and ~24 of the ~28 Studio views wrap themselves in
`<StudioGate>` without overriding it — so any Studio page shows "Artist
channel required" whenever `user.channel` is falsy, not just
rotation/channel-design pages. Only StudioGovernanceView, StudioRevenueView,
StudioChannelView (the channel designer itself!), StudioHomeView, and
StudioStripeView already opt out with `requireChannel={false}`.

Investigated cross-repo: this app and the production `tahti` monorepo
(`apps/api`) share one backend. Root cause of "yaniho's channel isn't
recognized" turned out to be a **live production incident**, not a client
bug — see `tahti` repo's own migration
`packages/db/prisma/migrations/20260903015900_rename_archive_to_sound/` for
the full writeup. Short version: PR #427 renamed `ArchiveItem`->`Sound`
without a real migration; `db push` correctly refused; production ran
Sound-shaped code against an Archive-shaped DB, so `GET /api/auth/me` 500'd
for every signed-in user (falls back to "no channel" client-side). Fixed and
verified live (`api.tahti.live/api/v1/u/yaniho/profile` back to 200).

Given the actual channel-detection bug was server-side, the remaining
client-side work here is the **narrower UX scope** the user asked for: don't
default every Studio page to requiring a channel. Deferred — not touched in
this pass, since it needs a per-page judgment call on which pages genuinely
need a channel (broadcast/go-live, schedule, channel design) vs. which don't
(insights, moderation, smart links, playlists) rather than a mechanical
sweep. Flagging here so it isn't lost.

## 2. Favorites: sidebar only, not also a Listen tab

- Sidebar already has its own "Favorites" entry
  (`AppShell.tsx` `SidebarNavItems`, `/listen/favorites`).
- `ListenView.tsx` also lists `favorites` in its own tab strip
  (`listen | feed | favorites | history`) — redundant.
- Fix: drop the `favorites` tab from `ListenView`'s tab list (keep the route
  `/listen/favorites` working — it's still reachable via the sidebar link and
  `FavoritesView` itself is unchanged).

## 3. Library: back to the main menu, out of Studio's submenu

- `packages/tahti-web/src/lib/navigationActive.ts` already treats `/library`
  as its own top-level `sidebarActive` value (`'library'`), and `AppShell.tsx`
  already maps `Digit4` to `/library` — both dead code today because no
  `SidebarNavigationItem` in the main sidebar actually points there anymore.
  It was pulled into Studio's own submenu (`StudioNav.tsx` `SUBMENUS['/studio']`:
  Library, Sounds, Collections, Upload) at some point instead.
- `LibraryView.tsx` is already a fully self-contained section with its own
  internal tab strip (Sounds/Collections/Recordings/etc.), same shape as
  Listen or Studio — it doesn't need to live inside Studio's nav.
- Fix:
  - Add a "Library" item to the main sidebar (`AppShell.tsx`
    `SidebarNavItems`), between Studio and Admin (or wherever reads best),
    wired to the existing `sidebarActive === 'library'` state.
  - Remove the Library/Sounds/Collections/Upload entries from
    `SUBMENUS['/studio']` in `StudioNav.tsx` — `/studio/releases` and
    `/studio/editor` stay (genuinely Studio concepts, not Library ones).
  - Leave `SECTION_PREFIXES`/keyboard-shortcut logic alone beyond what's
    needed — `/library/*` already resolves correctly on its own.

## Status

- [x] Root-caused and fixed the production channel-detection 500 (see
      `tahti` repo).
- [ ] Client-side StudioGate scope narrowing — deferred, needs per-page
      judgment, tracked above so it isn't forgotten.
- [x] Favorites tab removed from Listen's own tab strip (`ListenView.tsx`).
      Still reachable at `/listen/favorites` via the sidebar link.
- [x] Library moved to the main sidebar (`AppShell.tsx`, new
      `data-tour-id="nav-library"` item — this also reconnects a pre-existing
      but orphaned `pageTour.ts` tour step of the same id), removed from
      Studio's submenu (`StudioNav.tsx`). `navigationActive.ts` gained a
      `'library'` `SidebarItemId` + resolver branch; it previously only
      existed for the mobile bottom bar. Updated `StudioNav.test.ts` and
      `navigationActive.test.ts` to match (25/25 passing); full `tahti-web`
      unit suite green (435 passed; the 10 "failed" files are pre-existing
      Playwright e2e specs vitest shouldn't be collecting, unrelated).
