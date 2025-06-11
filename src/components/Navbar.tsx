import React, { useState } from 'react'; // Removed useRef, useEffect
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Removed Search, ShoppingCart, User, LogOut, ChevronDown
// useAuth and LoginModal are now primarily used within NavActionButtons
// import { useAuth } from '@/lib/context/AuthContext';
// import LoginModal from '@/components/auth/LoginModal';
import DesktopNavLinks from './navbar/DesktopNavLinks';
import NavActionButtons from './navbar/NavActionButtons';
import MobileNavMenu from './navbar/MobileNavMenu';

const Navbar = ({ onAccountClick }: { onAccountClick?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // States like isUserDropdownOpen, isProductsDropdownOpen, isSearchExpanded, showLoginModal
  // and refs like productsDropdownRef, productsButtonRef have been moved to sub-components.
  // useEffect for products dropdown is also moved.
  // handleSignOut logic is moved to NavActionButtons.

  // Product categories data might be fetched or defined globally in a real app.
  // For this refactor, it's kept here to be passed to DesktopNavLinks.
  // If MobileNavMenu also needs it, it could be passed there too.
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

  // profilePic calculation is now within NavActionButtons if needed there, or passed if still relevant here.
  // For this refactor, let's assume NavActionButtons handles its own profile picture logic.

  return (
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

          <DesktopNavLinks productCategories={productCategories} />

          {/* Action Buttons & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2"> {/* Reduced space for mobile toggle proximity */}
            <NavActionButtons onAccountClick={onAccountClick} />

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="lg:hidden text-naaz-green p-2" // Added padding for easier touch
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <MobileNavMenu isOpen={isMenuOpen} />
        {/* productCategories could be passed to MobileNavMenu if it needs them */}

      </nav>
    </header>
    // LoginModal is now rendered within NavActionButtons
  );
};

export default Navbar;
