import React from "react";
import { FaHome, FaFileInvoice, FaUsers, FaBoxOpen, FaEnvelope, FaCog, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { useAdminProducts, useAdminOrders } from '@/lib/hooks/useAdmin';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const navLinks = [
  { icon: <FaHome />, label: "Home" },
  { icon: <FaFileInvoice />, label: "Invoices" },
  { icon: <FaUsers />, label: "Clients" },
  { icon: <FaBoxOpen />, label: "Products" },
  { icon: <FaEnvelope />, label: "Messages" },
  { icon: <FaCog />, label: "Settings" },
  { icon: <FaQuestionCircle />, label: "Help" },
];

const summaryCards = [
  { label: "Total Revenue", value: "$216k", badge: "+8.2%", color: "bg-orange-100", icon: "🟠" },
  { label: "Invoices", value: "2,221", badge: "+2.1%", color: "bg-green-100", icon: "🟢" },
  { label: "Clients", value: "1,423", badge: "+1.4%", color: "bg-blue-100", icon: "🔵" },
  { label: "Loyalty", value: "78%", badge: "-1.2%", color: "bg-pink-100", icon: "🟣" },
];

const activities = [
  { type: "New Invoice", user: "Francisco Gibbs", action: "created invoice PQ-4491C", time: "Just Now" },
  { type: "Invoice JL-3432B reminder", user: "", action: "sent to Chester Corp", time: "Today, 12:09PM" },
];

const invoices = [
  { no: "PQ-4491C", date: "3 Jul, 2020", client: "Daniel Padilla", amount: "$2,450", status: "PAID" },
  { no: "IN-9911", date: "21 May, 2021", client: "Christina Jacobs", amount: "$148.80", status: "OVERDUE" },
  { no: "UV-2393A", date: "14 Apr, 2020", client: "Elizabeth Bailey", amount: "$1,340", status: "PAID" },
];

const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const revenueData = [8000, 12000, 9000, 15000, 11000, 10000, 9500, 10500, 9800];

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StatsCard = ({ icon: Icon, title, value, color }: {
  icon: React.ComponentType<any>;
  title: string;
  value: number;
  color: string;
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center">
      <div className={`p-2 ${color} rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();

  const isLoading = productsLoading || ordersLoading;

  const stats = React.useMemo(() => ({
    totalProducts: products?.length || 0,
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
    lowStockProducts: products?.filter(product => product.stock < 5).length || 0,
  }), [products, orders]);

  const recentOrders = React.useMemo(() => 
    orders?.slice(0, 5) || [], [orders]
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col justify-between py-6 px-4">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">I</div>
              <span className="font-bold text-xl">Invo.</span>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <button key={link.label} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition ${idx === 0 ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}>
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <FaSignOutAlt />
              Log Out
            </button>
            <div className="flex items-center gap-3 mt-4">
              <img src="/public/lovable-uploads/Owner.jpg" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="font-semibold text-gray-800">David Spade</div>
                <div className="text-xs text-gray-400">Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <input type="text" placeholder="Tap to search" className="w-1/3 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
            <div className="flex items-center gap-4">
              <img src="/public/lovable-uploads/Owner.jpg" alt="Admin" className="w-9 h-9 rounded-full object-cover" />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {summaryCards.map(card => (
              <div key={card.label} className={`rounded-xl p-6 shadow-sm ${card.color} flex flex-col gap-2`}>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>{card.icon}</span>
                  {card.label}
                </div>
                <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                <span className="text-xs text-green-600 font-semibold">{card.badge}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Monthly Revenue Chart */}
            <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm flex flex-col">
              <div className="font-semibold text-gray-700 mb-2">Monthly Revenue</div>
              <div className="text-3xl font-bold mb-4">$15,000</div>
              <div className="flex items-end gap-3 h-32">
                {revenueData.map((val, idx) => (
                  <div key={months[idx]} className="flex flex-col items-center">
                    <div className={`w-7 rounded-t-lg ${idx === 3 ? 'bg-blue-600' : 'bg-gray-200'} transition-all`} style={{ height: `${val / 200}px` }}></div>
                    <span className="text-xs mt-2 text-gray-400">{months[idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-400 rounded-xl p-6 shadow-sm text-white flex flex-col justify-between">
              <div>
                <span className="bg-white text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">NEW</span>
                <div className="font-bold text-lg mt-4 mb-2">We have added new invoicing templates!</div>
                <div className="text-sm opacity-80">New templates focused on helping you improve your business.</div>
              </div>
              <button className="mt-6 bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition">Download Now</button>
            </div>
          </div>

          {/* Activities & Recent Invoices */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            {/* Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="font-semibold text-gray-700 mb-4">Activities</div>
              <ul className="flex flex-col gap-4">
                {activities.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-green-500"></span>
                    <div>
                      <span className="font-semibold text-gray-800">{act.user}</span> {act.action}
                      <div className="text-xs text-gray-400">{act.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Recent Invoices */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="font-semibold text-gray-700 mb-4">Recent Invoices</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left font-normal pb-2">No</th>
                    <th className="text-left font-normal pb-2">Date Created</th>
                    <th className="text-left font-normal pb-2">Client</th>
                    <th className="text-left font-normal pb-2">Amount</th>
                    <th className="text-left font-normal pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => (
                    <tr key={inv.no} className="border-t">
                      <td className="py-2 font-semibold text-gray-700">{inv.no}</td>
                      <td className="py-2">{inv.date}</td>
                      <td className="py-2">{inv.client}</td>
                      <td className="py-2">{inv.amount}</td>
                      <td className={`py-2 font-semibold ${inv.status === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
