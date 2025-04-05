
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    return location.pathname === path ? 'active-nav-link' : '';
  };

  return (
    <header className="bg-naaz-cream border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-naaz-green font-playfair text-2xl font-bold">Naaz Book Depot</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden flex items-center text-naaz-green"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <Link to="/" className={`nav-link ${isActiveRoute('/')}`}>Home</Link>
          <Link to="/perfumes" className={`nav-link ${isActiveRoute('/perfumes')}`}>Perfumes</Link>
          <Link to="/books" className={`nav-link ${isActiveRoute('/books')}`}>Books</Link>
          <Link to="/essentials" className={`nav-link ${isActiveRoute('/essentials')}`}>Essentials</Link>
          <Link to="/about" className={`nav-link ${isActiveRoute('/about')}`}>About Us</Link>
          <Link to="/contact" className={`nav-link ${isActiveRoute('/contact')}`}>Contact</Link>
        </div>

        {/* Icons for search, wishlist, cart */}
        <div className="hidden md:flex items-center space-x-6">
          <button aria-label="Search" className="text-naaz-green hover:text-naaz-gold transition-colors">
            <Search size={20} />
          </button>
          <Link to="/wishlist" aria-label="Wishlist" className="text-naaz-green hover:text-naaz-gold transition-colors">
            <Heart size={20} />
          </Link>
          <Link to="/cart" aria-label="Cart" className="text-naaz-green hover:text-naaz-gold transition-colors">
            <ShoppingCart size={20} />
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-naaz-cream z-50 border-b border-gray-200 shadow-lg animate-fade-in">
            <div className="flex flex-col p-4">
              <Link to="/" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/perfumes" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Perfumes</Link>
              <Link to="/books" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Books</Link>
              <Link to="/essentials" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Essentials</Link>
              <Link to="/about" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>About Us</Link>
              <Link to="/contact" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              
              <div className="flex justify-around py-4 border-t border-gray-200 mt-2">
                <button aria-label="Search" className="text-naaz-green hover:text-naaz-gold transition-colors">
                  <Search size={20} />
                </button>
                <Link to="/wishlist" aria-label="Wishlist" className="text-naaz-green hover:text-naaz-gold transition-colors">
                  <Heart size={20} />
                </Link>
                <Link to="/cart" aria-label="Cart" className="text-naaz-green hover:text-naaz-gold transition-colors">
                  <ShoppingCart size={20} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
