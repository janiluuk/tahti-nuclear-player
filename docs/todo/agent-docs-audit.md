# Agent instructions & documentation audit

**Status:** open

**Branch:** `perf/audit`

**Canvas:** [agent-docs-audit](/home/jani/.cursor/projects/home-jani-workspace-tahti-nuclear/canvases/agent-docs-audit.canvas.tsx)

## Round 1 (applied)

Sibling `../tahti-org`, START-HERE, INDEX, todo→HISTORY fold, open-only WORKPLAN, slim tahti-web AGENTS, DECISIONS, STORYBOOK-SURFACES, `tahti-web-ship-loop` skill, short Cursor rules.

## Round 2 (audited with the new instruction set)

Method: START-HERE → INDEX → WORKPLAN / FEATURES Remaining / DECISIONS. Did **not** skim worklog or full todo dir.

### Still broken / wasteful

| Pri | Issue |
| --- | --- |
| P0 | `FEATURES.md` **Remaining** is mostly `[x]` shipped rows |
| P0 | `queued-ux-fixes-2026-09-05.md` keeps many `[x]` items while Status `open` |
| P0 | `ci-snapshot-digest.md` on disk, missing from INDEX; Status `in progress` (not enum) |
| P0 | Root `AGENTS.md` still ~535 lines always in context |
| P1 | No always-apply rule pointing at START-HERE + INDEX |
| P1 | Status lines still free-form prose after `open`/`partial` |
| P1 | Gitbook `agent-instructions.md` still ~524-line stale mirror |
| P1 | WORKPLAN and INDEX duplicate the same backlog |
| P1 | `STUDIO-ADMIN-UX-SWEEP.md` (227 lines) still opened from WORKPLAN |
| P2 | `STORYBOOK-SURFACES.md` too thin → agents still glob Storybook |
| P2 | FEATURES Remaining not a separate short file |
| P2 | This audit todo should fold round-1 narrative to HISTORY |

### What already works

- Path naming + tahti-web AGENTS length
- Do-not-scan + INDEX door
- Cursor rules as short pointers
- Todo lifecycle written in CLAUDE / START-HERE

## Next

Implement round-2 P0 pack unless superseded.
