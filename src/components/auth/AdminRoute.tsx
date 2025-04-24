
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminVerification } from '@/hooks/admin/useAdminVerification';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const AdminRoute = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { isVerifying, isVerified, error } = useAdminVerification();

  // Show toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error('Admin verification failed', {
        description: error
      });
    }
  }, [error]);

  // No user - redirect to admin login
  if (!user) {
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              {error || 'You do not have permission to access this area.'}
            </AlertDescription>
          </Alert>

          <div className="mt-4">
            <Alert>
              <AlertDescription className="text-sm">
                If you believe this is an error, please ensure your account has admin privileges in the database.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" asChild>
            <a href="/">Go to Home Page</a>
          </Button>
          <Button asChild>
            <a href="/admin/login">Return to Admin Login</a>
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated and verified as admin
  return <Outlet />;
};
