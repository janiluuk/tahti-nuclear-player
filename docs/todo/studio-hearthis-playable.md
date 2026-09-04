# Studio hearthis playable path

**Status:** done (2026-09-04).

Studio/Library play paths use `playableFromStudioHearthis` so HEARTHIS
embeds never use `fetchEditorSource` DEMO_MP3 or hotlinked `streamUrl`.
Shared helper: `packages/tahti-web/src/lib/embedPlayback.ts`.
