---
description: Platform specific considerations
---

## Paths

Tahti Player's Tauri app identifier is `live.tahti.player`; app-data and config directories are keyed off that identifier.

### Appdata

- Linux: `~/.local/share/live.tahti.player/`
- macOS: `~/Library/Application Support/live.tahti.player/`
- Windows: `%APPDATA%/live.tahti.player/`

### Config

- Linux: `~/.config/live.tahti.player/`
- macOS: `~/Library/Application Support/live.tahti.player/config`
- Windows: `%APPDATA%/live.tahti.player/config`
