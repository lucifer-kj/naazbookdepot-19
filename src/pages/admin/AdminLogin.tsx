
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const AdminLogin = () => {
  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle redirection when user becomes authenticated admin
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      console.log('Admin authenticated, redirecting to dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  // Show loading state only briefly
  const [showSpinner, setShowSpinner] = useState(true);
  useEffect(() => {
    if (!loading) {
      setShowSpinner(false);
    } else {
      const timer = setTimeout(() => setShowSpinner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (showSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-naaz-cream">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naaz-green"></div>
      </div>
    );
  }

  // Redirect authenticated admins immediately
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting admin login with:', formData.email);
      
      const result = await login(formData.email, formData.password);
      
      if (result.error) {
        console.error('Login error:', result.error);
        setError(result.error.message || 'Login failed. Please check your credentials.');
        return;
      }

      if (result.user && result.session) {
        console.log('Login successful, waiting for admin verification...');
        // The useEffect above will handle navigation when isAdmin becomes true
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-naaz-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            className="mx-auto h-16 w-auto"
            src="/lovable-uploads/logo.png"
            alt="Naaz Books"
          />
          <h2 className="mt-6 text-3xl font-playfair font-bold text-naaz-green">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the administrative dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="admin@naazbook.in"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-naaz-green hover:bg-naaz-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-naaz-green hover:text-naaz-gold transition-colors"
            >
              ← Back to Website
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
