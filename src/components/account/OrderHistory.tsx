
import React from 'react';
import { Package, Calendar, CreditCard } from 'lucide-react';

const OrderHistory = () => {
  // Mock data for now - will be replaced with real data later
  const orders = [
    {
      id: '1',
      orderNumber: 'NBD-2024-0001',
      date: '2024-01-15',
      total: 1850,
      status: 'delivered',
      items: [
        { name: 'The Noble Quran - Arabic with English Translation', quantity: 1, price: 1200 },
        { name: 'Sahih Al-Bukhari Volume 1', quantity: 1, price: 650 }
      ]
    },
    {
      id: '2',
      orderNumber: 'NBD-2024-0002',
      date: '2024-01-20',
      total: 850,
      status: 'shipped',
      items: [
        { name: 'The Sealed Nectar', quantity: 1, price: 850 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-6">Order History</h2>
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-naaz-green">
                    Order #{order.orderNumber}
                  </h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Calendar size={16} className="mr-2" />
                    <span>{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounde -full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center text-gray-600">
                  <CreditCard size={16} className="mr-2" />
                  <span>Total: ₹{order.total.toLocaleString()}</span>
                </div>
                <button className="text-naaz-green hover:text-naaz-gold transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">When you place orders, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
