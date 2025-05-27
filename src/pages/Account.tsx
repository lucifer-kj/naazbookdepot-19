
import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UserDashboard from '@/components/account/UserDashboard';
import LoginModal from '@/components/auth/LoginModal';

const Account: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-naaz-cream flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
            <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-4">
              Account Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access your account dashboard and manage your orders.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-naaz-green text-white px-6 py-3 rounded-lg font-medium hover:bg-naaz-green/90 transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
        <Footer />
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-naaz-cream py-8">
        <UserDashboard />
      </div>
      <Footer />
    </>
  );
};

export default Account;
