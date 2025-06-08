import React from 'react';

const Products: React.FC = () => (
  <div>
    <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-8">Manage Products</h1>
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="border border-gray-300 rounded px-4 py-2 w-64"
        />
        <button className="bg-naaz-green text-white px-6 py-2 rounded hover:bg-naaz-green/90">
          Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Stock</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className="py-2 px-4">The Noble Quran</td>
              <td className="py-2 px-4">Quran & Tafsir</td>
              <td className="py-2 px-4">15</td>
              <td className="py-2 px-4">₹1200</td>
              <td className="py-2 px-4"><span className="text-green-600">Active</span></td>
              <td className="py-2 px-4">
                <button className="text-naaz-green hover:underline mr-2">Edit</button>
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

export default Products;
