
import React, { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useCartContext } from '@/lib/context/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { cart } = useCartContext();

  // Check if route is active
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Handle scroll for sticky effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, redirect to search results page with query
    console.log('Searching for:', searchQuery);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-naaz-cream/95 backdrop-blur-sm shadow-md" : "bg-naaz-cream"
    )}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.span 
              className="text-naaz-green font-playfair text-2xl font-bold"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Naaz Book Depot
            </motion.span>
          </Link>

          {/* Mobile menu button */}
          <motion.button 
            className="md:hidden flex items-center text-naaz-green"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="space-x-6">
                <NavigationMenuItem>
                  <Link 
                    to="/" 
                    className={`nav-link ${isActiveRoute('/') ? 'active-nav-link' : ''}`}
                  >
                    Home
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                    Shop
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-naaz-cream/95 backdrop-blur-sm p-4 rounded-md shadow-lg border border-gray-200">
                    <div className="grid grid-cols-3 gap-8 w-[600px]">
                      <Link to="/books" className="group">
                        <div className="bg-naaz-green/10 rounded-lg p-4 transition-all duration-300 group-hover:bg-naaz-green/20 transform group-hover:scale-105">
                          <h3 className="font-playfair text-naaz-green text-lg mb-2">Islamic Books</h3>
                          <p className="text-sm text-gray-600">Discover our collection of Islamic literature</p>
                        </div>
                      </Link>
                      <Link to="/perfumes" className="group">
                        <div className="bg-naaz-green/10 rounded-lg p-4 transition-all duration-300 group-hover:bg-naaz-green/20 transform group-hover:scale-105">
                          <h3 className="font-playfair text-naaz-green text-lg mb-2">Non-Alcoholic Perfumes</h3>
                          <p className="text-sm text-gray-600">Premium attars and fragrances</p>
                        </div>
                      </Link>
                      <Link to="/essentials" className="group">
                        <div className="bg-naaz-green/10 rounded-lg p-4 transition-all duration-300 group-hover:bg-naaz-green/20 transform group-hover:scale-105">
                          <h3 className="font-playfair text-naaz-green text-lg mb-2">Islamic Essentials</h3>
                          <p className="text-sm text-gray-600">Prayer mats and other accessories</p>
                        </div>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    to="/about" 
                    className={`nav-link ${isActiveRoute('/about') ? 'active-nav-link' : ''}`}
                  >
                    About Us
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    to="/blog" 
                    className={`nav-link ${isActiveRoute('/blog') ? 'active-nav-link' : ''}`}
                  >
                    Blog
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    to="/faq" 
                    className={`nav-link ${isActiveRoute('/faq') ? 'active-nav-link' : ''}`}
                  >
                    FAQ
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    to="/contact" 
                    className={`nav-link ${isActiveRoute('/contact') ? 'active-nav-link' : ''}`}
                  >
                    Contact
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Icons for search, wishlist, account, cart */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.button 
              aria-label="Search" 
              className="text-naaz-green hover:text-naaz-gold transition-colors"
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
            >
              <Search size={20} />
            </motion.button>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>
              <Link 
                to="/wishlist" 
                aria-label="Wishlist" 
                className="text-naaz-green hover:text-naaz-gold transition-colors"
              >
                <Heart size={20} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>
              <Link 
                to="/account" 
                aria-label="Account" 
                className="text-naaz-green hover:text-naaz-gold transition-colors"
              >
                <User size={20} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="relative">
              <Link 
                to="/cart" 
                aria-label="Cart" 
                className="text-naaz-green hover:text-naaz-gold transition-colors"
              >
                <ShoppingCart size={20} />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-naaz-gold text-naaz-green text-xs font-bold">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden absolute top-16 left-0 right-0 bg-naaz-cream z-50 border-b border-gray-200 shadow-lg"
              >
                <div className="flex flex-col p-4">
                  <Link to="/" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                  <Link to="/books" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Books</Link>
                  <Link to="/perfumes" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Perfumes</Link>
                  <Link to="/essentials" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Essentials</Link>
                  <Link to="/about" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                  <Link to="/blog" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                  <Link to="/faq" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
                  <Link to="/contact" className="py-2 px-4 text-naaz-green hover:text-naaz-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                  
                  <div className="flex justify-around py-4 border-t border-gray-200 mt-2">
                    <motion.button 
                      aria-label="Search" 
                      className="text-naaz-green hover:text-naaz-gold transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSearchOpen(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Search size={20} />
                    </motion.button>
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Link to="/wishlist" aria-label="Wishlist" className="text-naaz-green hover:text-naaz-gold transition-colors">
                        <Heart size={20} />
                      </Link>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Link to="/account" aria-label="Account" className="text-naaz-green hover:text-naaz-gold transition-colors">
                        <User size={20} />
                      </Link>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.9 }} className="relative">
                      <Link to="/cart" aria-label="Cart" className="text-naaz-green hover:text-naaz-gold transition-colors">
                        <ShoppingCart size={20} />
                        {cart.totalItems > 0 && (
                          <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-naaz-gold text-naaz-green text-xs font-bold">
                            {cart.totalItems}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div 
              className="w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-xl mx-4"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-4 focus:outline-none text-lg"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="px-6 py-4 bg-naaz-green text-white hover:bg-naaz-gold transition-colors"
                >
                  <Search size={20} />
                </button>
                <button 
                  type="button" 
                  className="px-6 py-4 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={20} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
