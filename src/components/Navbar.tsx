
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, SprayCan, BookMarked, UserCircle, LogOut, ShoppingCart, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const NavLinks = () => (
    <>
      <Link to="/books" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
        <BookOpen size={20} />
        <span>Books</span>
      </Link>
      <Link to="/perfumes" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
        <SprayCan size={20} />
        <span>Perfumes</span>
      </Link>
      <Link to="/essentials" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
        <BookMarked size={20} />
        <span>Essentials</span>
      </Link>
    </>
  );

  const UserMenu = () => (
    <>
      <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
        <ShoppingCart size={20} />
        <span>Cart</span>
      </Link>
      
      {user ? (
        <>
          {isAdmin && (
            <Link to="/admin" className="flex items-center space-x-2 text-naaz-green hover:text-naaz-green/80">
              <Shield size={20} />
              <span>Admin</span>
            </Link>
          )}
          <Link to="/account" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
            <UserCircle size={20} />
            <span>{profile ? `${profile.first_name || 'My'} Account` : 'Account'}</span>
          </Link>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" className="text-naaz-gold hover:underline">
            Login
          </Link>
          <Link to="/register" className="bg-naaz-green text-white px-4 py-2 rounded-md hover:bg-naaz-green/90 transition-colors">
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="w-full max-w-[2000px] mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl md:text-2xl font-playfair font-bold text-naaz-green">
            The Naaz Group
          </Link>

          {isMobile ? (
            <button onClick={toggleMenu} className="p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          ) : (
            <>
              <div className="hidden md:flex items-center space-x-6">
                <NavLinks />
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <UserMenu />
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden mt-4 py-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <NavLinks />
            </div>
            <div className="flex flex-col space-y-4 border-t pt-4">
              <UserMenu />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
