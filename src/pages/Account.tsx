
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UserDashboard from '@/components/account/UserDashboard';
import ProfileSettings from '@/components/account/ProfileSettings';
import OrderHistory from '@/components/account/OrderHistory';
import LoginModal from '@/components/auth/LoginModal';

const Account = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naaz-green"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-16 px-4">
          <LoginModal />
        </div>
        <Footer />
      </div>
    );
  }

  // Determine which component to render based on the current path
  const renderAccountContent = () => {
    const path = location.pathname;
    
    if (path.includes('/account/profile') || path.includes('/account/settings')) {
      return <ProfileSettings />;
    } else if (path.includes('/account/orders')) {
      return <OrderHistory />;
    } else if (path.includes('/account/wishlist')) {
      // Will redirect to wishlist page or show wishlist content
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">Wishlist</h2>
          <p className="text-gray-600">Your wishlist items will appear here.</p>
        </div>
      );
    } else {
      // Default dashboard view
      return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {renderAccountContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
