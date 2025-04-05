
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface FilterOption {
  id: string;
  name: string;
  options: {
    value: string;
    label: string;
    count?: number;
  }[];
}

interface ProductFiltersProps {
  filters: FilterOption[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, value: string, isChecked: boolean) => void;
  onClearFilters: () => void;
}

const ProductFilters = ({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  onClearFilters 
}: ProductFiltersProps) => {
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>(
    Object.fromEntries(filters.map(filter => [filter.id, true]))
  );

  const anyFiltersActive = Object.values(activeFilters).some(values => values.length > 0);

  const toggleFilter = (filterId: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  const handleFilterChange = (filterId: string, value: string, e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(filterId, value, e.target.checked);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-playfair font-bold text-naaz-green">Filters</h2>
        {anyFiltersActive && (
          <Button
            variant="ghost"
            className="text-sm text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center gap-1 px-2 py-1"
            onClick={onClearFilters}
          >
            <X size={16} />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id} className="border-b border-gray-200 pb-4">
            <button
              className="flex justify-between items-center w-full py-2 text-left font-medium"
              onClick={() => toggleFilter(filter.id)}
            >
              {filter.name}
              {expandedFilters[filter.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <AnimatePresence>
              {expandedFilters[filter.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-2">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:text-naaz-gold transition-colors">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-naaz-green focus:ring-naaz-green"
                          checked={activeFilters[filter.id]?.includes(option.value) || false}
                          onChange={(e) => handleFilterChange(filter.id, option.value, e)}
                        />
                        <span className="text-sm">{option.label}</span>
                        {option.count !== undefined && (
                          <span className="text-xs text-gray-500">({option.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
