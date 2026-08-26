# AGENTS.md — `@nuclearplayer/tahti-web`

Package-specific agent instructions. See the root [`AGENTS.md`](../../AGENTS.md) for generic
Nuclear-monorepo conventions (lint/build/test commands, workspace layout) and
[`TAHTI.md`](../../TAHTI.md) for how this fork relates to upstream `nukeop/nuclear`. This file is
about the Tahti product work specifically.

## This package is one half of a two-repo product

`tahti-web` has **no backend of its own**. It is the frontend half of Tahti; the other half —
Fastify API routes, Prisma schema, shared Zod DTOs (`@tahti/shared`), and the production Next.js
client it is replacing — lives in a sibling checkout, **`tahti-org`**, one level up from this
repo's parent workspace directory (i.e. `../tahti-org` relative to `tahti-nuclear-player`'s
parent). The two repos are developed together but versioned separately:

- Anything that touches HTTP contracts, new endpoints, DB schema, or the OG/sitemap/metadata
  server-side pieces happens in `tahti-org/apps/api` (`src/routes/`, response DTOs in
  `packages/shared/src/dto/api-responses.ts`, registered in `src/server.ts`).
- Anything that touches the listen/studio UI, routing, client-side data fetching, or the nginx
  edge config for this SPA happens here, in `packages/tahti-web`.
- Before assuming a feature needs new backend work, check `tahti-org/apps/api` for an existing
  integration first (e.g. Stripe, Sources OAuth, ACRCloud/AcoustID fingerprinting, the sitemap and
  `/api/og/*` proxy endpoints) — a lot of surface area already exists there.

Public API reference: `https://api.tahti.live/api`.

## What this is: a cutover, not a prototype

`tahti-web` is a Vite SPA on Nuclear's UI/player chrome that is meant to **replace** Tahti's
production Next.js `apps/web` client (`app.tahti.live`), not sit alongside it as a side project.
It already talks to the **live** production API (no separate staging backend) and runs today at
`beta.tahti.live`. Treat every screen as production-bound: prioritize clarity, simplicity, and
practicality over decoration. Tahti-specific concepts that don't exist in stock Nuclear (channels,
archives, fingerprinting, fan tiers, studio/go-live) should read as a restrained, native extension
of Nuclear's design language, not a bolted-on skin.

The full plan, decisions log, and phase-by-phase checklist live in
[`CUTOVER.md`](CUTOVER.md); the prod → POC feature-parity tracker is [`FEATURES.md`](FEATURES.md).
Read those before making cutover-scope judgment calls — most "should we do X" questions are
already decided there.

## Status (see CUTOVER.md for the live checklist)

Most P0 blockers are closed: route compatibility (`/c` ↔ `/channel`, `/dashboard` ↔ `/studio`,
subscribe paths), API/Stripe/OAuth return-URL aliases, POC-surface gating for prod builds, real
legal page text (terms/privacy/AGPL), the vital-journey Playwright suite, and the SEO/OG minimum —
including real (not slug-guessed) metadata sync once each view's data loads, and a bot-facing
`/api/og/{channel,profile,release}` proxy in `tahti-org` for non-JS-executing link-preview crawlers
(wired via an nginx user-agent `map` in `deploy/nginx.conf`).

Still open: the production same-origin API proxy switch-over (the SPA's nginx contract is ready;
the prod service/upstream cutover itself hasn't happened), and a rehearsed cutover runbook on
staging/canary. Monorepo placement, admin-host, brand, and beta-retirement policy are all already
decided (§0 of `CUTOVER.md`) — don't re-litigate them without a reason.

## Design system compliance

This app's shared UI — `@nuclearplayer/ui` plus tahti-web's own local shared components
(`StudioPanel`/`StudioPageHeader`, `PageFrame`/`PageHeader`, `PageStates.tsx`'s
`PageLoading`/`PageEmpty`/`PageError`, `InPageNav`, `AdminNav`/`AdminGate`,
`StudioNav`/`StudioGate`, `Badge`, etc.) — is catalogued in Storybook
(`pnpm storybook`, or `packages/storybook/src/tahti-web/*.stories.tsx` directly). That catalogue
is the authoritative reference for what compliant UI looks like here, also linked from the
board-only `/more` page. **Always check new or changed UI against it before shipping:**

- Reuse an existing cataloged component instead of hand-rolling the same pattern again — a status
  pill is `Badge variant="pill" color="..."`, not a hand-styled `<span>`; a page header is
  `PageHeader`/`StudioPageHeader`, not a raw `<h1>`; a data-fetch loading/empty/error state is
  `PageLoading`/`PageEmpty`/`PageError`, not ad-hoc `<p>` text; list rows are `StudioPanel` +
  `divide-y`, not bordered `<li>` cards; icon-only row actions are `Button size="icon"` /
  `size="icon-sm"`, not a raw styled `<button>`.
- Colors come from the semantic Tailwind tokens (`bg-background`, `text-foreground`,
  `border-border`, `text-accent-red`, etc. — see `packages/tailwind-config/global.css`), never raw
  hex/rgb or Tailwind's default palette (`text-red-400` and similar), so the UI stays correct
  across light/dark/tahti-dark. The only legitimate exception is genuinely brand-locked data (a
  real external service's logo color, an artist's own channel-branding accent) — not the app's own
  fixed chrome.
- If a component you need doesn't exist yet in either `@nuclearplayer/ui` or tahti-web's local
  shared components, that's a signal to add it there (with a story) rather than building a one-off
  in the page that needs it — same reasoning as `AGENTS.md`'s (root) "Adding UI Components"
  section.
- The 2026-08-26 entry in [`UI-REDESIGN-WORKLOG.md`](UI-REDESIGN-WORKLOG.md) has the current punch
  list of known compliance gaps across admin/artist/listener (found, not yet fixed) — check it
  before assuming a page you're touching is already clean, and log new findings there in the same
  format rather than fixing silently with no record.

## Plugins

`PLUGIN-STORE-PLAN.md` inventories the 7 subsystems (themes, audio FX, multicast, export,
import/sources, fingerprinting, visualizers) that already behave like plugins and maps what
extracting each into a standalone package would take. When extracting or authoring one:

- **Each plugin is an independent unit.** It should be removable without breaking anything else
  — own directory/package, its own registration into whatever host registry it plugs into, and as
  few cross-plugin imports as possible. A plugin reaching into another plugin's internals is a
  sign the boundary is wrong.
- **A plugin owns its own configuration.** Don't split a plugin's settings across a shared
  Settings panel *and* the plugin module (see `PLUGIN-STORE-PLAN.md`'s `IMPORT_SERVICES` /
  `SOURCE_DEFS` duplication for what this looks like when it goes wrong — two manually-synced
  copies of the same data). The plugin module should be the single source of truth for its
  config shape, defaults, and validation; a host UI renders whatever the plugin exposes rather
  than hardcoding per-plugin fields.
- See [`docs/PLUGINS.md`](docs/PLUGINS.md) for the concrete plugin contract (interface shape,
  directory layout, registration) once a plugin has been extracted against it.

## The goal

Tahti exists to give independent artists a platform that takes their work as seriously as they
do: a **professional, versatile home for artists who care about quality** — live broadcast,
archive, fan subscriptions, and a studio workflow that feels like a real production tool, not a
hobbyist toy. This port's job is to deliver that experience on Nuclear's player-grade UI without
regressing anything the current production client already does well. When a design or scope
decision is ambiguous, weigh it against that bar: does this read as a serious tool an artist would
trust with their channel and their income, or a demo?
