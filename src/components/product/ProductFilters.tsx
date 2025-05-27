
import React from 'react';

export interface FilterOption {
  id: string;
  name: string;
  options: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
}

interface ProductFiltersProps {
  filters: FilterOption[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, value: string, isChecked: boolean) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-playfair font-semibold text-naaz-green">Filters</h3>
        <button 
          onClick={onClearFilters}
          className="text-sm text-naaz-gold hover:text-naaz-gold/80"
        >
          Clear All
        </button>
      </div>
      
      {filters.map((filter) => (
        <div key={filter.id} className="space-y-3">
          <h4 className="font-medium text-naaz-green">{filter.name}</h4>
          <div className="space-y-2">
            {filter.options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters[filter.id]?.includes(option.value) || false}
                  onChange={(e) => onFilterChange(filter.id, option.value, e.target.checked)}
                  className="rounded border-gray-300 text-naaz-green focus:ring-naaz-green"
                />
                <span className="text-sm text-gray-700">
                  {option.label}
                  {option.count && <span className="text-gray-500"> ({option.count})</span>}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductFilters;
