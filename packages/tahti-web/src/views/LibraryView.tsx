import {
  ClockIcon,
  DiscIcon,
  HeartIcon,
  LibraryBigIcon,
  MicVocalIcon,
  RocketIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { PageFrame } from '../components/PageHeader';
import { SectionSidebar } from '../components/SectionSidebar';
import { FavoritesView } from './FavoritesView';
import { HistoryView } from './HistoryView';
import { MyCollectionsView } from './MyCollectionsView';
import { MyDiscographyView } from './MyDiscographyView';
import { StudioRecordingsView } from './studio/StudioRecordingsView';
import { StudioReleasesView } from './studio/StudioReleasesView';

type Tab =
  | 'discography'
  | 'collections'
  | 'releases'
  | 'recordings'
  | 'favorites'
  | 'history';

const ITEMS: {
  id: Tab;
  to: string;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: 'discography',
    to: '/library',
    label: 'All sounds',
    icon: <LibraryBigIcon size={16} aria-hidden />,
  },
  {
    id: 'releases',
    to: '/library/releases',
    label: 'Releases',
    icon: <RocketIcon size={16} aria-hidden />,
  },
  {
    id: 'collections',
    to: '/library/collections',
    label: 'Collections',
    icon: <MicVocalIcon size={16} aria-hidden />,
  },
  {
    id: 'recordings',
    to: '/library/recordings',
    label: 'Recordings',
    icon: <DiscIcon size={16} aria-hidden />,
  },
  {
    id: 'favorites',
    to: '/library/favorites',
    label: 'Favorites',
    icon: <HeartIcon size={16} aria-hidden />,
  },
  {
    id: 'history',
    to: '/library/history',
    label: 'History',
    icon: <ClockIcon size={16} aria-hidden />,
  },
];

export function LibraryView({ tab = 'discography' }: { tab?: Tab }) {
  return (
    <PageFrame maxWidth="5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <SectionSidebar
          aria-label="Library"
          items={ITEMS.map((item) => ({
            ...item,
            active: tab === item.id,
          }))}
        />

        <div className="min-w-0 flex-1">
          {tab === 'discography' && <MyDiscographyView />}
          {tab === 'collections' && <MyCollectionsView />}
          {tab === 'releases' && <StudioReleasesView embedded />}
          {tab === 'recordings' && <StudioRecordingsView embedded />}
          {tab === 'favorites' && <FavoritesView />}
          {tab === 'history' && <HistoryView />}
        </div>
      </div>
    </PageFrame>
  );
}
