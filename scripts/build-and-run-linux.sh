#!/usr/bin/env bash

set -euo pipefail

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This command must be run on Linux." >&2
  exit 1
fi

repository_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

pnpm --filter @nuclearplayer/player build:frontend
pnpm --filter @nuclearplayer/player tauri build \
  --no-bundle \
  -c '{"build":{"beforeBuildCommand":""},"bundle":{"active":false,"createUpdaterArtifacts":false}}'

application_path="$repository_root/packages/player/src-tauri/target/release/tahti-player"
if [[ ! -x "$application_path" ]]; then
  echo "Build completed but the Linux application was not found at $application_path." >&2
  exit 1
fi

exec "$application_path" "$@"
