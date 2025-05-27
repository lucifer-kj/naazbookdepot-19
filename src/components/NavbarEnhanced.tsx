
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, ChevronDown, BookOpen, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

const NavbarEnhanced = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isBooksDropdownOpen, setIsBooksDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();

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

  const bookCategories = [
    { name: 'Quran & Tafseer', path: '/books?category=quran', icon: '📖' },
    { name: 'Hadith Collections', path: '/books?category=hadith', icon: '📚' },
    { name: 'Islamic Jurisprudence', path: '/books?category=fiqh', icon: '⚖️' },
    { name: 'Islamic History', path: '/books?category=history', icon: '🏛️' },
    { name: 'Children\'s Books', path: '/books?category=children', icon: '👶' },
    { name: 'Urdu Literature', path: '/books?category=urdu', icon: '🖋️' }
  ];

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
              
              {/* Books Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsBooksDropdownOpen(true)}
                onMouseLeave={() => setIsBooksDropdownOpen(false)}
              >
                <button className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 border-b-2 border-transparent hover:border-naaz-gold">
                  Books
                  <ChevronDown size={16} className={`ml-1 transition-transform ${isBooksDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isBooksDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 animate-slide-down">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-naaz-green">Browse Categories</h3>
                    </div>
                    {bookCategories.map((category, index) => (
                      <Link
                        key={index}
                        to={category.path}
                        className="flex items-center px-4 py-3 hover:bg-naaz-cream/50 transition-colors group"
                      >
                        <span className="text-lg mr-3 group-hover:scale-110 transition-transform">{category.icon}</span>
                        <span className="text-gray-700 group-hover:text-naaz-green transition-colors">{category.name}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link to="/books" className="block px-4 py-2 text-naaz-gold hover:text-naaz-green font-medium">
                        View All Books →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

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

            {/* Enhanced Search Bar */}
            <div className={`hidden md:flex items-center bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${isSearchExpanded ? 'w-80' : 'w-64'}`}>
              <Search className="text-gray-400 ml-3" size={18} />
              <input
                type="text"
                placeholder="Search for Islamic books, knowledge..."
                className="flex-1 outline-none text-sm py-3 px-3"
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => setIsSearchExpanded(false)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Cart with Animation */}
              <Link to="/cart" className="relative group">
                <ShoppingCart className="text-naaz-green hover:text-naaz-gold transition-colors group-hover:scale-110 duration-200" size={24} />
                <span className="absolute -top-2 -right-2 bg-naaz-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  0
                </span>
              </Link>

              {/* Enhanced User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="text-naaz-green hover:text-naaz-gold transition-colors flex items-center space-x-2 group"
                >
                  <User size={24} className="group-hover:scale-110 transition-transform" />
                  {isAuthenticated && user && (
                    <span className="hidden md:inline text-sm font-medium">
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                  <ChevronDown size={16} className={`transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-scale-in">
                    {isAuthenticated && user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                        <Link 
                          to="/account" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <User size={16} className="mr-3" />
                          My Account
                        </Link>
                        <Link 
                          to="/account" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <BookOpen size={16} className="mr-3" />
                          My Orders
                        </Link>
                        <Link 
                          to="/account" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Heart size={16} className="mr-3" />
                          Wishlist
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowLoginModal(true);
                            setIsUserDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            setShowLoginModal(true);
                            setIsUserDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                        >
                          Register
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

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

export default NavbarEnhanced;
