
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import SearchBar from './navbar/SearchBar';
import BooksDropdown from './navbar/BooksDropdown';
import UserDropdown from './navbar/UserDropdown';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isBooksDropdownOpen, setIsBooksDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white shadow-md'}`}>
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
            <Link to="/" className="flex flex-col items-start group">
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green group-hover:text-naaz-gold transition-colors">
                Naaz Book Depot
              </h1>
              <p className="text-xs md:text-sm text-naaz-green/80 font-arabic">
                Publishing the Light of Knowledge
              </p>
              <p className="text-xs text-naaz-green/60">Est. 1967</p>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 border-b-2 border-transparent hover:border-naaz-gold">
                Home
              </Link>
              
              <BooksDropdown 
                isOpen={isBooksDropdownOpen}
                onMouseEnter={() => setIsBooksDropdownOpen(true)}
                onMouseLeave={() => setIsBooksDropdownOpen(false)}
              />

              <div className="flex items-center space-x-6 text-naaz-green/50">
                <div className="group flex items-center cursor-not-allowed">
                  <Heart size={16} className="mr-1" />
                  <span>Perfumes</span>
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Soon</span>
                </div>
                <div className="group flex items-center cursor-not-allowed">
                  <Sparkles size={16} className="mr-1" />
                  <span>Essentials</span>
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Soon</span>
                </div>
              </div>

              <Link to="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 border-b-2 border-transparent hover:border-naaz-gold">
                About
              </Link>
              <Link to="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 border-b-2 border-transparent hover:border-naaz-gold">
                Contact
              </Link>
            </div>

            <SearchBar />

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Cart with Animation */}
              <Link to="/cart" className="relative group">
                <ShoppingCart className="text-naaz-green hover:text-naaz-gold transition-colors group-hover:scale-110 duration-200" size={24} />
                <span className="absolute -top-2 -right-2 bg-naaz-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  0
                </span>
              </Link>

              <UserDropdown 
                isOpen={isUserDropdownOpen}
                onToggle={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                onSignOut={handleSignOut}
                onShowLoginModal={() => setShowLoginModal(true)}
              />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-naaz-green hover:text-naaz-gold transition-colors"
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

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default Navbar;
