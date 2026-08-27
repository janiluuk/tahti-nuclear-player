import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader } from '../../components/StudioPanel';
import { SelectsTab } from './moderation/tabs/SelectsTab';

export function AdminSelectsView() {
  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/tahti-selects" />
        <StudioPageHeader
          title="Tahti Selects"
          subtitle="Curate the editorial rotation and manage its live stream."
        />
        <SelectsTab />
      </div>
    </AdminGate>
  );
}
