export type NuclearPluginField = {
  id: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  kind?: 'text' | 'password' | 'url' | 'textarea' | 'select';
  options?: Array<{ value: string; label: string }>;
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
    id: 'deezer',
    name: 'Deezer metadata',
    category: 'Metadata',
    description: 'Search Deezer for artist, album, and release metadata.',
    status: 'planned',
    statusLabel: 'Configuration saved',
    fields: [
      {
        id: 'appId',
        label: 'Application ID',
        placeholder: 'Optional Deezer application ID',
      },
    ],
    note: 'The add-on configuration is ready, but a Tahti metadata-provider endpoint is still required before it can power search.',
    apiCounterpart: {
      status: 'missing',
      routes: [],
      note: 'Add a metadata provider route before enabling runtime search.',
    },
  },
  {
    id: 'listenbrainz',
    name: 'ListenBrainz scrobbler',
    category: 'Scrobbling',
    description: 'Send your listening activity to ListenBrainz.',
    status: 'planned',
    statusLabel: 'Configuration saved',
    fields: [
      {
        id: 'username',
        label: 'ListenBrainz username',
        placeholder: 'your username',
      },
      {
        id: 'token',
        label: 'User token',
        placeholder: 'ListenBrainz user token',
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
];
