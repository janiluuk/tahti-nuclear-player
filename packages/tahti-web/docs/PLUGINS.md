# Writing a plugin

`src/plugins/` holds every subsystem from [`PLUGIN-STORE-PLAN.md`](../PLUGIN-STORE-PLAN.md)
extracted into a standalone unit so far — the whole original inventory of
7, plus `export`, though `import-sources` and `export` are deliberately
partial (see their own READMEs for why). This doc is the contract they
follow — read it before extracting anything else, or before touching one
of these:

| Plugin | What it is | Docs |
|---|---|---|
| `themes` | Theme selection, persistence, custom-theme import | [README](../src/plugins/themes/README.md) |
| `multicast` | RTMP destination registry (YouTube, Twitch, ...) | [README](../src/plugins/multicast/README.md) |
| `fingerprinting` | AcoustID track-match provider | [README](../src/plugins/fingerprinting/README.md) |
| `audio-fx` | Pro Editor plugin chain (EQ/Compressor/Limiter/Filter) | [README](../src/plugins/audio-fx/README.md) |
| `mastering` | Client-side reference mastering (Matchering loudness, tonal balance, and limiter) | [README](../src/plugins/mastering/README.md) |
| `export` | DSP/export-target metadata registry (partial — no per-target behavior yet) | [README](../src/plugins/export/README.md) |
| `import-sources` | Import-source connection-status contract (partial — see README) | [README](../src/plugins/import-sources/README.md) |
| `visualizers` | Channel visualizer WebGL presets | [README](../src/plugins/visualizers/README.md) |

