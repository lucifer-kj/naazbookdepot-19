import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load components for better performance
const LazyProductGrid = lazy(() => import('./ProductGrid'));
const LazyAdvancedFilters = lazy(() => import('./AdvancedFilters'));

interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  category?: string;
  author?: string;
  stock_quantity?: number;
  description?: string;
}

interface ProductDisplayProps {
  products: Product[];
  loading?: boolean;
  error?: string;
  onProductClick?: (product: Product) => void;
  showFilters?: boolean;
  onFiltersChange?: (filters: any) => void;
}

// Loading skeleton component
const ProductSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="text-center py-16">
    <div className="text-red-500 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-naaz-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="text-gray-400 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
  </div>
);

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products = [],
  loading = false,
  error,
  onProductClick,
  showFilters = false,
  onFiltersChange
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center mb-8">
            <Loader2 className="w-8 h-8 animate-spin text-naaz-green mr-3" />
            <span className="text-lg text-gray-600">Loading products...</span>
          </div>
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay error={error} />
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        {showFilters && (
          <div className="mb-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-naaz-green" />
              </div>
            }>
              <LazyAdvancedFilters onFiltersChange={onFiltersChange} />
            </Suspense>
          </div>
        )}

        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        <Suspense fallback={<ProductSkeleton />}>
          <LazyProductGrid 
            products={products} 
            onProductClick={onProductClick}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default ProductDisplay;