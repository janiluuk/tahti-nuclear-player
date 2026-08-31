# AGENTS.md — `@nuclearplayer/tahti-web`

Package-specific agent instructions. See the root [`AGENTS.md`](../../AGENTS.md) for generic
Nuclear-monorepo conventions (lint/build/test commands, workspace layout) and
[`TAHTI.md`](../../TAHTI.md) for how this fork relates to upstream `nukeop/nuclear`. This file is
about the Tahti product work specifically.

## This package is one half of a two-repo product

`tahti-web` has **no backend of its own**. It is the frontend half of Tahti; the other half —
Fastify API routes, Prisma schema, shared Zod DTOs (`@tahti/shared`), and the production Next.js
client it is replacing — lives in a sibling checkout, **`tahti`**, i.e. `../../../tahti` relative to
this file (both repos sit side by side under the same parent workspace directory, e.g.
`/home/jani/workspace/tahti` next to `/home/jani/workspace/tahti-nuclear`). The two repos are
developed together but versioned separately, each with their own git history — check `git status`
in both when a task spans the boundary.

- Anything that touches HTTP contracts, new endpoints, DB schema, or the OG/sitemap/metadata
  server-side pieces happens in `tahti/apps/api` (`src/routes/`, response DTOs in
  `packages/shared/src/dto/api-responses.ts`, registered in `src/server.ts`).
- Anything that touches the listen/studio UI, routing, client-side data fetching, or the nginx
  edge config for this SPA happens here, in `packages/tahti-web`.
- Before assuming a feature needs new backend work, check `tahti/apps/api` for an existing
  integration first (e.g. Stripe, Sources OAuth, ACRCloud/AcoustID fingerprinting, the sitemap and
  `/api/og/*` proxy endpoints) — a lot of surface area already exists there.

**Where to find the actual API contract before building against it (in priority order):**

1. `tahti/apps/api/src/routes/**` — the real Fastify route handlers; the source of truth for what
   an endpoint accepts/returns today. `rg` for the resource name here before assuming a shape.
2. `tahti/packages/shared/src/dto/api-responses.ts` (and sibling DTO files in
   `tahti/packages/shared/src/dto/`) — the typed Zod request/response contracts both `apps/api`
   and `apps/web` import; this is what a new `tahti-web` API client function should match.
3. `tahti/openapi.json` (full, internal) and `tahti/openapi.public.json` (public subset) — generated
   OpenAPI specs checked into the repo root; useful for a quick shape lookup without reading route
   code, but the route/DTO source wins if they've drifted.
4. `https://api.tahti.live/api` — the live, deployed public API reference (Scalar UI over
   `openapi.public.json`, served by `tahti/apps/api/src/routes/public-api-docs.ts`); only covers the
   public-facing surface, not internal/authenticated-only routes.
5. [`docs/API-REFERENCE.md`](docs/API-REFERENCE.md) — this package's own written notes on which
   contract areas the client actually uses and the permission boundaries to check before adding a
   view; not a replacement for (1)-(3), a map onto them. It carries a `pnpm check:api-docs`
   (`scripts/check-api-docs.mjs`)-enforced SHA-256 marker over `tahti/openapi.json`'s path set — run
   that script (needs `../tahti` checked out alongside this repo) after either repo's routes change
   to confirm the two haven't drifted; update the marker deliberately, don't silence the check.

If a feature you're porting has no route in (1) and no DTO in (2), it does not have a real
contract yet — do not invent one client-side (no fabricated response shapes, no silently-mocked
endpoints presented as live). Either use the existing mock path (`api/mode.ts`'s `forceMock()`
pattern, see `MOCKS.md`) and say so in the worklog entry, or flag that the sibling API needs the
route added first — see `docs/PLUGIN-INTEGRATIONS.md` for the standing per-plugin
API-counterpart checklist this project already tracks that gap with.

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
`/api/og/{channel,profile,release}` proxy in `tahti` for non-JS-executing link-preview crawlers
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

## Per-page widgets configure from Add-ons, not a separate settings section

For simplicity, every main page's customizable widgets — internet radio, SoundCloud/YouTube
embeds, the Listen page's sandboxed disco-widgets, a channel/artist page's disco-widgets, and
whatever else follows this shape — get their configuration from **one place**: Settings → Add-ons
(`components/PluginStorePanel.tsx`, category registry in `content/pluginStoreCategories.ts`), as
one category tab per concern (see the existing `radio`/`embed`/`discovery`/`channel` categories).
Don't add a second, separate settings section for a new page's widgets (that's what the old
Settings → Widgets section was, before it got folded into Add-ons — don't recreate it). If a
category has enough to configure that one flat list of `PluginStoreItem`s isn't enough (multiple
distinct sub-concerns, each with their own form/list), give that category's own body internal
sub-tabs via `Tabs` rather than cramming everything into one scroll — `VisualizersCategory`'s
per-preset `ConfigurableCard` fold-outs are the existing pattern for "one entry, more to configure
than fits inline."

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

