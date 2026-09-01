import type { ChangelogEntry } from '../../types/changelog';

// Weeks (ISO): 2026-03-01/-01 -> week 9; 2026-02-16 -> week 8;
// 2026-02-02/-02 -> week 6; 2026-01-19 -> week 4. Kept deliberately spread
// across four distinct weeks, with two weeks carrying two entries each, so
// tests exercise both the "one entry, unchanged" and "same-week merge" paths.
export const TEST_CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-03-01T22:00',
    description: 'Support importing legacy format playlists',
    type: 'feature',
    contributors: ['nukeop'],
    tags: [{ label: 'Playlists', color: 'cyan' }],
  },
  {
    date: '2026-03-01T18:00',
    description: 'Fixed audio stuttering on track transition',
    type: 'fix',
  },
  {
    date: '2026-02-16T16:00',
    description: 'Improved plugin loading performance',
    type: 'improvement',
    contributors: ['someDev', 'nukeop'],
  },
  {
    date: '2026-02-02T14:00',
    description: 'MCP server for controlling Tahti Player from AI agents',
    type: 'feature',
    tags: [{ label: 'MCP', color: 'green' }],
  },
  {
    date: '2026-02-02T12:00',
    description: 'Updated documentation',
    type: 'docs',
  },
  {
    date: '2026-01-19T10:00',
    description: 'Reduced startup time by lazy-loading plugins',
    type: 'improvement',
  },
];
