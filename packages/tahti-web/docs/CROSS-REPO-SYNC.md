# Cross-repo documentation sync

Canonical pointers when both checkouts are open:

| What | Where |
| --- | --- |
| Production API + OpenAPI | Sibling `../tahti` (`openapi.json`, `https://api.tahti.live/api`) |
| Fan-sub money flow spec | `../tahti/docs/engagement-and-fansubs.md` |
| Payout runbook + €4.45 caveat | `../tahti/docs/flows/payouts.md` |
| Governance status | `../tahti/docs/governance-worklog.md` |
| Production route map | `../tahti/docs/flows/site-map.md` (`/dashboard/*`) |
| Beta deploy ops | `deploy/README.md` here + `../tahti/ops/beta-tahti-live.md` |
| Cutover gates | `CUTOVER.md` here (prod stub: `../tahti/ops/nuclear-web-cutover.md`) |
| Plugin/theme Store catalog | Sibling `../tahti-registry` (`plugins.json`, `themes/`). After plugin add/change, check that repo (new listing or version bump). |

## Checkout names

This monorepo directory may be `tahti-nuclear` or `tahti-player`. Sibling production stack is always **`../tahti`** (GitHub `janiluuk/tahti-org`). Official Store catalog is **`../tahti-registry`** (GitHub `janiluuk/tahti-registry`). Older ops docs still say `tahti-player` — use the path that exists on disk.

## Route aliases (prod → beta)

| Production | Beta client |
| --- | --- |
| `/listen` | `/` |
| `/dashboard/revenue` | `/studio/revenue` (UI: Audience) |
| `/dashboard/governance` | `/studio/governance` (artist) + `/governance` (member, Settings → Account) |
| `/dashboard/*` | `/studio/*` (redirects exist) |

Production documents member governance as `/governance` and `/dashboard/governance` in one shell. Beta deliberately splits member (`/governance`), artist (`/studio/governance`), and board (`/admin/governance`, `/admin/agm`). Studio Perform’s `/studio/schedule` is labelled **Broadcast** (24/7 programme lives on that page).

## Live feature status in this package

Use **`FEATURES.md`** and **`WORKPLAN.md`** for shipped vs partial. **`CONVERSION-QUEUE.md`** is archived — do not treat its admin `missing` rows as current.

## Money-flow UI copy

Help and Audience show the ledger model (€5 → ~€4.45 after Stripe + 2% ops). `../tahti/docs/flows/payouts.md` may still block calling that a guaranteed bank figure until Stripe `balance_transaction` proof lands — label it as the documented split, not a live bank guarantee.

## Tooling

| | `../tahti` | This repo |
| --- | --- | --- |
| Node | 24+ | 24+ (`.node-version`, `engines`) |
| Default branch | `main` | `master` |
| pnpm | 9.x (`packageManager`) | 10.x |
