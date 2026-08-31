import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { StudioPageHeader } from '../../components/StudioPanel';
import { SelectsTab } from './moderation/tabs/SelectsTab';

export function AdminSelectsView() {
  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/tahti-selects">
          <div className="flex max-w-5xl flex-col gap-6">
            <StudioPageHeader
              title="Tahti Selects"
              subtitle="Curate the editorial rotation and manage its live stream."
            />
            <SelectsTab />
          </div>
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
