
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Contact Info Strip */}
      <div className="bg-naaz-green text-white py-2 px-4">
        <div className="container mx-auto text-center text-sm">
          <span className="hidden md:inline">📞 +91 98765 43210 | ✉️ info@naazbookdepot.com | 📍 Kolkata, West Bengal</span>
          <span className="md:hidden">📞 +91 98765 43210</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-naaz-cream py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-start">
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green">
              Naaz Book Depot
            </h1>
            <p className="text-xs md:text-sm text-naaz-green/80 font-arabic">
              Publishing the Light of Knowledge
            </p>
            <p className="text-xs text-naaz-green/60">Est. 1967</p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
              Home
            </Link>
            <Link to="/books" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
              Books
            </Link>
            <span className="text-naaz-green/50 cursor-not-allowed">
              Perfumes (Coming Soon)
            </span>
            <span className="text-naaz-green/50 cursor-not-allowed">
              Essentials (Coming Soon)
            </span>
            <Link to="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 w-64">
            <Search className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search for Islamic books, knowledge..."
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="text-naaz-green hover:text-naaz-gold transition-colors" size={24} />
              <span className="absolute -top-2 -right-2 bg-naaz-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="text-naaz-green hover:text-naaz-gold transition-colors"
              >
                <User size={24} />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign In
                  </Link>
                  <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Register
                  </Link>
                  <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-naaz-green"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 animate-slide-down">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
                <Search className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Search Islamic books..."
                  className="flex-1 outline-none text-sm"
                />
              </div>
              
              {/* Mobile Menu Links */}
              <Link to="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2">
                Home
              </Link>
              <Link to="/books" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2">
                Books
              </Link>
              <span className="text-naaz-green/50 py-2">
                Perfumes (Coming Soon)
              </span>
              <span className="text-naaz-green/50 py-2">
                Essentials (Coming Soon)
              </span>
              <Link to="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2">
                About
              </Link>
              <Link to="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2">
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
