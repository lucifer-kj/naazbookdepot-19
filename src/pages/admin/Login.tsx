
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdminByEmail } from '@/lib/utils/auth-utils';
import { FormError } from '@/components/ui/form-error';
import { logError } from '@/lib/services/error-service';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAdmin } = useAuth();

  // Check connection status on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setConnectionStatus('connected');
        
        // If already signed in and is admin, redirect
        if (data.session && isAdmin) {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Connection error:', error);
        setConnectionStatus('disconnected');
        setError('Unable to connect to authentication service. Please check your internet connection.');
      }
    };
    
    checkConnection();
    
    // Set up a periodic connection check
    const intervalId = setInterval(checkConnection, 30000);
    return () => clearInterval(intervalId);
  }, [navigate, isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (connectionStatus !== 'connected') {
        throw new Error('No connection to authentication service. Please check your internet connection and try again.');
      }

      // Validate inputs
      if (!email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Try to sign in
      await signIn(email, password);
      
      // Get the current session to verify the user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication failed. Please try again.');
      }
      
      const user = sessionData.session.user;
      
      // First check if the email indicates admin status as a quick check
      const isAdminByEmail = await checkIsAdminByEmail();
      
      if (isAdminByEmail) {
        toast.success('Admin login successful');
        navigate('/admin');
        return;
      }
      
      // If not admin by email, check the database
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (userError) {
          console.error('Error checking user role:', userError);
          throw new Error('Could not verify admin privileges');
        }
        
        if (userData?.role === 'admin') {
          toast.success('Admin login successful');
          navigate('/admin');
        } else {
          throw new Error('Access denied. Admin privileges required.');
        }
      } catch (error) {
        // If we couldn't verify from the database, rely on the email check as fallback
        if (isAdminByEmail) {
          toast.success('Admin login successful (verified by email)');
          navigate('/admin');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      // Increment login attempts
      setLoginAttempts(prev => prev + 1);
      
      // Format user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Access denied')) {
          errorMessage = 'Access denied. This account does not have admin privileges.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Log the error
      logError({
        type: 'auth_error',
        error: {
          message: error.message || 'Admin login error',
          stack: error.stack,
          code: error.code
        },
        context: { email, loginAttempts: loginAttempts + 1 }
      });
      
      // Ensure user is signed out on error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Sign out error:', signOutError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reconnection handler
  const handleReconnect = async () => {
    setConnectionStatus('connecting');
    try {
      await supabase.auth.getSession();
      setConnectionStatus('connected');
      setError(null);
      toast.success('Connection restored');
    } catch (error) {
      setConnectionStatus('disconnected');
      setError('Unable to connect. Please check your internet connection.');
      toast.error('Connection failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-naaz-green" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        
        {connectionStatus === 'disconnected' && (
          <div className="mb-4">
            <FormError 
              title="Connection Error" 
              error="Unable to connect to authentication service. Please check your internet connection."
            />
            <Button 
              onClick={handleReconnect} 
              variant="outline" 
              className="w-full mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
          </div>
        )}
        
        {error && <FormError title="Authentication Error" error={error} />}
        
        {loginAttempts >= 3 && (
          <div className="rounded-md bg-yellow-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Multiple failed login attempts
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You've had multiple failed login attempts. Make sure you're using the correct admin credentials.
                    If you're still having trouble, contact the system administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleAdminLogin} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || connectionStatus !== 'connected'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-naaz-green hover:bg-naaz-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
          
          <div className="text-sm text-center">
            <a href="/" className="font-medium text-naaz-green hover:text-naaz-green/80">
              Return to main site
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
