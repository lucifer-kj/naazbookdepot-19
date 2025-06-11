import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal'; // Assuming LoginModal is in this path

interface NavActionButtonsProps {
  onAccountClick?: () => void; // For top-right profile picture click
}

const NavActionButtons: React.FC<NavActionButtonsProps> = ({ onAccountClick }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const { user, isAuthenticated, logout } = useAuth();

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!isUserDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleSignOut = () => {
    logout(); // Assuming logout from useAuth handles toast internally or doesn't need one here
    setIsUserDropdownOpen(false);
  };

  // Determine profile picture, fallback to a default if not available
  // Accessing user_metadata for full_name, and profile.full_name as a fallback
  const displayName = user?.user_metadata?.full_name || user?.profile?.full_name || user?.email?.split('@')[0] || 'User';
  const profilePic = user?.user_metadata?.avatar_url || user?.profile?.avatar_url || '/lovable-uploads/Owner.jpg';


  return (
    <>
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
              aria-label="Expand search"
            >
              <Search size={24} />
            </button>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="relative" aria-label="View shopping cart">
          <ShoppingCart className="text-naaz-green hover:text-naaz-gold transition-colors" size={24} />
          <span className="absolute -top-2 -right-2 bg-naaz-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {/* TODO: Replace with actual cart item count from CartContext */}0
          </span>
        </Link>

        {/* User Dropdown / Sign In */}
        <div className="relative">
          <button
            ref={userButtonRef}
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="text-naaz-green hover:text-naaz-gold transition-colors flex items-center space-x-1"
            aria-label="User menu"
            aria-expanded={isUserDropdownOpen}
          >
            <User size={24} />
            {isAuthenticated && user && (
              <span className="hidden md:inline text-sm font-medium">
                {displayName.split(' ')[0]}
              </span>
            )}
          </button>

          {isUserDropdownOpen && (
            <div
              ref={userDropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slide-down"
            >
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    to="/account/orders" // More specific path for orders
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    My Orders
                  </Link>
                  {/* <Link
                    to="/account/wishlist"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    Wishlist
                  </Link> */}
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
                      setShowLoginModal(true); // Assuming modal handles switching to register
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

        {/* Account Icon (top right, separate from dropdown trigger if needed by design) */}
        {isAuthenticated && user && onAccountClick && (
          <button
            className="relative focus:outline-none hidden md:block" // Example: hidden on mobile
            onClick={onAccountClick}
            aria-label="Account"
          >
            <img
              src={profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-naaz-gold shadow object-cover"
            />
          </button>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default NavActionButtons;
