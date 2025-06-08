import React from 'react';
import { TrendingUp, ShoppingCart, Users, Star } from 'lucide-react';

const Overview: React.FC = () => (
  <div>
    <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-8">Dashboard Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <TrendingUp className="text-naaz-green mb-2" size={32} />
        <div className="text-3xl font-bold text-naaz-green">47</div>
        <div className="text-gray-600">Orders Today</div>
        <div className="text-green-600 text-sm mt-1">+8.2% vs last month</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <ShoppingCart className="text-naaz-green mb-2" size={32} />
        <div className="text-3xl font-bold text-naaz-green">1,234</div>
        <div className="text-gray-600">Products</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <Users className="text-naaz-green mb-2" size={32} />
        <div className="text-3xl font-bold text-naaz-green">47</div>
        <div className="text-gray-600">Orders</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <Star className="text-naaz-green mb-2" size={32} />
        <div className="text-3xl font-bold text-naaz-green">4.8/5</div>
        <div className="text-gray-600">Customer Satisfaction</div>
        <div className="text-green-600 text-sm mt-1">+0.3 vs last month</div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-xl font-semibold text-naaz-green mb-4">Sales Overview</h2>
      <div className="h-64 flex items-center justify-center">
        {/* Placeholder for chart */}
        <span className="text-gray-400">[Sales Chart Here]</span>
      </div>
    </div>
  </div>
);

export default Overview;
