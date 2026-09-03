# Copilot instructions

Follow the root [`AGENTS.md`](../AGENTS.md) as the source of truth. Also read [`TAHTI.md`](../TAHTI.md) before Tahti-web, API, or registry work. Package-specific rules for the listen/studio SPA are in `packages/tahti-web/AGENTS.md`.

This file used to duplicate a thinner Nuclear Copilot prompt. Do not treat it as a second style guide. If anything here disagrees with `AGENTS.md`, `AGENTS.md` wins.

## This repo

Tahti Player is a free, open-source music player (no ads, no tracking). This tree is the Tahti fork of [Nuclear](https://github.com/nukeop/nuclear) (`janiluuk/tahti-player`), not a from-scratch rewrite. Upstream is `nukeop/nuclear`.

The listen/studio web client is `@tahti-player/tahti-web` (beta.tahti.live). HTTP contracts live in the sibling `../tahti` repo. The Store catalog is `../tahti-registry`, not the player's on-disk runtime `plugins.json`.

**Themes** are CSS variables that drive Tailwind. **Plugins** are unsandboxed and can control any part of the player.

## Do not

- Do not use Serena or any other tool that is not available in this workspace.
- Do not prefer an IDE test-runner over `pnpm test` / package filters.
- Do not invent API shapes for `tahti-web`. Check `../tahti` first.
- Do not skip `tahti-registry` after adding or changing a Store plugin or theme.

## Commands

```bash
pnpm dev          # player
pnpm dev:tahti    # tahti-web (see TAHTI.md)
pnpm storybook
pnpm build
pnpm lint
pnpm type-check
pnpm test
pnpm tauri
```

## Stack (short)

TypeScript, Tauri, Vite, Vitest, pnpm, Turborepo, Tailwind v4 (`packages/tailwind-config/global.css`, no `tailwind.config.js`, no built-in palette colors), TanStack Router, TanStack Query v5, Zustand, Lucide, motion, tw-animate-css.

Packages include `@tahti-player/player`, `ui`, `plugin-sdk`, `model`, `themes`, `hifi`, `i18n`, `tahti-web`, `docs`, `website`, `storybook`, `tools`, `tailwind-config`, and `eslint-config`.
