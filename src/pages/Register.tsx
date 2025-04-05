
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-playfair font-bold text-naaz-green">Create Account</h1>
              <p className="text-gray-600 mt-2">Join The Naaz Group family</p>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                    placeholder="Your last name"
                  />
                </div>
              </div>
              
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
                <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  placeholder="Your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  placeholder="Create a password"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  placeholder="Confirm your password"
                />
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="marketing" className="h-4 w-4 text-naaz-gold focus:ring-naaz-green" />
                <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                  Subscribe to our newsletter for exclusive offers and updates
                </label>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="terms" className="h-4 w-4 text-naaz-gold focus:ring-naaz-green" />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <Link to="/terms" className="text-naaz-gold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-naaz-gold hover:underline">Privacy Policy</Link>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-naaz-green text-white py-2 px-4 rounded-md hover:bg-naaz-green/90 transition-colors"
              >
                Create Account
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Already have an account? 
                <Link to="/login" className="text-naaz-gold hover:underline ml-1">
                  Sign in
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

export default Register;
