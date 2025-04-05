
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-playfair font-bold text-naaz-green">Reset Password</h1>
              <p className="text-gray-600 mt-2">Enter your email address to receive a password reset link</p>
            </div>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  placeholder="Your email"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-naaz-green text-white py-2 px-4 rounded-md hover:bg-naaz-green/90 transition-colors"
              >
                Send Reset Link
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-2">
                Remember your password? 
                <Link to="/login" className="text-naaz-gold hover:underline ml-1">
                  Sign in
                </Link>
              </p>
              <p className="text-gray-600">
                Don't have an account? 
                <Link to="/register" className="text-naaz-gold hover:underline ml-1">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
