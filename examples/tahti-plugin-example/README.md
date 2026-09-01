# Example settings plugin

This is the smallest useful Tahti Player plugin in this repository. It owns one persisted setting, reads that setting when enabled, and uses the lifecycle hooks expected by the plugin loader.

## Try it

From this directory, install the SDK and load the folder through Tahti Player’s plugin settings:

```bash
pnpm install
```

Then choose **Add plugin**, select this folder, enable **Example settings plugin**, and open Settings. The **Example plugin** category contains the setting owned by this plugin.

## What to copy

- `package.json` declares the plugin manifest, category, permission intent and entry point.
- `src/index.ts` registers settings in `onLoad`, reads them in `onEnable`, and reports lifecycle changes through the logger.
- The setting ID is bare (`showWelcome`); Tahti Player namespaces it as `plugin.tahti-plugin-example.showWelcome`.

For provider-based integrations, replace the setting-only body with a typed `api.Providers` registration and unregister it in `onDisable`. For network access, use `api.Http` and declare the narrowest permission needed. Never claim that a plugin is live until the matching Tahti API route, DTO, auth rule and error state have been verified.
