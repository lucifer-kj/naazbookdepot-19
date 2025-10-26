import AdminLayout from '@/components/admin/AdminLayout';
import { InventoryManagementView } from '@/components/admin/InventoryManagementView';

export default function AdminInventory() {
  return (
    <AdminLayout>
      <InventoryManagementView />
    </AdminLayout>
  );
}