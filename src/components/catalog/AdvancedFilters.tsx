
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterOptions {
  priceRange: { min: number; max: number };
  languages: string[];
  bindings: string[];
  yearRange: { min: number; max: number };
  availability: string[];
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  activeFilters: Record<string, any>;
  onFilterChange: (filterType: string, value: any) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onToggle
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <h3 className="text-lg font-playfair font-semibold text-naaz-green">
          Advanced Filters
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearFilters();
            }}
            className="text-sm text-naaz-gold hover:text-naaz-gold/80"
          >
            Clear All
          </button>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t space-y-6">
          {/* Price Range */}
          <div>
            <h4 className="font-medium text-naaz-green mb-3">Price Range</h4>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={activeFilters.priceMin || ''}
                onChange={(e) => onFilterChange('priceMin', e.target.value)}
                className="w-20 px-2 py-1 border rounded"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={activeFilters.priceMax || ''}
                onChange={(e) => onFilterChange('priceMax', e.target.value)}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
          </div>

          {/* Language */}
          <div>
            <h4 className="font-medium text-naaz-green mb-3">Language</h4>
            <div className="space-y-2">
              {filters.languages.map(language => (
                <label key={language} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.languages?.includes(language) || false}
                    onChange={(e) => {
                      const current = activeFilters.languages || [];
                      const updated = e.target.checked
                        ? [...current, language]
                        : current.filter((l: string) => l !== language);
                      onFilterChange('languages', updated);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Binding Type */}
          <div>
            <h4 className="font-medium text-naaz-green mb-3">Binding</h4>
            <div className="space-y-2">
              {filters.bindings.map(binding => (
                <label key={binding} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.bindings?.includes(binding) || false}
                    onChange={(e) => {
                      const current = activeFilters.bindings || [];
                      const updated = e.target.checked
                        ? [...current, binding]
                        : current.filter((b: string) => b !== binding);
                      onFilterChange('bindings', updated);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{binding}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="font-medium text-naaz-green mb-3">Availability</h4>
            <div className="space-y-2">
              {filters.availability.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.availability?.includes(status) || false}
                    onChange={(e) => {
                      const current = activeFilters.availability || [];
                      const updated = e.target.checked
                        ? [...current, status]
                        : current.filter((s: string) => s !== status);
                      onFilterChange('availability', updated);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
