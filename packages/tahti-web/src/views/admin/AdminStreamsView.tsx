import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { AdminStreamManagerPanel } from '../../components/AdminStreamManagerPanel';
import { StudioPageHeader } from '../../components/StudioPanel';

export function AdminStreamsView() {
  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/streams">
          <div className="flex max-w-5xl flex-col gap-6">
            <StudioPageHeader
              title="Streams"
              subtitle="Monitor active channels and control their live audio. Restart bounces audio without ending the broadcast; Skip/Pause/Resume affect the archive rotation."
            />
            <AdminStreamManagerPanel />
          </div>
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
