# ViewShell round 4: remaining plain-header Studio views (2026-09-04)

**Status:** round 1 of 3 done (10/10).
**Deploy:** push + `pnpm deploy:tahti-storybook` (or `gh workflow run "Deploy storybook"`).

Continuing docs/todo/viewshell-page-headers.md's remaining Studio backlog.
Picked the 10 remaining `StudioPageHeader` consumers whose header is plain
title/subtitle/action text — not a cover-image overlay (excluded per the
doc's "entity edit headers that are a cover + chips" rule).

## Round 1 (this commit)

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

Verified: `type-check`, `lint` (0 errors after `eslint --fix` for pure
indentation drift from not hand-reindenting), full `test` suite (427 tests,
75 files) all green.

**Next:** Admin views (17 files, all currently plain `StudioPageHeader`
title/subtitle/action — no cover-overlay cases found there on a first
pass) — rounds 2–3.
