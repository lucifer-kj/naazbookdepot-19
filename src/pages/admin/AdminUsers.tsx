
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-naaz-green">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">
            User management features coming soon. This will include user listings, role management, and account actions.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
