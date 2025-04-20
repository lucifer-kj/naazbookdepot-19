
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const AdminRoute: React.FC = () => {
  const { isLoading, isAdmin, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    toast.error('Please log in to access admin area');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
