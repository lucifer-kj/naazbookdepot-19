
import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-naaz-cream animate-pulse">
    <div className="flex">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-64 bg-white shadow-lg">
        <div className="h-16 bg-gray-200 mb-6"></div>
        <div className="px-3 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AccessDenied = () => (
  <div className="min-h-screen flex items-center justify-center bg-naaz-cream">
    <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md animate-fade-in">
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

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Memoize the authentication state to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    isAuthenticated,
    isAdmin,
    loading
  }), [isAuthenticated, isAdmin, loading]);

  console.log('AdminRoute check:', authState);

  // Always call hooks before any conditional returns
  const [showSkeleton, setShowSkeleton] = React.useState(true);
  
  React.useEffect(() => {
    if (!authState.loading) {
      setShowSkeleton(false);
    } else {
      const timer = setTimeout(() => setShowSkeleton(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [authState.loading]);

  if (authState.loading && showSkeleton) {
    return <LoadingSkeleton />;
  }

  if (!authState.isAuthenticated) {
    console.log('User not authenticated, redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  if (!authState.isAdmin) {
    console.log('User not admin, showing access denied');
    return <AccessDenied />;
  }

  console.log('Access granted to admin panel');
  return <div className="animate-fade-in">{children}</div>;
};

export default AdminRoute;
