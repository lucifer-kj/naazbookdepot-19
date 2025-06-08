import React from 'react';

const Orders: React.FC = () => (
  <div>
    <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-8">Manage Orders</h1>
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search orders..."
          className="border border-gray-300 rounded px-4 py-2 w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Order #</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className="py-2 px-4">NBD-12345</td>
              <td className="py-2 px-4">Ahmed Khan</td>
              <td className="py-2 px-4">2024-06-01</td>
              <td className="py-2 px-4"><span className="text-yellow-600">Processing</span></td>
              <td className="py-2 px-4">₹1500</td>
              <td className="py-2 px-4">
                <button className="text-naaz-green hover:underline mr-2">View</button>
                <button className="text-red-600 hover:underline">Cancel</button>
              </td>
            </tr>
            {/* ...more rows */}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Orders;
