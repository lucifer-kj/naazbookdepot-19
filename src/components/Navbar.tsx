
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, SprayCan, BookMarked, UserCircle, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Link to="/" className="text-2xl font-playfair font-bold text-naaz-green">
          The Naaz Group
        </Link>

        <div className="flex items-center space-x-6">
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
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
            <ShoppingCart size={20} />
            <span>Cart</span>
          </Link>
          
          {user ? (
            <>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
