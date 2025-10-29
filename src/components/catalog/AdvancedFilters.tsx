import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAdvancedSearch } from '@/lib/hooks/useAdvancedSearch';

interface AdvancedFiltersProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  className,
  isOpen = true,
  onToggle
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'price', 'availability'])
  );

  const {
    filters,
    facets,
    hasActiveFilters,
    setPriceRange,
    setCategory,
    setSortBy,
    toggleInStock,
    addTag,
    removeTag,
    clearFilters
  } = useAdvancedSearch();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values[0], values[1]);
  };

  const FilterSection: React.FC<{
    title: string;
    sectionKey: string;
    children: React.ReactNode;
    count?: number;
  }> = ({ title, sectionKey, children, count }) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{title}</span>
            {count !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="default" className="flex items-center space-x-1">
                <span>Category: {filters.category}</span>
                <button
                  onClick={() => setCategory(undefined)}
                  className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.priceRange && (
              <Badge variant="default" className="flex items-center space-x-1">
                <span>₹{filters.priceRange.min} - ₹{filters.priceRange.max}</span>
                <button
                  onClick={() => setPriceRange(0, 10000)}
                  className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.inStock && (
              <Badge variant="default" className="flex items-center space-x-1">
                <span>In Stock</span>
                <button
                  onClick={toggleInStock}
                  className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.tags?.map((tag) => (
              <Badge key={tag} variant="default" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sort By */}
      <FilterSection title="Sort By" sectionKey="sort">
        <Select value={filters.sortBy || 'relevance'} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A to Z</SelectItem>
            <SelectItem value="name_desc">Name: Z to A</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Categories */}
      <FilterSection 
        title="Categories" 
        sectionKey="category"
        count={facets?.categories?.length}
      >
        <div className="space-y-2">
          {facets?.categories?.map((category) => (
            <div key={category.name} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.name}`}
                checked={filters.category === category.name}
                onCheckedChange={(checked) => {
                  setCategory(checked ? category.name : undefined);
                }}
              />
              <Label
                htmlFor={`category-${category.name}`}
                className="flex-1 text-sm cursor-pointer flex items-center justify-between"
              >
                <span>{category.name}</span>
                <span className="text-xs text-gray-500">({category.count})</span>
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" sectionKey="price">
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={[filters.priceRange?.min || 0, filters.priceRange?.max || 10000]}
              onValueChange={handlePriceRangeChange}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₹{filters.priceRange?.min || 0}</span>
            <span>₹{filters.priceRange?.max || 10000}</span>
          </div>
          
          {/* Price Range Facets */}
          {facets?.priceRanges && facets.priceRanges.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {facets.priceRanges.map((range) => (
                <button
                  key={range.range}
                  onClick={() => {
                    const [min, max] = range.range.split('-').map(Number);
                    setPriceRange(min, max);
                  }}
                  className="w-full text-left text-sm hover:bg-gray-50 p-2 rounded flex items-center justify-between"
                >
                  <span>{range.range}</span>
                  <span className="text-xs text-gray-500">({range.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" sectionKey="availability">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock || false}
              onCheckedChange={toggleInStock}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>
        </div>
      </FilterSection>

      {/* Tags */}
      {facets?.tags && facets.tags.length > 0 && (
        <FilterSection 
          title="Tags" 
          sectionKey="tags"
          count={facets.tags.length}
        >
          <div className="space-y-2">
            {facets.tags.map((tag) => (
              <div key={tag.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.name}`}
                  checked={filters.tags?.includes(tag.name) || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addTag(tag.name);
                    } else {
                      removeTag(tag.name);
                    }
                  }}
                />
                <Label
                  htmlFor={`tag-${tag.name}`}
                  className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-gray-500">({tag.count})</span>
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating Filter (if we have ratings) */}
      <FilterSection title="Customer Rating" sectionKey="rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className="w-full text-left text-sm hover:bg-gray-50 p-2 rounded flex items-center space-x-2"
            >
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-3 w-3",
                      index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default AdvancedFilters;