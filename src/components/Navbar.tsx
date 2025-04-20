
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, SprayCan, BookMarked, UserCircle, LogOut, ShoppingCart, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import Image from '@/components/ui/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl sm:text-2xl font-playfair font-bold text-naaz-green flex items-center space-x-2">
            <Image 
              src="/lovable-uploads/62fd92cc-0660-4c44-a99d-c69c5be673cb.png" 
              alt="Naaz Group Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-cover"
            />
            <span className="hidden sm:inline">Naaz Book Depot</span>
            <span className="sm:hidden">Naaz Book Depot </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
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

        {/* Desktop User Account */}
        <div className="hidden md:flex items-center space-x-4">
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
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px] pt-10">
              <div className="flex flex-col h-full space-y-6">
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/books" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green px-2 py-2 rounded-md hover:bg-gray-100"
                  >
                    <BookOpen size={20} />
                    <span>Books</span>
                  </Link>
                  <Link 
                    to="/perfumes" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green px-2 py-2 rounded-md hover:bg-gray-100"
                  >
                    <SprayCan size={20} />
                    <span>Perfumes</span>
                  </Link>
                  <Link 
                    to="/essentials" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green px-2 py-2 rounded-md hover:bg-gray-100"
                  >
                    <BookMarked size={20} />
                    <span>Essentials</span>
                  </Link>
                  <Link 
                    to="/cart" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green px-2 py-2 rounded-md hover:bg-gray-100"
                  >
                    <ShoppingCart size={20} />
                    <span>Cart</span>
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className="flex items-center space-x-2 text-naaz-green hover:text-naaz-green/80 px-2 py-2 rounded-md hover:bg-gray-100"
                        >
                          <Shield size={20} />
                          <span>Admin</span>
                        </Link>
                      )}
                      <Link 
                        to="/account" 
                        className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green px-2 py-2 rounded-md hover:bg-gray-100"
                      >
                        <UserCircle size={20} />
                        <span>{profile ? `${profile.first_name || 'My'} Account` : 'Account'}</span>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="flex items-center space-x-2 w-full justify-start px-2 py-2 h-auto font-normal"
                        onClick={handleLogout}
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2 px-2">
                      <Link to="/login" className="text-naaz-gold hover:underline py-2">
                        Login
                      </Link>
                      <Link to="/register" className="bg-naaz-green text-white px-4 py-2 rounded-md hover:bg-naaz-green/90 transition-colors text-center">
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
