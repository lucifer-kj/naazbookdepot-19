
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { checkIsAdminByEmail, refreshToken } from '@/lib/utils/auth-utils';
import { logError } from '@/lib/services/error-service';

export const AdminRoute: React.FC = () => {
  const { isLoading, isAdmin, user, session } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [emailAdminCheck, setEmailAdminCheck] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to handle manual retry
  const handleRetry = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // Try to refresh the token first
      const refreshed = await refreshToken();
      
      // Check admin status by email as fallback
      const isAdminByEmail = await checkIsAdminByEmail();
      setEmailAdminCheck(isAdminByEmail);
      
      if (refreshed) {
        toast.success('Session refreshed successfully');
        // Force reload the route to trigger a re-evaluation
        navigate(0);
      } else if (isAdminByEmail) {
        toast.success('Admin status verified');
        // Wait a moment and reload the route
        setTimeout(() => navigate(0), 1000);
      } else {
        toast.error('Unable to verify admin privileges');
        setError('Failed to verify admin privileges. Try logging in again.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      logError({
        type: 'auth_error',
        error: {
          message: errorMessage,
          stack: e instanceof Error ? e.stack : undefined
        }
      });
    } finally {
      setIsVerifying(false);
      setVerificationAttempts(prev => prev + 1);
    }
  };

  // Initial verification check
  useEffect(() => {
    // Only perform email check if not already determined to be admin
    if (!isLoading && !isAdmin && user) {
      const verifyAdminByEmail = async () => {
        try {
          const isAdminByEmail = await checkIsAdminByEmail();
          setEmailAdminCheck(isAdminByEmail);
          
          if (isAdminByEmail && !isAdmin) {
            console.log('User is admin by email but not by profile check');
          }
        } catch (error) {
          console.error('Error checking admin by email:', error);
        }
      };
      
      verifyAdminByEmail();
    }
  }, [isLoading, isAdmin, user]);

  // Add a console log to track the state of authentication
  useEffect(() => {
    console.log('AdminRoute state:', { 
      isLoading, 
      isAdmin, 
      emailAdminCheck,
      hasUser: !!user, 
      hasSession: !!session,
      attempts: verificationAttempts
    });
  }, [isLoading, isAdmin, emailAdminCheck, user, session, verificationAttempts]);

  // Handle auth errors
  useEffect(() => {
    if (!isLoading && session && user && !isAdmin && emailAdminCheck === false) {
      setError('Access denied. Admin privileges required.');
      toast.error('Access denied. Admin privileges required.');
    }
  }, [isLoading, isAdmin, user, session, emailAdminCheck]);

  // Show loading state
  if (isLoading || isVerifying) {
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

  // Show error with retry option
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleRetry} 
              disabled={verificationAttempts >= 3 || isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Verification
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/login')} 
              className="w-full"
            >
              Return to Login
            </Button>
          </div>
          
          {verificationAttempts >= 3 && (
            <Alert>
              <AlertTitle>Maximum attempts reached</AlertTitle>
              <AlertDescription>
                Please try logging in again or contact the system administrator for assistance.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // No user - redirect to login
  if (!user) {
    toast.error('Please log in to access admin area');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Access granted if either profile check or email check confirms admin status
  const accessGranted = isAdmin || emailAdminCheck === true;
  
  if (!accessGranted) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has admin privileges
  return <Outlet />;
};
