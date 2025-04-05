
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SortOption {
  value: string;
  label: string;
}

interface ProductSortProps {
  options: SortOption[];
  currentSort: string;
  onSortChange: (value: string) => void;
}

const ProductSort = ({ options, currentSort, onSortChange }: ProductSortProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleSelect = (value: string) => {
    onSortChange(value);
    setIsOpen(false);
  };
  
  const currentOption = options.find(option => option.value === currentSort);

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Sort by: {currentOption?.label}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[180px]"
        >
          <ul>
            {options.map(option => (
              <li key={option.value}>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                    currentSort === option.value ? 'bg-gray-100 text-naaz-green font-medium' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default ProductSort;
