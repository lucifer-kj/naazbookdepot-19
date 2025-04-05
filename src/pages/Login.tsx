
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-playfair font-bold text-naaz-green">Sign In</h1>
              <p className="text-gray-600 mt-2">Welcome back to The Naaz Group</p>
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
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm text-naaz-gold hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input 
                  type="password" 
                  id="password" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  placeholder="Your password"
                />
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="h-4 w-4 text-naaz-gold focus:ring-naaz-green" />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-naaz-green text-white py-2 px-4 rounded-md hover:bg-naaz-green/90 transition-colors"
              >
                Sign In
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Don't have an account? 
                <Link to="/register" className="text-naaz-gold hover:underline ml-1">
                  Sign up
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

export default Login;
