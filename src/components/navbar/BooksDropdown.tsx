
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface BooksDropdownProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const BooksDropdown: React.FC<BooksDropdownProps> = ({ isOpen, onMouseEnter, onMouseLeave }) => {
  const bookCategories = [
    { name: 'Quran & Tafseer', path: '/books?category=quran', icon: '📖' },
    { name: 'Hadith Collections', path: '/books?category=hadith', icon: '📚' },
    { name: 'Islamic Jurisprudence', path: '/books?category=fiqh', icon: '⚖️' },
    { name: 'Islamic History', path: '/books?category=history', icon: '🏛️' },
    { name: 'Children\'s Books', path: '/books?category=children', icon: '👶' },
    { name: 'Urdu Literature', path: '/books?category=urdu', icon: '🖋️' }
  ];

  return (
    <div 
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors font-medium py-2 border-b-2 border-transparent hover:border-naaz-gold">
        Books
        <ChevronDown size={16} className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 animate-slide-down">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-naaz-green">Browse Categories</h3>
          </div>
          {bookCategories.map((category, index) => (
            <Link
              key={index}
              to={category.path}
              className="flex items-center px-4 py-3 hover:bg-naaz-cream/50 transition-colors group"
            >
              <span className="text-lg mr-3 group-hover:scale-110 transition-transform">{category.icon}</span>
              <span className="text-gray-700 group-hover:text-naaz-green transition-colors">{category.name}</span>
            </Link>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <Link to="/books" className="block px-4 py-2 text-naaz-gold hover:text-naaz-green font-medium">
              View All Books →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksDropdown;
