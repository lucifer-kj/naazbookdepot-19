import React, { useState } from 'react';
import { Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAdvancedSearch } from '@/lib/hooks/useAdvancedSearch';
import { ProductGridSkeleton, SearchResultsSkeleton } from '@/components/ui/loading-skeleton';
import { StaggeredList, LoadingStateTransition } from '@/components/ui/transitions';
import ProductCard from '@/components/catalog/ProductCard';
import AdvancedFilters from '@/components/catalog/AdvancedFilters';
import EnhancedSearchBar from '@/components/catalog/EnhancedSearchBar';

interface SearchResultsProps {
  className?: string;
  showSearchBar?: boolean;
  defaultViewMode?: 'grid' | 'list';
}

const SearchResults: React.FC<SearchResultsProps> = ({
  className,
  showSearchBar = true,
  defaultViewMode = 'grid'
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultViewMode);
  const [showFilters, setShowFilters] = useState(false);

  const {
    query,
    products,
    totalResults,
    isSearching,
    hasActiveFilters,
    currentPage,
    totalPages,
    setPage,
    clearSearch
  } = useAdvancedSearch();

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    // Scroll to top of results
    document.getElementById('search-results-top')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          className="mr-2"
        >
          Previous
        </Button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          className="ml-2"
        >
          Next
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-1 mt-8">
        {pages}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {query ? `No results found for "${query}"` : 'Start searching'}
      </h3>
      <p className="text-gray-600 mb-6">
        {query 
          ? 'Try adjusting your search terms or filters'
          : 'Enter a search term to find products'
        }
      </p>
      {query && (
        <Button onClick={clearSearch} variant="outline">
          Clear Search
        </Button>
      )}
    </div>
  );

  const renderProductGrid = () => {
    if (viewMode === 'list') {
      return (
        <div className="space-y-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-naaz-green">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-bold text-naaz-gold">
                      ₹{product.price}
                    </span>
                    <Button size="sm">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <StaggeredList
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        staggerDelay={0.05}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </StaggeredList>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Bar */}
      {showSearchBar && (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <EnhancedSearchBar
              onFiltersToggle={handleToggleFilters}
              showFiltersButton={true}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:w-80 overflow-hidden"
            >
              <div className="sticky top-4">
                <AdvancedFilters
                  isOpen={showFilters}
                  onToggle={handleToggleFilters}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Header */}
          <div id="search-results-top" className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div>
                {query && (
                  <h2 className="text-xl font-semibold text-gray-900">
                    Search results for "{query}"
                  </h2>
                )}
                <p className="text-sm text-gray-600">
                  {isSearching ? 'Searching...' : `${totalResults} products found`}
                </p>
              </div>
              
              {hasActiveFilters && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Filter className="h-3 w-3" />
                  <span>Filtered</span>
                </Badge>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={handleToggleFilters}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters
              </Button>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <LoadingStateTransition
            isLoading={isSearching}
            loadingComponent={<ProductGridSkeleton count={8} />}
          >
            {products.length > 0 ? (
              <>
                {renderProductGrid()}
                {renderPagination()}
              </>
            ) : (
              renderEmptyState()
            )}
          </LoadingStateTransition>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
