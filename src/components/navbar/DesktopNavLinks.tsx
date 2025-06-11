import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface ProductCategory {
  name: string;
  path: string;
  available: boolean;
}

interface DesktopNavLinksProps {
  productCategories: ProductCategory[];
}

const DesktopNavLinks: React.FC<DesktopNavLinksProps> = ({ productCategories }) => {
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isProductsDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target as Node) &&
        productsButtonRef.current &&
        !productsButtonRef.current.contains(event.target as Node)
      ) {
        setIsProductsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProductsDropdownOpen]);

  return (
    <div className="hidden lg:flex items-center space-x-8">
      <Link to="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
        Home
      </Link>

      <div className="relative">
        <button
          ref={productsButtonRef}
          className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors font-medium"
          type="button"
          onClick={() => setIsProductsDropdownOpen((v) => !v)}
        >
          Products
          <ChevronDown size={16} className={`ml-1 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isProductsDropdownOpen && (
          <div
            ref={productsDropdownRef}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 animate-slide-down"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-naaz-green">Browse Products</h3>
            </div>
            {productCategories.map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className={`flex items-center justify-between px-4 py-3 transition-colors ${
                  category.available
                    ? 'hover:bg-naaz-cream/50 text-gray-700 hover:text-naaz-green'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => setIsProductsDropdownOpen(false)}
                tabIndex={category.available ? 0 : -1}
                aria-disabled={!category.available}
              >
                <span>{category.name}</span>
                {!category.available && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link to="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
        About
      </Link>
      <Link to="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
        Contact
      </Link>
    </div>
  );
};

export default DesktopNavLinks;
