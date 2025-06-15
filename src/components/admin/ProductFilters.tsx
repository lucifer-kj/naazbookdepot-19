
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import EnhancedCategorySelect from './EnhancedCategorySelect';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (categoryId: string) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="min-w-48">
            <EnhancedCategorySelect
              value={categoryFilter}
              onChange={onCategoryChange}
              placeholder="All Categories"
            />
          </div>
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
