
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, User } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    return location.pathname === path ? 'active-nav-link' : '';
  };

  return (
    <header className="bg-naaz-cream border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
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
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="space-x-6">
                <NavigationMenuItem>
                  <Link to="/" className={`nav-link ${isActiveRoute('/')}`}>Home</Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                    Shop
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-naaz-cream p-4 rounded-md shadow-lg border border-gray-200">
                    <div className="grid grid-cols-3 gap-8 w-[600px]">
                      <Link to="/books" className="group">
                        <div className="bg-naaz-green/10 rounded-lg p-4 transition-colors group-hover:bg-naaz-green/20">
                          <h3 className="font-playfair text-naaz-green text-lg mb-2">Islamic Books</h3>
                          <p className="text-sm text-gray-600">Discover our collection of Islamic literature</p>
                        </div>
                      </Link>
                      <Link to="/perfumes" className="group">
                        <div className="bg-naaz-green/10 rounded-lg p-4 transition-colors group-hover:bg-naaz-green/20">
                          <h3 className="font-playfair text-naaz-green text-lg mb-2">Non-Alcoholic Perfumes</h3>
                          <p className="text-sm text-gray-600">Premium attars and fragrances</p>
                        </div>
                      </Link>
                      <Link to="/essentials" className="group">
                        <div className="bg-naaz-green/10 rounded-lg p-4 transition-colors group-hover:bg-naaz-green/20">
                          <h3 className="font-playfair text-naaz-green text-lg mb-2">Islamic Essentials</h3>
                          <p className="text-sm text-gray-600">Prayer mats and other accessories</p>
                        </div>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/about" className={`nav-link ${isActiveRoute('/about')}`}>About Us</Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/blog" className={`nav-link ${isActiveRoute('/blog')}`}>Blog</Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/faq" className={`nav-link ${isActiveRoute('/faq')}`}>FAQ</Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/contact" className={`nav-link ${isActiveRoute('/contact')}`}>Contact</Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Icons for search, wishlist, account, cart */}
          <div className="hidden md:flex items-center space-x-6">
            <button aria-label="Search" className="text-naaz-green hover:text-naaz-gold transition-colors">
              <Search size={20} />
            </button>
            <Link to="/wishlist" aria-label="Wishlist" className="text-naaz-green hover:text-naaz-gold transition-colors">
              <Heart size={20} />
            </Link>
            <Link to="/account" aria-label="Account" className="text-naaz-green hover:text-naaz-gold transition-colors">
              <User size={20} />
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
                <Link to="/books" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Books</Link>
                <Link to="/perfumes" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Perfumes</Link>
                <Link to="/essentials" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Essentials</Link>
                <Link to="/about" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                <Link to="/blog" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                <Link to="/faq" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
                <Link to="/contact" className="py-2 px-4 text-naaz-green hover:text-naaz-gold" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                
                <div className="flex justify-around py-4 border-t border-gray-200 mt-2">
                  <button aria-label="Search" className="text-naaz-green hover:text-naaz-gold transition-colors">
                    <Search size={20} />
                  </button>
                  <Link to="/wishlist" aria-label="Wishlist" className="text-naaz-green hover:text-naaz-gold transition-colors">
                    <Heart size={20} />
                  </Link>
                  <Link to="/account" aria-label="Account" className="text-naaz-green hover:text-naaz-gold transition-colors">
                    <User size={20} />
                  </Link>
                  <Link to="/cart" aria-label="Cart" className="text-naaz-green hover:text-naaz-gold transition-colors">
                    <ShoppingCart size={20} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
