# Channel Design crash + `edit=%221%22` URL

**Status:** shipped in tahti-web 0.0.77.

## Symptoms

- Clicking Design channel / Edit design opens
  `https://beta.tahti.live/channel/<slug>?edit=%221%22` and shows
  "Something went wrong".
- Channel page can crash after load for the same reason even without edit.

## Causes

1. **Rules of Hooks** — `ChannelView` calls `useMemo` for `lookExtras`
   *after* early returns for loading / missing channel. First paint
   (loading) skips the hook; loaded paint adds it → React throws.
2. **Search serialization** — links pass `edit: '1'` (string). TanStack
   Router JSON-stringifies search values, so the URL becomes
   `edit=%221%22`. Prefer `edit: true` → `?edit=true`.

## Fix

- Move `lookExtras` `useMemo` above early returns (null-safe when no channel).
- Change channel route search to `edit?: boolean`; navigate/link with
  `edit: true`; accept legacy `'1'` / `1` / `"1"` in `validateSearch`.
