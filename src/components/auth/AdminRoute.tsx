
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const AdminRoute: React.FC = () => {
  const { isLoading, isAdmin, user, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if session exists but user is not admin
    if (!isLoading && session && user && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isLoading, isAdmin, user, session, navigate]);

  // Add a console log to track the state of authentication
  useEffect(() => {
    console.log('AdminRoute state:', { isLoading, isAdmin, hasUser: !!user, hasSession: !!session });
  }, [isLoading, isAdmin, user, session]);

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

  // Use a simpler check for admin here
  // Check if the user's email contains 'admin' or is exactly 'admin@naaz.com'
  const userEmail = user.email || '';
  const isEmailAdmin = userEmail.includes('admin') || userEmail === 'admin@naaz.com';
  
  if (!isAdmin && !isEmailAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
