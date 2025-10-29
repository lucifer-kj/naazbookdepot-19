
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import AnimatedCartIcon from '@/components/ui/AnimatedCartIcon';
import { MobileDrawer } from '@/components/ui/mobile-drawer';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isProductsDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target as Node) &&
        productsButtonRef.current &&
        !productsButtonRef.current.contains(event.target as Node)
      ) {
        setIsProductsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProductsDropdownOpen]);
  
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();

  const handleSignOut = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  const productCategories = [{
    name: 'Islamic Books',
    path: '/books',
    available: true
  }, {
    name: 'Quran & Tafseer',
    path: '/books?category=quran',
    available: true
  }, {
    name: 'Hadith Collections',
    path: '/books?category=hadith',
    available: true
  }, {
    name: 'Perfumes',
    path: '/perfumes',
    available: false
  }, {
    name: 'Essentials',
    path: '/essentials',
    available: false
  }];

  return <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        {/* Main Navigation */}
        <nav className="bg-naaz-cream py-4 px-4">
          <div className="container mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-start flex-row gap-3 items-center">
              <img
                src="/lovable-uploads/logo.png"
                alt="Naaz Book Depot Logo"
                className="w-10 h-10 object-contain"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green">
                  Naaz Book Depot
                </h1>
                <p className="hidden md:block text-xs md:text-sm text-naaz-green/80 font-arabic">
                  Publishing the Light of Knowledge
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
                Home
              </Link>
              
              {/* Products Dropdown with improved hover behavior */}
              <div className="relative">
                <button
                  ref={productsButtonRef}
                  className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors font-medium"
                  type="button"
                  onClick={() => setIsProductsDropdownOpen((v) => !v)}
                >
                  Products
                  <ChevronDown size={16} className={`ml-1 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProductsDropdownOpen && (
                  <div
                    ref={productsDropdownRef}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 animate-slide-down"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-naaz-green">Browse Products</h3>
                    </div>
                    {productCategories.map((category, index) => (
                      <Link 
                        key={index} 
                        to={category.path} 
                        className={`flex items-center justify-between px-4 py-3 transition-colors ${
                          category.available 
                            ? 'hover:bg-naaz-cream/50 text-gray-700 hover:text-naaz-green' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => setIsProductsDropdownOpen(false)}
                        tabIndex={category.available ? 0 : -1}
                        aria-disabled={!category.available}
                      >
                        <span>{category.name}</span>
                        {!category.available && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Soon
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
                Contact
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Search Icon/Bar */}
              <div className="hidden md:flex items-center">
                {isSearchExpanded ? (
                  <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 w-80 transition-all duration-300">
                    <Search className="text-gray-400 mr-2" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search for Islamic books, knowledge..." 
                      className="flex-1 outline-none text-sm" 
                      autoFocus 
                      onBlur={() => setIsSearchExpanded(false)} 
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsSearchExpanded(true)} 
                    className="text-naaz-green hover:text-naaz-gold transition-colors p-2"
                  >
                    <Search size={24} />
                  </button>
                )}
              </div>

              {/* Animated Cart */}
              <Link to="/cart">
                <AnimatedCartIcon />
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} 
                  className="text-naaz-green hover:text-naaz-gold transition-colors flex items-center space-x-1"
                >
                  <User size={24} />
                  {isAuthenticated && user && (
                    <span className="hidden md:inline text-sm font-medium">
                      {user.name ? user.name.split(' ')[0] : ''}
                    </span>
                  )}
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {isAuthenticated && user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                        <Link 
                          to="/account" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link 
                          to="/account" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link 
                          to="/account" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <hr className="my-1" />
                        <button 
                          onClick={handleSignOut} 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut size={16} className="mr-2" />
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
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign In
                        </button>
                        <button 
                          onClick={() => {
                            setShowLoginModal(true);
                            setIsUserDropdownOpen(false);
                          }} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                className="lg:hidden text-naaz-green"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation (drawer) */}
          <MobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} className="lg:hidden">
            <div className="p-4">
              {/* Mobile Search */}
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 mb-4">
                <Search className="text-gray-400 mr-2" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Islamic books..." 
                  className="flex-1 outline-none text-sm" 
                />
              </div>

              {/* Mobile Menu Links */}
              <div className="flex flex-col space-y-1">
                <Link to="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-4 px-2 rounded-lg hover:bg-naaz-cream/50 touch-manipulation" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/products" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-4 px-2 rounded-lg hover:bg-naaz-cream/50 touch-manipulation" onClick={() => setIsMenuOpen(false)}>
                  Products
                </Link>
                <Link to="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-4 px-2 rounded-lg hover:bg-naaz-cream/50 touch-manipulation" onClick={() => setIsMenuOpen(false)}>
                  About
                </Link>
                <Link to="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-4 px-2 rounded-lg hover:bg-naaz-cream/50 touch-manipulation" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </Link>
              </div>
            </div>
          </MobileDrawer>
        </nav>
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>;
};

export default Navbar;
