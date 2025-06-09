import React from 'react';
import { Button } from '@/components/ui/button';

const ProductList: React.FC = () => {
  // Mock data
  const products = [
    { id: 1, name: 'The Noble Quran', price: '1200', stock: 15, status: 'Active', image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png' },
    { id: 2, name: 'Sahih Al-Bukhari', price: '1450', stock: 0, status: 'Inactive', image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png' },
  ];
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-naaz-green">Product Management</h1>
        <Button className="bg-naaz-green text-white">Add Product</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-2">Image</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Price</th>
              <th className="py-2 px-2">Stock</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="py-2 px-2"><img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" /></td>
                <td className="py-2 px-2">{product.name}</td>
                <td className="py-2 px-2">₹{product.price}</td>
                <td className="py-2 px-2">{product.stock}</td>
                <td className={`py-2 px-2 font-semibold ${product.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>{product.status}</td>
                <td className="py-2 px-2 flex gap-2">
                  <Button size="sm" className="bg-blue-500 text-white">View</Button>
                  <Button size="sm" className="bg-naaz-gold text-white">Edit</Button>
                  <Button size="sm" className="bg-red-500 text-white">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
