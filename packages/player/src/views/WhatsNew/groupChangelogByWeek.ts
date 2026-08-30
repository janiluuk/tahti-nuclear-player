import { DateTime } from 'luxon';

import type {
  ChangelogEntry,
  ChangelogEntryType,
  ChangelogTag,
} from '../../types/changelog';

/** One "What's New" row: everything that shipped in a single calendar
 * week, collapsed to one entry so the timeline reads as a release per
 * week instead of a raw commit log. */
export type WeeklyChangelogEntry = {
  /** Most recent date among the week's entries — what the row displays. */
  date: string;
  /** The most notable type across the week, for the row's single badge. */
  type: ChangelogEntryType;
  /** One line per source entry, newest first. */
  descriptions: string[];
  tags: ChangelogTag[];
  contributors: string[];
};

/** feature > fix > improvement > plugin > docs > chore — surfaces the
 * change a reader most wants to know about when a week ships several. */
const TYPE_PRECEDENCE: ChangelogEntryType[] = [
  'feature',
  'fix',
  'improvement',
  'plugin',
  'docs',
  'chore',
];

function weekKey(date: string): string {
  const dt = DateTime.fromISO(date);
  return `${dt.weekYear}-${dt.weekNumber}`;
}

function primaryType(entries: ChangelogEntry[]): ChangelogEntryType {
  const present = new Set(entries.map((entry) => entry.type));
  return TYPE_PRECEDENCE.find((type) => present.has(type)) ?? entries[0].type;
}

function dedupeTags(entries: ChangelogEntry[]): ChangelogTag[] {
  const seen = new Set<string>();
  const tags: ChangelogTag[] = [];
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      if (!seen.has(tag.label)) {
        seen.add(tag.label);
        tags.push(tag);
      }
    }
  }
  return tags;
}

function dedupeContributors(entries: ChangelogEntry[]): string[] {
  const seen = new Set<string>();
  for (const entry of entries) {
    for (const contributor of entry.contributors ?? []) {
      seen.add(contributor);
    }
  }
  return [...seen];
}

function mergeWeek(entries: ChangelogEntry[]): WeeklyChangelogEntry {
  const newestFirst = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  return {
    date: newestFirst[0].date,
    type: primaryType(newestFirst),
    descriptions: newestFirst.map((entry) => entry.description),
    tags: dedupeTags(newestFirst),
    contributors: dedupeContributors(newestFirst),
  };
}

/** Groups changelog entries by ISO week and merges each week into one
 * row, so the "What's New" timeline shows at most one entry per week no
 * matter how many things shipped in it. Assumes `entries` is already
 * newest-first, same as `changelog.json`. */
export function groupChangelogByWeek(
  entries: ChangelogEntry[],
): WeeklyChangelogEntry[] {
  const order: string[] = [];
  const byWeek = new Map<string, ChangelogEntry[]>();
  for (const entry of entries) {
    const key = weekKey(entry.date);
    const bucket = byWeek.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      byWeek.set(key, [entry]);
      order.push(key);
    }
  }
  return order.map((key) => mergeWeek(byWeek.get(key)!));
}
