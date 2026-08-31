import type { PluginCategoryId } from './pluginStoreCategories';

/**
 * Ported from the live Nuclear plugin registry
 * (https://cdn.jsdelivr.net/gh/NuclearPlayer/plugin-registry@master/plugins.json).
 * `category` mirrors that registry's own `category` field (its taxonomy is
 * `metadata | streaming | lyrics | scrobbling | dashboard | playlists |
 * discovery | other`) so the tab list in NuclearPluginAddonsCategory, which
 * derives its tabs from whatever categories are actually present here,
 * never shows a category with zero entries. Re-run this port whenever the
 * upstream registry changes; keep `status`/`fields`/`note`/`apiCounterpart`
 * as the Tahti-side judgment call, not something the registry defines.
 */

export type NuclearPluginField = {
  id: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  kind?: 'text' | 'password' | 'url' | 'textarea' | 'select';
  options?: Array<{ value: string; label: string }>;
  description?: string;
};

export type NuclearPluginApiCounterpart = {
  status: 'implemented' | 'partial' | 'missing';
  routes: string[];
  note: string;
};

/** Points at a real, already-working feature elsewhere in the app, so the
 * Configure dialog can hand off to it instead of collecting fields into a
 * local-only stub that duplicates (and disagrees with) the real thing —
 * same issue Bandcamp/SoundCloud/hearthis had before they were wired into
 * OAuthServiceCard/HearthisCard directly. */
export type NuclearPluginRealFeature =
  | { kind: 'plugin-category'; category: PluginCategoryId; label: string }
  | { kind: 'route'; to: string; label: string };

export type NuclearPluginAddon = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'available' | 'partial' | 'planned';
  statusLabel: string;
  fields: NuclearPluginField[];
  note: string;
  apiCounterpart: NuclearPluginApiCounterpart;
  realFeature?: NuclearPluginRealFeature;
};

