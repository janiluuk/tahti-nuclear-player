import { useState } from 'react';

import { useTranslation } from '@tahti-player/i18n';
import { ViewShell } from '@tahti-player/ui';

import changelog from '../../../changelog.json';
import type { ChangelogEntry } from '../../types/changelog';
import { groupChangelogByWeek } from './groupChangelogByWeek';
import { TimelineEntry } from './TimelineEntry';

// One row per week: several changes shipped the same week collapse into
// a single timeline entry instead of repeating the week over and over.
const weeklyEntries = groupChangelogByWeek(changelog as ChangelogEntry[]);

const INITIAL_COUNT = 3;

export const WhatsNew = () => {
  const { t } = useTranslation('changelog');
  const [showAll, setShowAll] = useState(false);

  const visibleEntries = showAll
    ? weeklyEntries
    : weeklyEntries.slice(0, INITIAL_COUNT);
  const hiddenCount = weeklyEntries.length - INITIAL_COUNT;

  return (
    <ViewShell title={t('title')}>
      <div className="flex w-full flex-col pr-4 pl-2">
        {visibleEntries.map((entry, index) => (
          <TimelineEntry
            key={index}
            entry={entry}
            isFirst={index === 0}
            isLast={index === visibleEntries.length - 1}
          />
        ))}
        {!showAll && hiddenCount > 0 && (
          <button
            className="hover:text-foreground cursor-pointer py-4 text-sm transition-colors"
            onClick={() => setShowAll(true)}
          >
            {t('seeMore', { count: hiddenCount })}
          </button>
        )}
      </div>
    </ViewShell>
  );
};
