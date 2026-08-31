import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { MoreView } from '../MoreView';

export function AdminMapView() {
  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/map">
          <MoreView />
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
