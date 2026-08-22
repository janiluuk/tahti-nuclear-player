export type ExportTarget = {
  id: string;
  label: string;
  note: string;
  color: string;
  to: string;
  supportsTracks: boolean;
};

export const EXPORT_TARGETS: ExportTarget[] = [
  {
    id: 'spotify',
    label: 'Spotify',
    note: 'Release delivery through Revelator.',
    color: 'var(--accent-green)',
    to: '/studio/distribution',
    supportsTracks: false,
  },
  {
    id: 'apple',
    label: 'Apple Music',
    note: 'Release delivery through Revelator.',
    color: 'var(--foreground-secondary)',
    to: '/studio/distribution',
    supportsTracks: false,
  },
  {
    id: 'tidal',
    label: 'Tidal',
    note: 'Release delivery through Revelator.',
    color: 'var(--accent-blue)',
    to: '/studio/distribution',
    supportsTracks: false,
  },
  {
    id: 'deezer',
    label: 'Deezer',
    note: 'Release delivery through Revelator.',
    color: 'var(--primary)',
    to: '/studio/distribution',
    supportsTracks: false,
  },
  {
    id: 'amazon',
    label: 'Amazon Music',
    note: 'Release delivery through Revelator.',
    color: 'var(--accent-cyan)',
    to: '/studio/distribution',
    supportsTracks: false,
  },
  {
    id: 'youtube',
    label: 'YouTube Music',
    note: 'Release delivery through Revelator.',
    color: 'var(--accent-red)',
    to: '/studio/distribution',
    supportsTracks: false,
  },
  {
    id: 'bandcamp',
    label: 'Bandcamp',
    note: 'Manage the connected account under Sources.',
    color: 'var(--accent-cyan)',
    to: '/sources/bandcamp',
    supportsTracks: false,
  },
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    note: 'Manage the connected account under Sources.',
    color: 'var(--accent-orange)',
    to: '/sources/soundcloud',
    supportsTracks: false,
  },
  {
    id: 'mixcloud',
    label: 'Mixcloud',
    note: 'Export individual mixes from Track info.',
    color: 'var(--accent-purple)',
    to: '/sources/mixcloud',
    supportsTracks: true,
  },
];
