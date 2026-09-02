# Import Sources

Wraps each `SourceDef` in `../../api/sources.ts` (bandcamp, soundcloud,
google-drive, mixcloud, spotify, hearthis, url, upload, stash, radio) with
kind-specific adapters. HTTP calls stay in `api/sources.ts`; adapters are
the only contract Settings → Add-ons (Import) and Studio Upload should use.

The retired `/sources` page now redirects into Add-ons. `PluginStorePanel`
and `StudioUploadView` are the Sources host.

## Three adapter kinds

Do not force these into one `start/status/import` shape.

### OAuth (`oauth.ts`)

Bandcamp, SoundCloud, Google Drive, Mixcloud.

```ts
checkStatus();
oauthUrl; // full authorize URL
disconnect();
// Bandcamp only
listAlbums();
importAlbum(album);
// SoundCloud only
listTracks();
importTracks(tracks);
```

MusicBrainz stays a fingerprinting OAuth connection and uses
`oauthAdapterFor('musicbrainz', path)` rather than a catalog adapter.

### Search (`search.ts`)

Spotify and hearthis.at — search-then-add, no connect/disconnect.

```ts
spotifySourceAdapter.search(query);
spotifySourceAdapter.importTracks(tracks);
hearthisSourceAdapter.search(query);
hearthisSourceAdapter.library();
hearthisSourceAdapter.importTracks(destinationId, tracks);
```

### Tool / upload (`tool.ts`)

URL paste, internet radio, local upload, stash. Metadata, `checkStatus()`,
and optional `studioDeepLink` only.

## Sibling API

`GET /api/me/import-plugins` in `../tahti` lists the same ids and kinds.
See `docs/technical/import-plugin-contracts.md` there. Export/DSP
submit/status/webhook is **not** this contract.

## Consumers

- `PluginStorePanel` Import / URL paste cards
- `StudioUploadView` import-source widgets
