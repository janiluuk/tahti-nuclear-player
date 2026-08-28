import { lazy, Suspense } from 'react';

import { PageLoading } from '../../components/PageStates';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

const LazyGovernanceView = lazy(() =>
  import('../GovernanceView').then((module) => ({
    default: module.GovernanceView,
  })),
);

export function StudioGovernanceView() {
  return (
    <StudioGate requireChannel={false}>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/governance" />
        <Suspense fallback={<PageLoading label="Loading governance…" />}>
          <LazyGovernanceView />
        </Suspense>
      </div>
    </StudioGate>
  );
}
