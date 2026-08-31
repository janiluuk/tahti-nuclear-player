import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { MoreView } from '../MoreView';

export function AdminMapView() {
  return (
    <AdminGate>
      <div className="admin-page-layout flex flex-col gap-6 px-1 py-2">
        <div className="mx-auto w-full max-w-5xl">
          <AdminNav current="/admin/map" />
        </div>
        <MoreView />
      </div>
    </AdminGate>
  );
}
