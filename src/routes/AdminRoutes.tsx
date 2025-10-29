import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingBar } from '@/components/common/LoadingBar';
import AdminRoute from '@/components/admin/AdminRoute';

// Lazy load admin components for better code splitting
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const ProductNew = lazy(() => import('@/pages/admin/ProductNew'));
const ProductEdit = lazy(() => import('@/pages/admin/ProductEdit'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminUserProfiles = lazy(() => import('@/pages/admin/UserProfiles'));
const AdminInventory = lazy(() => import('@/pages/admin/Inventory'));
const AdminReviews = lazy(() => import('@/pages/admin/Reviews'));
const AdminPromoCodes = lazy(() => import('@/pages/admin/PromoCodes'));

export const AdminRoutes = () => {
  return (
    <Suspense fallback={<LoadingBar />}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/products/new" element={<AdminRoute><ProductNew /></AdminRoute>} />
        <Route path="/products/:id/edit" element={<AdminRoute><ProductEdit /></AdminRoute>} />
        <Route path="/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/user-profiles" element={<AdminRoute><AdminUserProfiles /></AdminRoute>} />
        <Route path="/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
        <Route path="/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
        <Route path="/promo-codes" element={<AdminRoute><AdminPromoCodes /></AdminRoute>} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
