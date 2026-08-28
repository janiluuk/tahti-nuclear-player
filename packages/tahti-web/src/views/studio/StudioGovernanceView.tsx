import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { GovernanceView } from '../GovernanceView';

export function StudioGovernanceView() {
  return (
    <StudioGate requireChannel={false}>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/governance" />
        <GovernanceView />
      </div>
    </StudioGate>
  );
}
