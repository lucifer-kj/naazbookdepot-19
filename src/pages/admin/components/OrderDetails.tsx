import React from 'react';
import { Button } from '@/components/ui/button';

const OrderDetails: React.FC = () => {
  // Mock data
  const order = {
    id: 'ORD123',
    user: 'Ahmed',
    date: '2025-06-08',
    status: 'Shipped',
    total: '₹2,500',
    items: [
      { name: 'The Noble Quran', qty: 1, price: '₹1,200' },
      { name: 'Sahih Al-Bukhari', qty: 1, price: '₹1,300' },
    ],
    customer: {
      name: 'Ahmed Hassan',
      address: '123 Park Street, Kolkata',
      phone: '+91 98765 43210',
    },
    tracking: 'TRK123456789',
  };
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-naaz-green mb-6">Order Details</h1>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between mb-2">
          <div>
            <div className="font-semibold">Order ID: <span className="font-mono">{order.id}</span></div>
            <div className="text-gray-600 text-sm">Date: {order.date}</div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
            <div className="font-bold text-naaz-gold mt-2">{order.total}</div>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-naaz-green mb-2">Order Items</h2>
          <ul className="divide-y">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between py-2">
                <span>{item.name} <span className="text-xs text-gray-500">x{item.qty}</span></span>
                <span>{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-naaz-green mb-2">Customer Info</h2>
          <div className="text-gray-700">
            <div>{order.customer.name}</div>
            <div>{order.customer.address}</div>
            <div>{order.customer.phone}</div>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-naaz-green mb-2">Shipment Tracking</h2>
          <div className="text-gray-700">Tracking #: {order.tracking}</div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Update Status</label>
          <select className="w-full border rounded-lg px-3 py-2">
            <option>Pending</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
        <Button className="w-full bg-naaz-green text-white mt-4">Update Order</Button>
      </div>
    </div>
  );
};

export default OrderDetails;
