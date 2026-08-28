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
};

export const NUCLEAR_PLUGIN_ADDONS: NuclearPluginAddon[] = [
  {
    id: 'discogs',
    name: 'Discogs metadata',
    category: 'Metadata',
    description: 'Look up release and artist metadata from Discogs.',
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
  },
  {
    id: 'lastfm',
    name: 'Last.fm scrobbler',
    category: 'Scrobbling',
    description: 'Scrobble played tracks and connect your Last.fm profile.',
    status: 'planned',
    statusLabel: 'Configuration saved',
    fields: [
      {
        id: 'username',
        label: 'Last.fm username',
        placeholder: 'your username',
      },
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: 'Last.fm API key',
        secret: true,
      },
      {
        id: 'sharedSecret',
        label: 'Shared secret',
        placeholder: 'Last.fm shared secret',
        secret: true,
      },
    ],
    note: 'Scrobbling requires a server-side integration and consent-aware playback event contract.',
    apiCounterpart: {
      status: 'missing',
      routes: ['/api/me/notification-preferences'],
      note: 'The preference route exists, but playback scrobbling and consent events do not.',
    },
  },
  {
    id: 'youtube',
    name: 'YouTube streaming and playlists',
    category: 'Streaming',
    description: 'Search YouTube and resolve videos or playlists for playback.',
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
  },
  {
    id: 'bandcamp-dashboard',
    name: 'Bandcamp dashboard',
    category: 'Artist tools',
    description:
      'Connect Bandcamp and manage the artist-side catalog connection.',
    status: 'partial',
    statusLabel: 'Importer available',
    fields: [
      {
        id: 'username',
        label: 'Bandcamp artist name',
        placeholder: 'your Bandcamp name',
      },
    ],
    note: 'Use the Bandcamp importer to browse and bring releases into Tahti. The API-side catalog import endpoint remains pending.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/me/bandcamp/oauth/start', '/api/me/integrations'],
      note: 'OAuth and connection state exist; the catalog import endpoint remains pending.',
    },
  },
  {
    id: 'soundcloud-dashboard',
    name: 'SoundCloud dashboard',
    category: 'Artist tools',
    description: 'Connect SoundCloud and manage downloadable catalog imports.',
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
      routes: ['/api/me/soundcloud/oauth/start', '/api/me/integrations'],
      note: 'Connection state and import workflow are available through the existing source API.',
    },
  },
  {
    id: 'omnisource',
    name: 'OmniSource',
    category: 'Streaming',
    description:
      'A provider aggregation layer for source discovery and playback.',
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
    id: 'musicbrainz',
    name: 'MusicBrainz metadata',
    category: 'Metadata',
    description: 'Search MusicBrainz artist and release metadata.',
    status: 'partial',
    statusLabel: 'Fingerprinting available',
    fields: [],
    note: 'AcoustID fingerprint matching is available in Studio. A general Nuclear-style MusicBrainz search provider is not exposed by the Tahti API.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/me/archive/:id/fingerprint'],
      note: 'Fingerprint matching exists; standalone artist and album provider search remains unimplemented.',
    },
  },
  {
    id: 'spotify',
    name: 'Spotify metadata',
    category: 'Metadata',
    description: 'Search Spotify tracks and connect artist metadata.',
    status: 'partial',
    statusLabel: 'Search/import available',
    fields: [],
    note: 'Spotify search and embed imports are available for mixed-source collections. A Nuclear-style streaming and metadata provider is not exposed.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/v1/imports/spotify/search', '/api/v1/imports/spotify/add'],
      note: 'Search and embed import are implemented; provider streaming and full metadata browsing are not.',
    },
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp provider',
    category: 'Streaming',
    description: 'Browse and play music from Bandcamp.',
    status: 'partial',
    statusLabel: 'Importer available',
    fields: [],
    note: 'Bandcamp OAuth and release importing are available in Sources. A Nuclear-style provider search and stream resolver is not exposed by the Tahti API.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/me/bandcamp/oauth/start', '/api/v1/imports/bandcamp/add'],
      note: 'Connection and import exist; provider playback is not exposed.',
    },
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud provider',
    category: 'Streaming',
    description: 'Browse and play music from SoundCloud.',
    status: 'partial',
    statusLabel: 'Importer available',
    fields: [],
    note: 'SoundCloud OAuth, catalogue browsing, and server-side imports are available in Sources. The Nuclear provider search/resolution contract is not exposed.',
    apiCounterpart: {
      status: 'partial',
      routes: ['/api/me/soundcloud/oauth/start', '/api/me/soundcloud/import'],
      note: 'Connection and import exist; generic provider playback is not exposed.',
    },
  },
  {
    id: 'youtube-playlists',
    name: 'YouTube playlists',
    category: 'Playlists',
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
    id: 'deezer-dashboard',
    name: 'Deezer dashboard',
    category: 'Discovery',
    description: 'Browse Deezer charts, playlists, and new releases.',
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
    id: 'listenbrainz-dashboard',
    name: 'ListenBrainz dashboard',
    category: 'Discovery',
    description: 'Browse ListenBrainz charts and new releases.',
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
    id: 'khinsider',
    name: 'KHInsider',
    category: 'Metadata',
    description: 'Browse and play video-game soundtracks from KHInsider.',
    status: 'planned',
    statusLabel: 'Not targeted for Tahti',
    fields: [],
    note: 'This audience-specific catalogue is not currently part of Tahti’s radio and artist workflow.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'No Tahti catalogue, rights, or streaming contract exists for KHInsider.',
    },
  },
  {
    id: 'netease',
    name: 'NetEase Cloud Music',
    category: 'Streaming',
    description: 'Search and stream NetEase Cloud Music through yt-dlp.',
    status: 'planned',
    statusLabel: 'Not targeted for Tahti',
    fields: [],
    note: 'Tahti does not currently expose a server-side yt-dlp provider contract for third-party catalogue playback.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'A rights-aware resolver and provider permission model are required.',
    },
  },
  {
    id: 'media-session',
    name: 'MediaSession',
    category: 'Playback',
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
    id: 'multicast-destinations',
    name: 'Multicast destinations',
    category: 'Streaming',
    description: 'Configure destinations that mirror your live broadcast.',
    status: 'available',
    statusLabel: 'RTMP configuration available',
    fields: [
      {
        id: 'provider',
        label: 'Destination provider',
        placeholder: 'Choose a provider',
        kind: 'select',
        options: [
          { value: 'YOUTUBE', label: 'YouTube' },
          { value: 'TWITCH', label: 'Twitch' },
          { value: 'FACEBOOK', label: 'Facebook' },
          { value: 'KICK', label: 'Kick' },
          { value: 'TIKTOK', label: 'TikTok' },
          { value: 'MIXCLOUD_LIVE', label: 'Mixcloud Live' },
          { value: 'INSTAGRAM', label: 'Instagram' },
          { value: 'CUSTOM', label: 'Custom RTMP' },
        ],
        description:
          'Choose the service receiving the mirrored broadcast. Provider-specific ingest details are validated in the Multicast add-on.',
      },
      {
        id: 'label',
        label: 'Destination label',
        placeholder: 'Main live stream',
        description: 'A private label to identify this destination in Go Live.',
      },
      {
        id: 'streamKey',
        label: 'Stream key',
        placeholder: 'Paste the provider stream key',
        kind: 'password',
        secret: true,
        description:
          'Stored only in the configured destination. Never share this key publicly.',
      },
      {
        id: 'rtmpUrl',
        label: 'Custom RTMP address',
        placeholder: 'rtmps://…',
        kind: 'url',
        description:
          'Only needed for Custom RTMP; fixed-provider ingest addresses are supplied automatically.',
      },
    ],
    note: 'The shared Multicast add-on already supports provider selection, credentials, activation, and deactivation. This Nuclear catalog entry exposes the same configuration vocabulary for plugin discovery.',
    apiCounterpart: {
      status: 'implemented',
      routes: ['/api/me/rtmp-targets'],
      note: 'Configured targets are stored and managed by the existing RTMP target API and shared MulticastDestinationForm.',
    },
  },
  {
    id: 'youtube-liked-songs-sync',
    name: 'YouTube liked songs sync',
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
];
