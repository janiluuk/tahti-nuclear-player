import { StashFilesPanel } from '../../components/StashFilesPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader } from '../../components/StudioPanel';

export function StudioStashView() {
  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/stash" />
        <StudioPageHeader
          title="Stash"
          subtitle="Private locker — upload work in progress and grant access only when it is ready."
        />
        <StashFilesPanel />
      </div>
    </StudioGate>
  );
}
