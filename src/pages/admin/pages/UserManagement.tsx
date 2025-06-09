import React from 'react';

const UserManagement: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      {/* Placeholder for user management table/list */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className="px-4 py-2 border">John Doe</td>
              <td className="px-4 py-2 border">john@example.com</td>
              <td className="px-4 py-2 border">Admin</td>
              <td className="px-4 py-2 border">
                <button className="text-blue-600 hover:underline mr-2">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
            {/* More rows... */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
