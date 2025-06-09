import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';

const DashboardOverview: React.FC = () => {
  // Mock data
  const cards = [
    { label: 'Total Sales', value: '₹1,25,000', color: 'bg-naaz-green' },
    { label: 'New Orders', value: '120', color: 'bg-naaz-gold' },
    { label: 'Active Users', value: '1,540', color: 'bg-blue-500' },
    { label: 'Out of Stock', value: '8', color: 'bg-red-500' },
  ];
  const recentOrders = [
    { id: 'ORD123', user: 'Ahmed', date: '2025-06-08', status: 'Shipped', total: '₹2,500' },
    { id: 'ORD124', user: 'Fatima', date: '2025-06-08', status: 'Pending', total: '₹1,200' },
    { id: 'ORD125', user: 'Yusuf', date: '2025-06-07', status: 'Delivered', total: '₹3,100' },
  ];
  // Mock chart data
  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Sales', data: [12000, 15000, 10000, 18000, 20000, 17000, 21000], backgroundColor: '#175746' }],
  };
  const revenueData = {
    labels: ['Books', 'Perfumes', 'Accessories'],
    datasets: [{ label: 'Revenue', data: [70000, 40000, 15000], backgroundColor: ['#175746', '#d3af37', '#60a5fa'] }],
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-naaz-green">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button className="bg-naaz-green text-white">Day</Button>
          <Button className="bg-naaz-gold text-white">Week</Button>
          <Button className="bg-blue-500 text-white">Month</Button>
        </div>
        <input type="text" placeholder="Search..." className="border rounded-lg px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-naaz-green" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`rounded-lg p-4 text-white shadow ${card.color}`}>
            <div className="text-lg font-semibold">{card.label}</div>
            <div className="text-2xl font-bold mt-2">{card.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-naaz-green mb-2">Sales Trend</h2>
          {/* <Line data={salesData} /> */}
          <div className="h-48 flex items-center justify-center text-gray-400">[Sales Trend Graph]</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-naaz-green mb-2">Revenue Breakdown</h2>
          {/* <Bar data={revenueData} /> */}
          <div className="h-48 flex items-center justify-center text-gray-400">[Revenue Breakdown Graph]</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <h2 className="font-semibold text-naaz-green mb-4">Recent Orders</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-2">Order ID</th>
              <th className="py-2 px-2">User</th>
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="py-2 px-2 font-mono">{order.id}</td>
                <td className="py-2 px-2">{order.user}</td>
                <td className="py-2 px-2">{order.date}</td>
                <td className="py-2 px-2">{order.status}</td>
                <td className="py-2 px-2">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOverview;
