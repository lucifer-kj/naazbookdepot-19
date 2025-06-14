
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/product/ProductGrid';
import AdvancedProductFilters, { FilterOptions } from '../components/product/AdvancedProductFilters';
import { useAdvancedProducts } from '@/lib/hooks/useAdvancedProducts';
import { useCategories } from '@/lib/hooks/useCategories';

const EnhancedCatalog = () => {
  const { data: categories = [] } = useCategories();
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 0,
    minRating: 0,
    inStock: false,
    sortBy: 'newest',
  });

  const { data: products = [], isLoading } = useAdvancedProducts(filters);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      minPrice: 0,
      maxPrice: 0,
      minRating: 0,
      inStock: false,
      sortBy: 'newest',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <motion.h1 
            className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-10 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Enhanced Product Catalog
          </motion.h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <AdvancedProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                onClearFilters={handleClearFilters}
              />
            </div>
            
            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                  {products.length} product{products.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <ProductGrid products={products} loading={isLoading} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedCatalog;