The add-on inventory, API-counterpart checklist, settings ownership rules, and current integration
state are documented in [`docs/PLUGIN-INTEGRATIONS.md`](docs/PLUGIN-INTEGRATIONS.md). Read it before
adding a provider or configuration dialog; it distinguishes standalone Nuclear runtime plugins
from Tahti page add-ons and records which sibling `../tahti` API contract each one needs.

## The goal

Tahti exists to give independent artists a platform that takes their work as seriously as they
do: a **professional, versatile home for artists who care about quality** — live broadcast,
archive, fan subscriptions, and a studio workflow that feels like a real production tool, not a
hobbyist toy. This port's job is to deliver that experience on Nuclear's player-grade UI without
regressing anything the current production client already does well. When a design or scope
decision is ambiguous, weigh it against that bar: does this read as a serious tool an artist would
trust with their channel and their income, or a demo?

## Current implementation state — 2026-08-28

This is a working cutover build, not a blank scaffold. The following surfaces are implemented in
`packages/tahti-web` and should be extended in place rather than recreated:

- The Nuclear shell has stable listener, artist/studio, admin, settings, chat, notifications, and
  history navigation. Studio uses four top sections — Studio, Library, Perform, and Manage — with
  contextual left navigation; Collections owns the Playlists filter instead of exposing a separate
  broken Library sidebar route.
- Artist library includes Sounds, Releases, Collections, Smartlinks, Recordings, Upload, Editor,
  and Stash. Sounds supports upload-date/source filtering, compact filters, hover playback, stash
  movement, release playback/embeds, track editing, privacy/discovery controls, rotation, and
  MusicBrainz export preparation.
- Go Live includes stream status, encoder credentials, recording, multistream destinations, the
  shared rotation editor, and the Tahti pre-flight workflow. Pre-flight uses the existing
  `/api/me/channel/preflight`, `/api/me/rtmp-targets`, and show-series endpoints.
- Public channel pages and Go Live expose the Tahti-style share icon. The share preference is
  currently persisted client-side per channel in `channelShareStore`; it defaults to visible and is
  controlled from Settings → Channel → Discovery. Do not describe this as a server-wide privacy
  setting until the API has a corresponding persisted field.
- The track editor follows the reference five-section workflow — Basics, Audio, Cover & visuals,
  Sharing, and Advanced — and shows Tracklist only while the selected content type is `DJ_MIX`.
- Add-ons are configured from Settings → Add-ons. Configurable providers use modal/fold-out
  configuration, and unconfigured Spotify artist import links to Admin → Vendors with the required
  Web API credential explanation.
- Cross-repo parity work is tracked in `UI-REDESIGN-WORKLOG.md`, `CUTOVER.md`, and `FEATURES.md`.
  Reference production behavior and source live in the sibling `../tahti` checkout; inspect that
  code before inventing new API contracts or UI flows.

Known limitations and handoff notes:

- The Spotify Configure CTA currently routes to the existing Admin → Vendors information page;
  credential entry still needs a real server-backed admin form if that page is to configure secrets.
- Share visibility is local/persisted in the browser until a backend preference is added.
- The pre-flight panel is integrated into Go Live, but should receive a Playwright pass against a
  real authenticated API before deployment, especially series selection, simulcast changes, and
  auto-record persistence.
- The working tree may contain large, intentional uncommitted UI audit screenshots, worklog,
  changelog, and feature changes from the ongoing cutover. Inspect `git status` and preserve
  unrelated changes; never reset or clean the tree to make a task easier.

## Agent workflow for this checkout

1. Read this file, the root `AGENTS.md`, and the relevant worklog entry before changing a Tahti
   view. For parity work, inspect the matching page in `../tahti` and its API route first.
2. Search with `rg`, follow existing API clients and shared components, and keep route behavior
   stable. Prefer `StudioPanel`, `StudioPageHeader`, `PageHeader`, `Badge`, `Button`, `Tabs`,
   `Dialog`, `FilePicker`, and `SettingsToggle` over new one-off markup.
3. Keep API calls in `src/api`, state in an existing store or local component state as appropriate,
   and keep user-facing text consistent with existing Tahti wording. Add a changelog entry and a
   concise dated worklog entry for user-visible changes.
4. For navigation changes, verify both route selection and rendered menu state. A route must not
   light two submenu items, move the sidebar, hide the top navigation, or change content width.
5. Run focused checks after edits:

   ```bash
   pnpm exec prettier --write <changed-files>
   pnpm --filter @nuclearplayer/tahti-web type-check
   pnpm --filter @nuclearplayer/tahti-web lint
   git diff --check
   ```

   Use the existing Playwright/audit scripts when changing navigation or responsive layout. Do not
   claim deployment or production verification unless the deploy script was actually run and its
   result is reported.
6. Do not commit, push, deploy, or modify the sibling `../tahti` checkout unless the user asks for
   that operation. When asked to commit, include only the intended files and report any pre-existing
   unrelated changes left in the working tree.
