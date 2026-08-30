import type { ChangelogEntry } from '../../types/changelog';
import { groupChangelogByWeek } from './groupChangelogByWeek';

describe('groupChangelogByWeek', () => {
  it('keeps one entry per week separate', () => {
    const entries: ChangelogEntry[] = [
      { date: '2026-03-01T22:00', description: 'A', type: 'feature' },
      { date: '2026-02-16T16:00', description: 'B', type: 'improvement' },
    ];

    const groups = groupChangelogByWeek(entries);

    expect(groups).toHaveLength(2);
    expect(groups[0].descriptions).toEqual(['A']);
    expect(groups[1].descriptions).toEqual(['B']);
  });

  it('merges same-week entries into one row, newest description first', () => {
    const entries: ChangelogEntry[] = [
      { date: '2026-03-01T22:00', description: 'Newer', type: 'fix' },
      { date: '2026-03-01T18:00', description: 'Older', type: 'feature' },
    ];

    const groups = groupChangelogByWeek(entries);

    expect(groups).toHaveLength(1);
    expect(groups[0].descriptions).toEqual(['Newer', 'Older']);
    expect(groups[0].date).toBe('2026-03-01T22:00');
  });

  it('picks the row type by feature > fix > improvement > plugin > docs > chore precedence', () => {
    const groups = groupChangelogByWeek([
      { date: '2026-03-01T22:00', description: 'Docs update', type: 'docs' },
      { date: '2026-03-01T18:00', description: 'A fix', type: 'fix' },
    ]);

    expect(groups[0].type).toBe('fix');
  });

  it('dedupes tags and contributors across the week, keeping first-seen order', () => {
    const groups = groupChangelogByWeek([
      {
        date: '2026-03-01T22:00',
        description: 'A',
        type: 'feature',
        tags: [{ label: 'Playlists', color: 'cyan' }],
        contributors: ['nukeop'],
      },
      {
        date: '2026-03-01T18:00',
        description: 'B',
        type: 'fix',
        tags: [
          { label: 'Playlists', color: 'cyan' },
          { label: 'Audio', color: 'red' },
        ],
        contributors: ['someDev', 'nukeop'],
      },
    ]);

    expect(groups[0].tags.map((tag) => tag.label)).toEqual([
      'Playlists',
      'Audio',
    ]);
    expect(groups[0].contributors).toEqual(['nukeop', 'someDev']);
  });

  it('returns an empty array for no entries', () => {
    expect(groupChangelogByWeek([])).toEqual([]);
  });
});
