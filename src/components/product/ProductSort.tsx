
import React from 'react';

export interface SortOption {
  value: string;
  label: string;
}

interface ProductSortProps {
  options: SortOption[];
  currentSort: string;
  onSortChange: (value: string) => void;
}

const ProductSort: React.FC<ProductSortProps> = ({ options, currentSort, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-naaz-green">
        Sort by:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-naaz-green"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSort;
