import { PageFrame } from '../components/PageHeader';
import { StudioNav } from '../components/StudioNav';
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

const LIBRARY_ROUTE_BY_TAB: Record<Tab, string> = {
  discography: '/library',
  releases: '/library/releases',
  collections: '/library/collections',
  recordings: '/library/recordings',
  favorites: '/library/favorites',
  history: '/library/history',
};

export function LibraryView({ tab = 'discography' }: { tab?: Tab }) {
  return (
    <PageFrame maxWidth="5xl">
      <div className="studio-page-layout flex flex-col gap-6">
        <StudioNav current={LIBRARY_ROUTE_BY_TAB[tab]} />
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
