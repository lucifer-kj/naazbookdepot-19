
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/common/ProductGrid';
import CategorySidebar from '@/components/catalog/CategorySidebar';
import SearchBar from '@/components/catalog/SearchBar';
import AdvancedFilters from '@/components/catalog/AdvancedFilters';
import ProductSort from '@/components/product/ProductSort';
import { Filter, Grid, List } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const { data: products = [], isLoading } = useProducts(activeCategory || undefined);
  const { data: categories = [] } = useCategories();

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'bestselling':
        return (b.review_count || 0) - (a.review_count || 0);
      default:
        return 0;
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(prev => {
      if (query) {
        prev.set('search', query);
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId === activeCategory ? '' : categoryId);
    setSearchParams(prev => {
      if (categoryId && categoryId !== activeCategory) {
        prev.set('category', categoryId);
      } else {
        prev.delete('category');
      }
      return prev;
    });
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'bestselling', label: 'Best Selling' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const filterOptions = {
    priceRange: { min: 100, max: 5000 },
    languages: ['English', 'Arabic', 'Urdu', 'Bengali', 'Hindi'],
    bindings: ['Hardcover', 'Paperback', 'Leather Bound'],
    yearRange: { min: 2000, max: 2024 },
    availability: ['In Stock', 'Pre-order', 'Out of Stock']
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">
              Islamic Books Collection
            </h1>
            <p className="text-gray-600">
              Discover our extensive collection of authentic Islamic literature
            </p>
          </div>

          <div className="mb-6">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64 space-y-6">
              <CategorySidebar
                categories={categories.map(cat => ({
                  id: parseInt(cat.id),
                  name: cat.name,
                  slug: cat.slug,
                  count: 0
                }))}
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
              />
              
              <AdvancedFilters
                filters={filterOptions}
                activeFilters={{}}
                onFilterChange={() => {}}
                onClearFilters={() => {}}
                isOpen={isFiltersOpen}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <span className="text-gray-600">
                    {sortedProducts.length} books found
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-naaz-green text-white' : 'text-gray-600'}`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-naaz-green text-white' : 'text-gray-600'}`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-naaz-green text-white rounded"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  >
                    <Filter size={16} />
                    Filters
                  </button>
                  <ProductSort
                    options={sortOptions}
                    currentSort={sortBy}
                    onSortChange={setSortBy}
                  />
                </div>
              </div>

              <ProductGrid
                products={sortedProducts}
                loading={isLoading}
                variant="default"
                gridCols={viewMode === 'grid' ? 'auto' : 1}
                showAddToCart={true}
                showWishlist={true}
                showRating={true}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Products;
