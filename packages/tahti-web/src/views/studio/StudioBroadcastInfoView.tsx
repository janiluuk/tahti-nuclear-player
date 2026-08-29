import { BroadcastPreflightPanel } from '../../components/BroadcastPreflightPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader } from '../../components/StudioPanel';

export function StudioBroadcastInfoView() {
  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/info" />
        <StudioPageHeader
          title="Info"
          subtitle="Set the show name, episode, and details listeners see when you go live."
        />
        <BroadcastPreflightPanel />
      </div>
    </StudioGate>
  );
}
