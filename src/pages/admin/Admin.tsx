import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import Overview from './pages/Overview';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-naaz-cream">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="products/*" element={<Products />} />
            <Route path="orders/*" element={<Orders />} />
            <Route path="customers/*" element={<Customers />} />
            <Route path="settings/*" element={<Settings />} />
            {/* Add more admin routes as needed */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
