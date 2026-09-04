# ViewShell listener batch (Chat → Transparency)

**Status:** done.
**Date:** 2026-09-04

Migrated listener hubs from `PageHeader`/`PageFrame` to `ViewShell`:

| Page | Title | Subtitle |
| --- | --- | --- |
| Chat (picker) | Chat | Pick a channel to open chat. |
| Chat (slug) | Chat | `{slug}` |
| Governance | Governance | Vote on cooperative motions. |
| Feature requests | Feature requests | Propose and vote on what Tahti builds. |
| More | Tahti map | Screens, flows, and feature parity. |
| Transparency | Transparency | Public co-op ledger. |

Back/actions/meta moved into children. `embedded` Governance / Feature
requests skip `ViewShell` (Studio nest). Classes: `px-0 pt-0` + prior
max-widths.
