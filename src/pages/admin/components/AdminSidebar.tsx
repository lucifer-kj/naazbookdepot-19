import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, ShoppingCart, Users, Settings, ArrowLeft } from 'lucide-react';

const links = [
  { to: "/admin/overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { to: "/admin/products", label: "Products", icon: <Book size={18} /> },
  { to: "/admin/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
  { to: "/admin/customers", label: "Customers", icon: <Users size={18} /> },
  { to: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
];

const AdminSidebar: React.FC = () => (
  <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <img src="/lovable-uploads/logo.png" alt="Naaz Book Depot" className="w-10 h-10" />
        <div>
          <div className="font-playfair font-bold text-naaz-green text-lg">Naaz Book Depot</div>
          <div className="text-xs text-gray-500">Admin Panel</div>
        </div>
      </div>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      <NavLink to="/" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-naaz-cream text-naaz-green font-medium">
        <ArrowLeft size={16} /> Back to Store
      </NavLink>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              isActive ? 'bg-naaz-green/10 text-naaz-green font-semibold' : 'text-gray-700 hover:bg-naaz-cream'
            }`
          }
        >
          {link.icon}
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;
