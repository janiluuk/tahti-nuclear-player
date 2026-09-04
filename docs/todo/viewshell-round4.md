# ViewShell round 4: remaining plain-header Studio/Admin views (2026-09-04)

**Status:** round 2 of 3 done (20/20 total so far).
**Deploy:** push + `pnpm deploy:tahti-storybook` (or `gh workflow run "Deploy storybook"`).

Continuing docs/todo/viewshell-page-headers.md's remaining Studio + Admin
backlog. Picked `StudioPageHeader` consumers whose header is plain
title/subtitle/action text — not a cover-image overlay (excluded per the
doc's "entity edit headers that are a cover + chips" rule).

## Round 1

1. StudioGovernanceView
2. StudioModerationView — header was `{!embedded && (...)}`-gated; extracted
   the Tabs/ConfirmDialog body into a `content` const so `embedded` mode
   still skips ViewShell (matches the Chat/Governance/Feature-requests
   "embedded skips ViewShell" precedent) without duplicating ~200 lines of
   JSX.
3. StudioMasteringView
4. StudioStripeView
5. StudioTrackInsightsView
6. StudioEventCreateView
7. StudioBrandingView — `action` (View public profile link) moved to first
   child.
8. StudioDistributionView — `action` (Back to Releases link) moved to first
   child, per the doc's "Back — first child, not a header prop" rule.
9. StudioEditorProjectView — `action` (Delete + Pro editor buttons) moved to
   first child; StudioPanel's own separate `action` (Saving/Saved status)
   left untouched, that's a different prop on a different component.
10. StudioStatsDetailView — `action` (FilterChips range picker) moved to
    first child.

Left as-is (excluded, cover-image overlay headers, not this batch's shape):
StudioSoundView, StudioReleaseDetailView, StudioShowDetailView,
StudioCollectionEditView, StudioProEditorView — need individual review for
the "non-maximized chrome only" carve-out; deferred to a later round.

## Round 2

1. AdminActivityView
2. AdminAgmView — `action` (Governance overview link) moved to first child.
3. AdminArtworkPresetsView — `action` (Reset to defaults button) moved to
   first child.
4. AdminDiscoWidgetsView — `action` (Register widget icon button) moved to
   first child.
5. AdminFinancialView
6. AdminGovernanceView
7. AdminGrantCycleView — `action` (Board CSV + All cycles links) moved to
   first child; dynamic title (`${year} grant cycle`) kept as-is.
8. AdminGrantsView — `action` (Governance overview link) moved to first
   child.
9. AdminI18nView — `action` (New language icon button) moved to first
   child.
10. AdminLogsView

All Admin views follow the same `<AdminGate><div className="admin-page-
layout px-1 py-2"><AdminPageLayout current="..."><div className="flex ...
flex-col gap-6"><ViewShell ...>` nesting — `AdminPageLayout` tabs stay
outside `ViewShell` per the doc's contract, same as `StudioNav` in Studio.
All 17 `AdminXView` files use plain title/subtitle/action headers — no
cover-image overlay cases found in Admin, unlike the Studio entity pages
above.

Verified both rounds: `type-check`, `lint` (0 errors after `eslint --fix`
for pure indentation drift from not hand-reindenting), full `test` suite
(427 tests, 75 files) all green.

**Next (round 3):** AdminRadioView, AdminReportsView, AdminStorageUserView,
AdminStorageView, AdminVendorsView, AdminVenuesView, and
`admin/moderation/AdminModerationView` — the last 7 `StudioPageHeader`
consumers. After round 3, only the excluded cover-overlay Studio entity
pages remain (StudioSoundView, StudioReleaseDetailView, StudioShowDetailView,
StudioCollectionEditView, StudioProEditorView) plus deleting/narrowing
`StudioPageHeader` itself once those are resolved.
