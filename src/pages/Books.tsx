import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Filter, Grid, List } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters, { FilterOption } from '../components/product/ProductFilters';
import ProductSort, { SortOption } from '../components/product/ProductSort';
import { Product } from '../components/product/ProductDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import CategorySidebar, { Category } from '../components/catalog/CategorySidebar';
import SearchBar from '../components/catalog/SearchBar';
import AdvancedFilters, { FilterOptions } from '../components/catalog/AdvancedFilters';
import ProductCard from '../components/catalog/ProductCard';

// Mock book data
const books: Product[] = [
  {
    id: 1,
    name: 'The Noble Quran',
    price: '1200',
    stock_status: 'instock',
    average_rating: '4.5',
    rating_count: 24,
    categories: [
      { id: 1, name: 'quran', slug: 'quran' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'The Noble Quran' }
    ],
    description: 'The Noble Quran with translation and commentary.',
    quantity_in_stock: 15
  },
  {
    id: 2,
    name: 'Sahih Al-Bukhari',
    price: '1450',
    stock_status: 'instock',
    average_rating: '5',
    rating_count: 18,
    categories: [
      { id: 2, name: 'hadith', slug: 'hadith' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Sahih Al-Bukhari' }
    ],
    description: 'Complete collection of authentic Hadith.',
    quantity_in_stock: 12
  },
  {
    id: 3,
    name: 'Riyad-us-Saliheen',
    price: '950',
    regular_price: '1100',
    sale_price: '950',
    stock_status: 'instock',
    average_rating: '4.8',
    rating_count: 15,
    categories: [
      { id: 2, name: 'hadith', slug: 'hadith' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Riyad-us-Saliheen' }
    ],
    description: 'A collection of authentic hadith covering various aspects of life.',
    quantity_in_stock: 8
  },
  {
    id: 4,
    name: 'The Sealed Nectar',
    price: '850',
    stock_status: 'instock',
    average_rating: '4.7',
    rating_count: 22,
    categories: [
      { id: 4, name: 'seerah', slug: 'seerah' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'The Sealed Nectar' }
    ],
    description: 'Biography of Prophet Muhammad (PBUH).',
    quantity_in_stock: 20
  },
  {
    id: 5,
    name: 'Tafsir Ibn Kathir',
    price: '1500',
    stock_status: 'instock',
    average_rating: '4.9',
    rating_count: 19,
    categories: [
      { id: 1, name: 'quran', slug: 'quran' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Tafsir Ibn Kathir' }
    ],
    description: 'Comprehensive Tafsir of the Quran.',
    quantity_in_stock: 10
  },
  {
    id: 6,
    name: 'Fiqh Made Easy',
    price: '750',
    stock_status: 'outofstock',
    average_rating: '4.6',
    rating_count: 12,
    categories: [
      { id: 3, name: 'fiqh', slug: 'fiqh' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Fiqh Made Easy' }
    ],
    description: 'A beginner friendly guide to Islamic jurisprudence.',
    quantity_in_stock: 0
  },
  {
    id: 7,
    name: 'Stories of the Prophets',
    price: '900',
    stock_status: 'instock',
    average_rating: '4.5',
    rating_count: 16,
    categories: [
      { id: 5, name: 'history', slug: 'history' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Stories of the Prophets' }
    ],
    description: 'Stories of all the Prophets mentioned in the Quran.',
    quantity_in_stock: 14
  },
  {
    id: 8,
    name: 'Islamic Way of Life',
    price: '650',
    stock_status: 'instock',
    average_rating: '4.4',
    rating_count: 14,
    categories: [
      { id: 6, name: 'spirituality', slug: 'spirituality' }
    ],
    images: [
      { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Islamic Way of Life' }
    ],
    description: 'Guide to living according to Islamic principles.',
    quantity_in_stock: 25
  }
];

// Catalog-style categories and filters
const categories: Category[] = [
  { id: 1, name: 'Quran & Tafsir', slug: 'quran-tafsir', count: 45, subcategories: [
    { id: 11, name: 'Quran Translation', slug: 'quran-translation', count: 25 },
    { id: 12, name: 'Tafsir Books', slug: 'tafsir', count: 20 }
  ]},
  { id: 2, name: 'Hadith', slug: 'hadith', count: 32, subcategories: [
    { id: 21, name: 'Sahih Bukhari', slug: 'bukhari', count: 8 },
    { id: 22, name: 'Sahih Muslim', slug: 'muslim', count: 6 },
    { id: 23, name: 'Other Collections', slug: 'other-hadith', count: 18 }
  ]},
  { id: 3, name: 'Fiqh (Jurisprudence)', slug: 'fiqh', count: 28 },
  { id: 4, name: 'Seerah (Biography)', slug: 'seerah', count: 22 },
  { id: 5, name: 'Islamic History', slug: 'history', count: 35 },
  { id: 6, name: 'Spirituality & Sufism', slug: 'spirituality', count: 19 },
  { id: 7, name: 'Arabic Language', slug: 'arabic', count: 15 },
  { id: 8, name: "Children's Islamic Books", slug: 'children', count: 24 }
];

const filterOptions: FilterOptions = {
  priceRange: { min: 100, max: 5000 },
  languages: ['English', 'Arabic', 'Urdu', 'Bengali', 'Hindi'],
  bindings: ['Hardcover', 'Paperback', 'Leather Bound'],
  yearRange: { min: 2000, max: 2024 },
  availability: ['In Stock', 'Pre-order', 'Out of Stock']
};

const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'rating', label: 'Highest Rated' }
];

const Books = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(books);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter books based on active filters and search query
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let result = [...books];

      // Filter by search query
      if (searchQuery) {
        result = result.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (activeCategory) {
        result = result.filter(product =>
          product.categories.some(cat => cat.slug === activeCategory)
        );
      }

      // Filter by price range
      if (activeFilters.priceMin) {
        result = result.filter(product => parseFloat(product.price) >= parseFloat(activeFilters.priceMin));
      }
      if (activeFilters.priceMax) {
        result = result.filter(product => parseFloat(product.price) <= parseFloat(activeFilters.priceMax));
      }

      // Filter by language
      if (activeFilters.languages?.length > 0) {
        result = result.filter(product =>
          activeFilters.languages.some((lang: string) => 
            product.language?.includes(lang)
          )
        );
      }

      // Filter by binding
      if (activeFilters.bindings?.length > 0) {
        result = result.filter(product =>
          activeFilters.bindings.includes(product.binding)
        );
      }

      // Filter by availability
      if (activeFilters.availability?.length > 0) {
        result = result.filter(product => {
          const status = product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock';
          return activeFilters.availability.includes(status);
        });
      }

      // Sort results
      result = sortProducts(result, sortBy);

      setFilteredProducts(result);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, activeFilters, sortBy]);

  // Sort books based on selected sort option
  const sortProducts = (productsToSort: Product[], sortOption: string) => {
    const sorted = [...productsToSort];
    
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'rating':
        return sorted.sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));
      case 'newest':
        return sorted.sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0));
      case 'bestselling':
        return sorted.sort((a, b) => b.rating_count - a.rating_count);
      case 'relevance':
      default:
        return sorted;
    }
  };

  // Handle search
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

  // Handle category selection
  const handleCategorySelect = (categorySlug: string) => {
    setActiveCategory(categorySlug === activeCategory ? '' : categorySlug);
    setSearchParams(prev => {
      if (categorySlug && categorySlug !== activeCategory) {
        prev.set('category', categorySlug);
      } else {
        prev.delete('category');
      }
      return prev;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setActiveCategory('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">
              Islamic Book Catalog
            </h1>
            <p className="text-gray-600">
              Discover our extensive collection of authentic Islamic literature
            </p>
          </div>
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 space-y-6">
              <CategorySidebar
                categories={categories}
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
              />
              <AdvancedFilters
                filters={filterOptions}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                isOpen={isFiltersOpen}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              />
            </div>
            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <span className="text-gray-600">
                    {filteredProducts.length} books found
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
              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="h-64 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(product) => console.log('Quick view:', product)}
                      onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">
                    No books found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-naaz-green text-white px-6 py-2 rounded hover:bg-naaz-green/90"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Books;
