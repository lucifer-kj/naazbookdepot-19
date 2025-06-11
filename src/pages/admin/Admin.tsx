import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import Overview from './pages/Overview';
import Products from './pages/Products';
import Orders from './pages/Orders';
// Customers and Settings are already imported.
// import Customers from './pages/Customers';
// import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement'; // Added this import
import AdminLoginUI from './components/AdminLoginUI';
import OTPPage from './components/OTPPage';
import DashboardOverview from './components/DashboardOverview';
import ProductList from './components/ProductList';
import AddEditProduct from './components/AddEditProduct';
import CategoriesTags from './components/CategoriesTags';
import OrdersList from './components/OrdersList';
import OrderDetails from './components/OrderDetails';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-naaz-cream">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Toaster richColors position="top-right" />
          <Routes>
            {/* <Route path="/login" element={<AdminLoginUI />} /> Removed this line */}
            <Route path="/2fa" element={<OTPPage />} /> {/* Assuming 2FA is part of a different flow or will be removed if not used */}
            <Route path="/overview" element={<DashboardOverview />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/add" element={<AddEditProduct />} />
            <Route path="/products/edit/:productId" element={<AddEditProduct />} /> {/* Added this line */}
            <Route path="/categories" element={<CategoriesTags />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/customers" element={<Customers />} /> {/* Added this line */}
            <Route path="/settings" element={<Settings />} /> {/* Added this line */}
            <Route path="/users" element={<UserManagement />} /> {/* Added this line */}
            <Route path="/" element={<Navigate to="overview" replace />} />
            {/* Add more admin routes as needed */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
