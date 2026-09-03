# Instructions for Claude Code

## Workflow

- For every task with a technical implementation (not a one-line fix), write a todo file under
  `docs/todo/` documenting the plan/approach as you go — not inline in chat only — so there is
  always a durable trace of the work for longevity, even after the chat session is gone. One file
  per task/feature, named for what it tracks. Before starting new work, skim `docs/todo/` for docs
  that are obviously expired (task shipped, branch merged, or stale beyond the effort's lifetime)
  and fold their content into `docs/todo/HISTORY.md` (append, don't overwrite), then delete the
  expired file.
