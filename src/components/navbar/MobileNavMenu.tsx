import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface MobileNavMenuProps {
  isOpen: boolean;
  // onClose is not needed if Navbar controls isOpen and this is just for display
  // productCategories: Array<{ name: string; path: string; available: boolean; }>; // If categories are shown in mobile
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 animate-slide-down">
      <div className="flex flex-col space-y-4">
        {/* Mobile Search */}
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search Islamic books..."
            className="flex-1 outline-none text-sm"
          />
        </div>

        {/* Mobile Menu Links */}
        <Link to="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 block">
          Home
        </Link>
        {/*
          Consider how to display product categories in mobile.
          A simple link to a general products page might be best,
          or a collapsible section.
        */}
        <Link to="/books" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 block">
          Products
        </Link>
        {/* Example for categories if needed:
        {productCategories.map(category => (
          <Link key={category.name} to={category.path} className="pl-4 text-naaz-green ...">
            {category.name}
          </Link>
        ))}
        */}
        <Link to="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 block">
          About
        </Link>
        <Link to="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 block">
          Contact
        </Link>
      </div>
    </div>
  );
};

export default MobileNavMenu;
