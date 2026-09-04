# Finnish catalog → Radio Browser Stations

**Status:** done (2026-09-04). Curated `RADIO_STATIONS` live under Radio
Browser → Stations; Installed/Available PluginStoreItem list removed;
`radio-cover` e2e uses Activate → Configure → Stations.

## Goal

Move curated `RADIO_STATIONS` into **Add-ons → Radio → Radio Browser
directory → Stations**, and drop the separate Installed/Available
per-station PluginStoreItem list under the Radio category.

## Required

1. Stations tab: curated Finnish list (`RADIO_STATIONS` + overrides) with
   Enable (`enabledStationIds`), Configure/Edit, Play when `streamUrl` set;
   keep "Your stations" (`savedBrowserStations`); remove API-only Finnish
   suggestions (no duplicate Finnish lists).
2. RadioCategory: keep Personal stream, Radio Browser card, Suggest form;
   delete Installed/Available + edit Dialog (edit lives in Stations).
3. Update `pluginStoreCategories` radio description.
4. Update `e2e/radio-cover.spec.ts` for the Stations path.
5. Typecheck / unused imports clean.

## Notes

Listen tiles still use `enabledStationIds` + `stationOverrides` —
unchanged ownership.
