
import React from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, BookOpen, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface UserDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onSignOut: () => void;
  onShowLoginModal: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  isOpen, 
  onToggle, 
  onSignOut, 
  onShowLoginModal 
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="text-naaz-green hover:text-naaz-gold transition-colors flex items-center space-x-2 group"
      >
        <User size={24} className="group-hover:scale-110 transition-transform" />
        {isAuthenticated && user && (
          <span className="hidden md:inline text-sm font-medium">
            {user.name?.split(' ')[0] || 'User'}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-scale-in">
          {isAuthenticated && user ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <Link 
                to="/account" 
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                onClick={onToggle}
              >
                <User size={16} className="mr-3" />
                My Account
              </Link>
              <Link 
                to="/account" 
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                onClick={onToggle}
              >
                <BookOpen size={16} className="mr-3" />
                My Orders
              </Link>
              <Link 
                to="/account" 
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
                onClick={onToggle}
              >
                <Heart size={16} className="mr-3" />
                Wishlist
              </Link>
              <hr className="my-1" />
              <button
                onClick={onSignOut}
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
                  onShowLoginModal();
                  onToggle();
                }}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-naaz-cream/50 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onShowLoginModal();
                  onToggle();
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
  );
};

export default UserDropdown;
