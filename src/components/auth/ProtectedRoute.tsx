
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show nothing (or you could add a loading spinner here)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-naaz-green"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export const AdminRoute = () => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show nothing (or you could add a loading spinner here)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-naaz-green"></div>
      </div>
    );
  }

  // If not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If admin, render the child routes
  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination from state, or default to home
  const from = location.state?.from?.pathname || '/';

  // If still loading, show nothing (or you could add a loading spinner here)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-naaz-green"></div>
      </div>
    );
  }

  // If authenticated, redirect to the intended destination or home
  if (user) {
    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the child routes
  return <Outlet />;
};