There is **no single generic `Plugin` interface** shared across all of
them. Themes, RTMP destinations, and fingerprint providers are different
enough domains that forcing one shape onto all three would just be an
abstraction nobody needed — see
[AGENTS.md](../AGENTS.md#plugins) and the top-level project convention
against speculative abstractions. What's shared is a **pattern**, not a
type.

## The pattern

1. **A plugin is a directory under `src/plugins/<name>/`.** Nothing outside
   that directory should need to know how the plugin works internally —
   only its exported contract (a hook, a registry array, a provider
   object).
2. **A plugin owns its own configuration.** Its shape, defaults, and any
   validation live in the plugin module. A host view renders from what the
   plugin exports; it does not hardcode a second copy of the plugin's data
   to save an import. If you catch yourself typing out a list that already
   exists somewhere else in the codebase, you're about to create the kind
   of drift bug `src/plugins/multicast/providers.ts` was extracted to fix
   (the frontend's hardcoded provider list had silently fallen behind the
   API's real supported providers — see git history on that file).
3. **`index.ts` is the plugin's public surface.** Import from
   `../plugins/<name>`, not from a sibling file inside the plugin
   directory. This is what makes "is this plugin removable" a real
   question you can answer by grepping for one import path.
4. **A plugin doesn't reach into another plugin.** Cross-plugin
   dependencies are a sign the boundary is drawn wrong — if two plugins
   genuinely need to share something, that something probably belongs
   outside `src/plugins/` (an API client, a shared type), not imported
   plugin-to-plugin.

## Two shapes, in practice

Most plugins here are one of two shapes. Pick whichever matches what
you're building.

### A. Registry of typed config objects

Use this when the "plugin" is really a set of interchangeable options a
host UI picks from — a dropdown, a provider list — and there's no real
per-option *behavior*, just per-option *data*.

`src/plugins/multicast/`:

```ts
// types.ts
export interface MulticastProvider {
  id: string; // wire value stored on RtmpTarget.provider
  label: string;
  rtmpUrlHint?: string;
}

// providers.ts
export const multicastProviders: MulticastProvider[] = [
  { id: 'YOUTUBE', label: 'YouTube', rtmpUrlHint: 'rtmp://a.rtmp.youtube.com/live2' },
  // ...
];
export function multicastProviderLabel(id: string): string {
  return multicastProviders.find((p) => p.id === id)?.label ?? id;
}
```

**Adding an option** means adding one entry to the array — nothing in
`StudioGoLiveView.tsx` or `StreamManagerPanel.tsx` changes, since both
already render from `multicastProviders`/`multicastProviderLabel` instead
of a hardcoded list.

### B. Interface + implementation(s)

Use this when different options genuinely behave differently — different
API calls, different result shapes — not just different labels.

`src/plugins/fingerprinting/`:

```ts
// types.ts
export interface FingerprintProvider {
  id: string;
  label: string;
  match(releaseId: string, trackId: string): Promise<FingerprintOutcome>;
  check(releaseId: string, trackId: string): Promise<FingerprintOutcome>;
}

// acoustid.ts
export const acoustIdProvider: FingerprintProvider = {
  id: 'acoustid',
  label: 'AcoustID',
  match: refingerprintTrack,
  check: checkTrackFingerprint,
};

// index.ts
export const fingerprintProviders: FingerprintProvider[] = [acoustIdProvider];
```

**Adding a provider** means a new sibling module implementing
`FingerprintProvider` and one line added to `fingerprintProviders` — not a
branch inside existing fingerprint code. `FingerprintTrackPanel.tsx`
already calls through `acoustIdProvider.match`/`.check` rather than the
raw API functions, so swapping or adding a provider doesn't touch it.

### When a plugin is "just a store"

`src/plugins/themes/` doesn't fit either shape above — it's a single
provider with no interchangeable alternatives, just a self-contained
Zustand store (`useThemeStore`) that already owns everything about theme
selection, persistence, and custom-theme import. There's nothing to
extract into an interface until a second kind of theme *source* exists.
The extraction here was purely structural: move the file under
`src/plugins/themes/`, keep its public interface identical, update
importers. If you're not sure whether a subsystem needs a registry, an
interface, or just a relocated store, this is the default — don't build
scaffolding a single implementation doesn't need.

## Host UI still lives outside the plugin

None of this moves the *view* that renders a plugin's options —
`StudioGoLiveView.tsx`, `FingerprintTrackPanel.tsx`, `SettingsPanels.tsx`'s
`ThemesPanel` all stay where routing/Settings navigation expects them.
Only the plugin owns its data and behavior; the host component is what
puts it on screen. Don't conflate "extract the plugin" with "move the
screen that uses it."

## Testing a plugin

A plugin's own test file lives next to it inside its directory
(`src/plugins/<name>/<file>.test.ts`), not in a separate top-level test
tree — same convention as the rest of the codebase. What to stub depends
on what the plugin touches:

- **Talks to the API** (fingerprinting): stub `fetch` with `vi.stubGlobal`
  and assert the request shape/response handling, same pattern as
  `api/sources.test.ts`. See `src/plugins/fingerprinting/acoustid.test.ts`.
- **Pure data/registry** (multicast): no stubbing needed — assert directly
  on the exported array/lookup function. See
  `src/plugins/multicast/providers.test.ts`.
- **Browser APIs vitest's environments don't implement** (audio-fx's
  `AudioContext` — neither the default `node` environment nor `jsdom`
  provide real Web Audio): write a minimal fake covering only the methods
  the plugin actually calls, and assert on what got written onto the fake
  nodes. See `src/plugins/audio-fx/testAudioContext.ts` and its four
  plugin tests. Don't reach for a heavier dependency (a full Web Audio
  polyfill) just to unit-test parameter mapping.

A registry-shaped plugin (§A above) is also worth a test on the registry
itself, not just its entries: unique ids, and — if the registry mirrors
an external source of truth like `multicastProviders` mirrors the API's
`PROVIDER_RTMP_URLS` — a test that would fail if a real provider silently
fell off the list, since that's exactly the kind of drift this pattern
exists to catch.

## Extracting the next one

Every subsystem in the original `PLUGIN-STORE-PLAN.md` inventory has now
been extracted; the one open item is finishing `import-sources`'
per-source split (§5 — the connection-status contract is done, the actual
OAuth/search/import-job logic per source isn't). If a new plugin-shaped
subsystem shows up later, the general process:

1. Find every current importer of the subsystem's state/logic
   (`grep -rl` for the store or API functions).
2. Decide which shape above fits (or neither — see themes).
3. Create `src/plugins/<name>/` with `types.ts` (if there's a real
   interface), the implementation(s), and an `index.ts` barrel.
4. Point every importer at `../plugins/<name>` and delete the old
   location — don't leave a re-export shim behind "just in case."
5. `pnpm type-check` and `pnpm lint` across the whole package, not just the
   files you touched — a plugin's importers are often scattered further
   than the subsystem's own directory suggests.
