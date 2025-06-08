import React from 'react';

const Customers: React.FC = () => (
  <div>
    <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-8">Manage Customers</h1>
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          className="border border-gray-300 rounded px-4 py-2 w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Orders</th>
              <th className="py-2 px-4">Joined</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className="py-2 px-4">Fatima Rahman</td>
              <td className="py-2 px-4">fatima@email.com</td>
              <td className="py-2 px-4">5</td>
              <td className="py-2 px-4">2023-11-12</td>
              <td className="py-2 px-4">
                <button className="text-naaz-green hover:underline mr-2">View</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
            {/* ...more rows */}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Customers;
