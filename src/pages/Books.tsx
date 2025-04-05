
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters, { FilterOption } from '../components/product/ProductFilters';
import ProductSort, { SortOption } from '../components/product/ProductSort';
import { Product } from '../components/product/ProductDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
    description: 'The Noble Quran with translation and commentary.'
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
    description: 'Complete collection of authentic Hadith.'
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
    description: 'A collection of authentic hadith covering various aspects of life.'
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
    description: 'Biography of Prophet Muhammad (PBUH).'
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
    description: 'Comprehensive Tafsir of the Quran.'
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
    description: 'A beginner friendly guide to Islamic jurisprudence.'
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
    description: 'Stories of all the Prophets mentioned in the Quran.'
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
    description: 'Guide to living according to Islamic principles.'
  }
];

// Filter options
const filterOptions: FilterOption[] = [
  {
    id: 'category',
    name: 'Category',
    options: [
      { value: 'quran', label: 'Quran & Tafsir', count: 2 },
      { value: 'hadith', label: 'Hadith', count: 2 },
      { value: 'fiqh', label: 'Fiqh', count: 1 },
      { value: 'seerah', label: 'Seerah & Biography', count: 1 },
      { value: 'history', label: 'Islamic History', count: 1 },
      { value: 'spirituality', label: 'Spirituality', count: 1 }
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
          book.categories.some(cat => activeFilters.category.includes(cat.name))
        );
      }

      // Filter by price range
      if (activeFilters.price.length > 0) {
        result = result.filter(book => {
          const price = parseFloat(book.price);
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
          const rating = parseFloat(book.average_rating);
          return activeFilters.rating.some(r => rating >= parseFloat(r));
        });
      }

      // Filter by availability
      if (activeFilters.availability.length > 0) {
        result = result.filter(book => 
          activeFilters.availability.includes(book.stock_status)
        );
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
  const sortBooks = (booksToSort: Product[], sortOption: string) => {
    const sorted = [...booksToSort];
    
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'rating':
        return sorted.sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));
      case 'newest':
        // In a real app, we would sort by date added
        return sorted.reverse();
      case 'popularity':
      default:
        return sorted.sort((a, b) => b.rating_count - a.rating_count);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Banner */}
        <motion.div 
          className="relative h-80 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.6)'
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