export const NUCLEAR_PLUGIN_ADDONS: NuclearPluginAddon[] = [
  {
    id: 'discogs',
    name: 'Discogs',
    category: 'Metadata',
    description: 'Fetch artist and album metadata from Discogs.',
    status: 'partial',
    statusLabel: 'Metadata tools available',
    fields: [
      {
        id: 'token',
        label: 'Personal access token',
        placeholder: 'Optional Discogs token',
        secret: true,
      },
    ],
    note: 'The current release workflow uses Discogs search and prefill. Full provider-backed catalog search is not exposed by the Tahti API yet.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/me/releases/import'],
      note: 'Release import exists, but no standalone Discogs provider endpoint is exposed.',
    },
    realFeature: {
      kind: 'route',
      to: '/studio/distribution',
      label: 'Open the real Discogs prefill in Studio → Distribution',
    },
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Streaming',
    description:
      'A streaming provider that plays audio from YouTube using yt-dlp.',
    status: 'partial',
    statusLabel: 'Embeds available',
    fields: [
      {
        id: 'apiKey',
        label: 'YouTube Data API key',
        placeholder: 'Optional API key',
        secret: true,
      },
    ],
    note: 'YouTube embeds are available in the Listen add-on. Provider-backed search and stream resolution are not enabled by the Tahti API.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/v1/channels/:slug/disco-widgets'],
      note: 'Embedded playback is supported; provider search is not a Tahti API operation.',
    },
    realFeature: {
      kind: 'plugin-category',
      category: 'listen',
      label: 'Open the real YouTube listener widget in Listen',
    },
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    category: 'Metadata',
    description: 'Browse and play music from Bandcamp.',
    status: 'available',
    statusLabel: 'Importer available',
    fields: [
      {
        id: 'username',
        label: 'Bandcamp artist name',
        placeholder: 'your Bandcamp name',
      },
    ],
    note: 'The connected Bandcamp source already supports OAuth connect and server-side catalog import into the archive.',
    apiCounterpart: {
      status: 'implemented',
      routes: ['/api/me/bandcamp/oauth/start', '/api/v1/imports/bandcamp/add'],
      note: 'Connection state and import workflow are available through the existing source API.',
    },
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    category: 'Streaming',
    description: 'Browse and play music from SoundCloud.',
    status: 'available',
    statusLabel: 'Importer available',
    fields: [
      {
        id: 'username',
        label: 'SoundCloud username',
        placeholder: 'your SoundCloud name',
      },
    ],
    note: 'The connected SoundCloud source already supports catalog browsing and server-side import jobs.',
    apiCounterpart: {
      status: 'implemented',
      routes: ['/api/me/soundcloud/oauth/start', '/api/me/soundcloud/import'],
      note: 'Connection state and import workflow are available through the existing source API.',
    },
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Metadata',
    description: 'Fetch artist, album, and track metadata from Spotify.',
    status: 'partial',
    statusLabel: 'Search/import available',
    fields: [],
    note: 'Spotify search and embed imports are available for mixed-source collections. A Nuclear-style streaming and metadata provider is not exposed.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/v1/imports/spotify/search', '/api/v1/imports/spotify/add'],
      note: 'Search and embed import are implemented; provider streaming and full metadata browsing are not.',
    },
    realFeature: {
      kind: 'plugin-category',
      category: 'import',
      label: 'Open the real Spotify search + embed import in Import',
    },
  },
  {
    id: 'deezer-dashboard',
    name: 'Deezer Dashboard',
    category: 'Dashboard',
    description:
      'Charts, trending artists, editorial playlists, and new releases from Deezer.',
    status: 'planned',
    statusLabel: 'API contract needed',
    fields: [],
    note: 'No Tahti dashboard-widget or provider route currently exposes Deezer catalogue data.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'Add a public, rate-limited discovery contract before implementing the dashboard.',
    },
  },
  {
    id: 'musicbrainz',
    name: 'MusicBrainz',
    category: 'Metadata',
    description:
      'Search, artist pages, and album details from MusicBrainz with Wikipedia bios and Cover Art Archive artwork.',
    status: 'partial',
    statusLabel: 'Fingerprinting available',
    fields: [],
    note: 'AcoustID fingerprint matching is available in Studio. A general Nuclear-style MusicBrainz search provider is not exposed by the Tahti API.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/me/archive/:id/fingerprint'],
      note: 'Fingerprint matching exists; standalone artist and album provider search remains unimplemented.',
    },
    realFeature: {
      kind: 'plugin-category',
      category: 'fingerprinting',
      label: 'Open the real MusicBrainz connect + AcoustID fingerprinting',
    },
  },
  {
    id: 'listenbrainz-dashboard',
    name: 'ListenBrainz Dashboard',
    category: 'Dashboard',
    description:
      'Charts, trending artists, top albums, and new releases from ListenBrainz.',
    status: 'planned',
    statusLabel: 'API contract needed',
    fields: [],
    note: 'The Tahti API has no ListenBrainz discovery route or widget contract yet.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'A discovery endpoint and account/privacy model are required.',
    },
  },
  {
    id: 'youtube-playlists',
    name: 'YouTube Playlists',
    category: 'Other',
    description: 'Import YouTube playlists by URL.',
    status: 'planned',
    statusLabel: 'API contract needed',
    fields: [],
    note: 'The artist upload flow accepts YouTube smart-link targets, but it does not import playlist entries or resolve them for Tahti playback.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'A server-side playlist import and rights-aware playback contract is required.',
    },
  },
  {
    id: 'omnisource',
    name: 'OmniSource',
    category: 'Streaming',
    description:
      'Multi-source streaming and metadata: fans out searches to YouTube, SoundCloud, Bandcamp, and MusicBrainz in parallel with automatic scoring.',
    status: 'planned',
    statusLabel: 'Configuration saved',
    fields: [],
    note: 'No Tahti-compatible OmniSource API contract is currently available. This entry documents the plugin without enabling unverified playback.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'Do not expose playback until a provider contract and permission model exist.',
    },
  },
  {
    id: 'bandcamp-dashboard',
    name: 'Bandcamp Dashboard',
    category: 'Dashboard',
    description:
      "Browse Bandcamp's Album of the Day, New & Notable releases, and Bandcamp Weekly radio shows.",
    status: 'planned',
    statusLabel: 'API contract needed',
    fields: [],
    note: "No Tahti dashboard-widget or provider route currently exposes Bandcamp's editorial picks.",
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'Add a public discovery contract before implementing the dashboard.',
    },
  },
  {
    id: 'media-session',
    name: 'MediaSession',
    category: 'Other',
    description: 'Expose playback to OS media controls and headsets.',
    status: 'available',
    statusLabel: 'Ported in AudioEngine',
    fields: [],
    note: 'The browser Media Session API is wired to the shared player for metadata, play/pause, previous, next, and playback state.',
    apiCounterpart: {
      status: 'implemented',
      routes: [],
      note: 'Browser-native behavior; no Tahti API route is required.',
    },
  },
  {
    id: 'youtube-liked-songs-sync',
    name: 'YouTube Liked Songs Sync',
    category: 'Playlists',
    description: 'Sync YouTube Music liked songs into local playlists.',
    status: 'planned',
    statusLabel: 'Configuration available',
    fields: [
      {
        id: 'ytCookie',
        label: 'YouTube Music cookie',
        placeholder: 'Paste the cookie request header from music.youtube.com',
        kind: 'textarea',
        secret: true,
        description:
          'In music.youtube.com Developer Tools, copy the cookie header from a /browse request. Keep this value private.',
      },
      {
        id: 'ytAuth',
        label: 'YouTube Music authorization',
        placeholder: 'Paste the authorization request header',
        kind: 'textarea',
        secret: true,
        description:
          'Copy the authorization header from the same /browse request. It normally starts with SAPISIDHASH.',
      },
      {
        id: 'playlistName',
        label: 'Destination playlist name',
        placeholder: 'YouTube Liked Songs',
        description:
          'The local playlist name used for the imported liked songs.',
      },
      {
        id: 'syncInterval',
        label: 'Sync frequency',
        placeholder: 'Choose a frequency',
        kind: 'select',
        options: [
          { value: 'manual', label: 'Manual only' },
          { value: 'daily', label: 'Once a day' },
          { value: 'weekly', label: 'Once a week' },
        ],
        description:
          'Automatic sync will become available when the Tahti API sync contract is enabled.',
      },
    ],
    note: 'Configuration is ported from the Nuclear plugin. Sync remains pending until Tahti provides a server-side YouTube Music credential, consent, playlist mutation, and scheduling contract.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'The upstream plugin uses private YouTube Music request headers and Nuclear local-playlist APIs. Tahti still needs a secure server-side sync endpoint before enabling this action.',
    },
  },
  {
    id: 'soundcloud-dashboard',
    name: 'SoundCloud Dashboard',
    category: 'Dashboard',
    description:
      'Charts and editorial picks from SoundCloud, or your own likes, follows, listening history and personalised recommendations.',
    status: 'planned',
    statusLabel: 'API contract needed',
    fields: [],
    note: 'No Tahti dashboard-widget or provider route currently exposes SoundCloud charts, editorial picks, or personalized recommendations.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'Add a public, rate-limited discovery contract before implementing the dashboard.',
    },
  },
];
