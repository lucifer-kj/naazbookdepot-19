
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, AlertCircle, Loader2 } from 'lucide-react';
import { useCategoryManager, CategoryOption } from '@/lib/hooks/useCategoryManager';

interface EnhancedCategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const EnhancedCategorySelect: React.FC<EnhancedCategorySelectProps> = ({
  value,
  onChange,
  placeholder = "Select Category",
  className = "",
  error,
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    selectableCategories,
    isLoading,
    error: categoryError,
    getCategoryById,
    getCategoryPath
  } = useCategoryManager();

  const selectedCategory = getCategoryById(value);
  const displayValue = selectedCategory ? getCategoryPath(value) : '';

  const filteredOptions = selectableCategories.filter(category =>
    category.name.toLowerCase().includes(internalSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInternalSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
    setInternalSearch('');
  };

  if (categoryError) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center px-3 py-2 border border-red-300 bg-red-50 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Failed to load categories</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`
          w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required}
        aria-invalid={!!error}
      >
        <div className="flex items-center justify-between">
          <span className={displayValue ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading categories...
              </div>
            ) : (
              displayValue || placeholder
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}

      {isOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-naaz-green"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {internalSearch ? 'No categories found' : 'No selectable categories available'}
              </div>
            ) : (
              <ul role="listbox" className="py-1">
                {filteredOptions.map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(category.id)}
                      className={`
                        w-full text-left px-3 py-2 text-sm hover:bg-naaz-green hover:text-white
                        ${value === category.id ? 'bg-naaz-green text-white' : 'text-gray-900'}
                      `}
                      role="option"
                      aria-selected={value === category.id}
                      style={{ paddingLeft: `${12 + category.level * 16}px` }}
                    >
                      {'—'.repeat(category.level)} {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCategorySelect;
