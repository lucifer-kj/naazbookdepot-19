import AdminLayout from '@/components/admin/AdminLayout';
import { AdminUserProfilesView } from '@/components/admin/UserProfilesView';

export default function AdminUserProfiles() {
  return (
    <AdminLayout>
      <AdminUserProfilesView />
    </AdminLayout>
  );
}
