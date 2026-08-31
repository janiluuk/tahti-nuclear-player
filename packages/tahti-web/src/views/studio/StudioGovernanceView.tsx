import { Link } from '@tanstack/react-router';
import { LandmarkIcon, LightbulbIcon } from 'lucide-react';
import { lazy, Suspense } from 'react';

import { PageLoading } from '../../components/PageStates';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader } from '../../components/StudioPanel';

const LazyGovernanceView = lazy(() =>
  import('../GovernanceView').then((module) => ({
    default: module.GovernanceView,
  })),
);

const LazyFeatureRequestsView = lazy(() =>
  import('../FeatureRequestsView').then((module) => ({
    default: module.FeatureRequestsView,
  })),
);

export function StudioGovernanceView({
  tab = 'motions',
}: {
  tab?: 'motions' | 'topics';
}) {
  return (
    <StudioGate requireChannel={false}>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/governance" />
        <StudioPageHeader
          title="Governance"
          subtitle="Cooperative motions, voting, and ideas for what Tahti builds next."
        />
        <nav
          aria-label="Governance sections"
          className="border-border flex flex-wrap gap-1 border-b pb-2"
          role="tablist"
        >
          <Link
            to="/studio/governance"
            role="tab"
            aria-selected={tab === 'motions'}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold ${tab === 'motions' ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'}`}
          >
            <LandmarkIcon size={15} aria-hidden />
            Motions
          </Link>
          <Link
            to="/studio/governance"
            search={{ tab: 'topics' }}
            role="tab"
            aria-selected={tab === 'topics'}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold ${tab === 'topics' ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'}`}
          >
            <LightbulbIcon size={15} aria-hidden />
            Topics
          </Link>
        </nav>
        <Suspense fallback={<PageLoading label="Loading governance…" />}>
          {tab === 'topics' ? (
            <LazyFeatureRequestsView embedded />
          ) : (
            <LazyGovernanceView embedded />
          )}
        </Suspense>
      </div>
    </StudioGate>
  );
}
