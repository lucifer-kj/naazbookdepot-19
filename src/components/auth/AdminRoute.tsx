
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminVerification } from '@/hooks/admin/useAdminVerification';
import { Shield } from 'lucide-react';

export const AdminRoute = () => {
  const { user, isAdmin } = useAuth(); // Add isAdmin directly from useAuth
  const location = useLocation();
  const { isVerifying, isVerified, error } = useAdminVerification();

  // No user or not an admin - redirect to admin login
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-4">
            <Shield className="h-12 w-12 text-naaz-green mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Verifying Admin Access</h2>
            <p className="text-gray-500">Please wait while we verify your credentials...</p>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Show error state if verification failed
  if (error || !isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'You do not have permission to access this area.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // User is authenticated and verified as admin
  return <Outlet />;
};
