import React from 'react';
import { Button } from '@/components/ui/button';

const OrdersList: React.FC = () => {
  // Mock data
  const orders = [
    { id: 'ORD123', user: 'Ahmed', date: '2025-06-08', status: 'Shipped', total: '₹2,500' },
    { id: 'ORD124', user: 'Fatima', date: '2025-06-08', status: 'Pending', total: '₹1,200' },
    { id: 'ORD125', user: 'Yusuf', date: '2025-06-07', status: 'Delivered', total: '₹3,100' },
  ];
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-naaz-green">Orders Management</h1>
        <input type="text" placeholder="Search orders..." className="border rounded-lg px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-naaz-green" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button className="bg-naaz-green text-white">All</Button>
        <Button className="bg-blue-500 text-white">Pending</Button>
        <Button className="bg-naaz-gold text-white">Shipped</Button>
        <Button className="bg-green-500 text-white">Delivered</Button>
        <input type="date" className="border rounded-lg px-2 py-1" />
        <input type="date" className="border rounded-lg px-2 py-1" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-2">Order ID</th>
              <th className="py-2 px-2">User</th>
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Total</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="py-2 px-2 font-mono">{order.id}</td>
                <td className="py-2 px-2">{order.user}</td>
                <td className="py-2 px-2">{order.date}</td>
                <td className="py-2 px-2">{order.status}</td>
                <td className="py-2 px-2">{order.total}</td>
                <td className="py-2 px-2 flex gap-2">
                  <Button size="sm" className="bg-blue-500 text-white">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersList;
