import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { AdminStreamManagerPanel } from '../../components/AdminStreamManagerPanel';
import { StudioPageHeader } from '../../components/StudioPanel';

export function AdminStreamsView() {
  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/streams" />
        <StudioPageHeader
          title="Stream manager"
          subtitle="Monitor active channels and control their live audio. Restart bounces audio without ending the broadcast; Skip/Pause/Resume affect the archive rotation."
        />
        <AdminStreamManagerPanel />
      </div>
    </AdminGate>
  );
}
