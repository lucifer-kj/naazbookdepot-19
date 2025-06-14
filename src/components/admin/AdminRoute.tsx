
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-naaz-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naaz-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-naaz-cream">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
          </p>
          <div className="space-y-2">
            <a 
              href="/" 
              className="block w-full bg-naaz-green text-white py-2 px-4 rounded hover:bg-naaz-green/90 transition-colors"
            >
              Return to Website
            </a>
            <button 
              onClick={() => window.location.href = '/admin/login'}
              className="block w-full border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
            >
              Try Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
