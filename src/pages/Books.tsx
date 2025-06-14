import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, X } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters, { FilterOption } from '../components/product/ProductFilters';
import ProductSort, { SortOption } from '../components/product/ProductSort';
import type { ProductWithCategory } from '@/lib/hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Mock book data with correct types
const books: ProductWithCategory[] = [
  {
    id: '1',
    name: 'The Noble Quran',
    price: 1200,
    stock: 15,
    average_rating: 4.5,
    review_count: 24,
    categories: { id: '1', name: 'Quran & Tafsir' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'The Noble Quran with translation and commentary.',
    category_id: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sahih Al-Bukhari',
    price: 1450,
    stock: 12,
    average_rating: 5,
    review_count: 18,
    categories: { id: '2', name: 'Hadith' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'Complete collection of authentic Hadith.',
    category_id: '2',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Riyad-us-Saliheen',
    price: 950,
    stock: 8,
    average_rating: 4.8,
    review_count: 15,
    categories: { id: '2', name: 'Hadith' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'A collection of authentic hadith covering various aspects of life.',
    category_id: '2',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'The Sealed Nectar',
    price: 850,
    stock: 20,
    average_rating: 4.7,
    review_count: 22,
    categories: { id: '4', name: 'Seerah' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'Biography of Prophet Muhammad (PBUH).',
    category_id: '4',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Tafsir Ibn Kathir',
    price: 1500,
    stock: 10,
    average_rating: 4.9,
    review_count: 19,
    categories: { id: '1', name: 'Quran & Tafsir' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'Comprehensive Tafsir of the Quran.',
    category_id: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Fiqh Made Easy',
    price: 750,
    stock: 0,
    average_rating: 4.6,
    review_count: 12,
    categories: { id: '3', name: 'Fiqh' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'A beginner friendly guide to Islamic jurisprudence.',
    category_id: '3',
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Stories of the Prophets',
    price: 900,
    stock: 14,
    average_rating: 4.5,
    review_count: 16,
    categories: { id: '5', name: 'History' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'Stories of all the Prophets mentioned in the Quran.',
    category_id: '5',
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Islamic Way of Life',
    price: 650,
    stock: 25,
    average_rating: 4.4,
    review_count: 14,
    categories: { id: '6', name: 'Spirituality' },
    images: ['/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'],
    description: 'Guide to living according to Islamic principles.',
    category_id: '6',
    created_at: new Date().toISOString()
  }
];

// Filter options
const filterOptions: FilterOption[] = [
  {
    id: 'category',
    name: 'Category',
    options: [
      { value: 'Quran & Tafsir', label: 'Quran & Tafsir', count: 2 },
      { value: 'Hadith', label: 'Hadith', count: 2 },
      { value: 'Fiqh', label: 'Fiqh', count: 1 },
      { value: 'Seerah', label: 'Seerah & Biography', count: 1 },
      { value: 'History', label: 'Islamic History', count: 1 },
      { value: 'Spirituality', label: 'Spirituality', count: 1 }
    ]
  },
  {
    id: 'price',
    name: 'Price',
    options: [
      { value: 'under-800', label: 'Under ₹800' },
      { value: '800-1000', label: '₹800 - ₹1000' },
      { value: '1000-1500', label: '₹1000 - ₹1500' },
      { value: 'over-1500', label: 'Over ₹1500' }
    ]
  },
  {
    id: 'rating',
    name: 'Rating',
    options: [
      { value: '5', label: '5 Stars' },
      { value: '4', label: '4 Stars & Up' },
      { value: '3', label: '3 Stars & Up' }
    ]
  },
  {
    id: 'availability',
    name: 'Availability',
    options: [
      { value: 'instock', label: 'In Stock' },
      { value: 'outofstock', label: 'Out of Stock' }
    ]
  }
];

// Sort options
const sortOptions: SortOption[] = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' }
];

const Books = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    category: [],
    price: [],
    rating: [],
    availability: []
  });
  const [currentSort, setCurrentSort] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter books based on active filters and search query
  useEffect(() => {
    // Simulate loading
    setLoading(true);

    const timer = setTimeout(() => {
      let result = [...books];

      // Filter by search query
      if (searchQuery) {
        result = result.filter(book => 
          book.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (activeFilters.category.length > 0) {
        result = result.filter(book => 
          book.categories && activeFilters.category.includes(book.categories.name)
        );
      }

      // Filter by price range
      if (activeFilters.price.length > 0) {
        result = result.filter(book => {
          const price = book.price;
          return activeFilters.price.some(range => {
            switch (range) {
              case 'under-800': return price < 800;
              case '800-1000': return price >= 800 && price <= 1000;
              case '1000-1500': return price > 1000 && price <= 1500;
              case 'over-1500': return price > 1500;
              default: return true;
            }
          });
        });
      }

      // Filter by rating
      if (activeFilters.rating.length > 0) {
        result = result.filter(book => {
          const rating = book.average_rating || 0;
          return activeFilters.rating.some(r => rating >= parseFloat(r));
        });
      }

      // Filter by availability
      if (activeFilters.availability.length > 0) {
        result = result.filter(book => {
          const status = book.stock > 0 ? 'instock' : 'outofstock';
          return activeFilters.availability.includes(status);
        });
      }

      // Sort results
      result = sortBooks(result, currentSort);

      setFilteredBooks(result);
      setLoading(false);
    }, 500); // simulate network delay

    return () => clearTimeout(timer);
  }, [activeFilters, searchQuery, currentSort]);

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: string, isChecked: boolean) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (isChecked) {
        newFilters[filterId] = [...(prev[filterId] || []), value];
      } else {
        newFilters[filterId] = (prev[filterId] || []).filter(v => v !== value);
      }
      return newFilters;
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters({
      category: [],
      price: [],
      rating: [],
      availability: []
    });
    setSearchQuery('');
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setCurrentSort(value);
  };

  // Sort books based on selected sort option
  const sortBooks = (booksToSort: ProductWithCategory[], sortOption: string) => {
    const sorted = [...booksToSort];
    
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      case 'newest':
        // In a real app, we would sort by date added
        return sorted.reverse();
      case 'popularity':
      default:
        return sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Banner */}
        <motion.div 
          className="relative h-64 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Background Image and Gradient */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/lovable-uploads/books-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.7)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-naaz-green/80 to-transparent" />
          <motion.div 
            className="relative container mx-auto h-full flex flex-col justify-center px-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">Islamic Books</h1>
            <p className="text-white/90 max-w-xl text-lg mb-6">
              Discover our extensive collection of authentic Islamic literature curated for spiritual growth and enlightenment.
            </p>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="container mx-auto py-12 px-4">
          {/* Search and Filter */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center mb-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
              <input 
                type="text" 
                placeholder="Search books..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-naaz-green"
              />
              <Search size={18} className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500" />
              {searchQuery && (
                <button 
                  className="absolute top-1/2 transform -translate-y-1/2 right-12 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline" 
                className="flex items-center border-naaz-green text-naaz-green hover:bg-naaz-green/10 transition-colors md:hidden"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={18} className="mr-2" />
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <div className="hidden md:block">
                <ProductSort 
                  options={sortOptions} 
                  currentSort={currentSort} 
                  onSortChange={handleSortChange}
                />
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar - Mobile */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  className="md:hidden bg-white p-4 rounded-lg shadow-md"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductFilters 
                    filters={filterOptions} 
                    activeFilters={activeFilters} 
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters Sidebar - Desktop */}
            <motion.div 
              className="hidden md:block w-64 flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white p-4 rounded-lg shadow-md sticky top-24">
                <ProductFilters 
                  filters={filterOptions} 
                  activeFilters={activeFilters} 
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </motion.div>
            
            {/* Products Content */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Mobile Sort */}
              <div className="mb-6 md:hidden">
                <ProductSort 
                  options={sortOptions} 
                  currentSort={currentSort} 
                  onSortChange={handleSortChange}
                />
              </div>
              
              {/* Products Count */}
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-naaz-green">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} found
                </h2>
              </div>
              
              {/* Products Grid */}
              <ProductGrid products={filteredBooks} loading={loading} />
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Books;
