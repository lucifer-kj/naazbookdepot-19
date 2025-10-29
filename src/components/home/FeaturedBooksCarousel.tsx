
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '@/components/common/ProductGrid';
import { useFeaturedProducts } from '@/lib/hooks/useFeaturedProducts';

const FeaturedBooksCarousel = () => {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts(3);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-naaz-cream/50 scroll-animate opacity-0">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-naaz-green mb-4">
            Featured Islamic Books
          </h2>
          <div className="w-24 h-1 bg-naaz-gold mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collection of authentic Islamic literature
          </p>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <ProductGrid
            products={featuredProducts}
            loading={isLoading}
            variant="featured"
            gridCols={3}
            showRating={true}
            showWishlist={true}
            showAddToCart={true}
          />
          
          <div className="text-center mt-12">
            <Link to="/products" className="group bg-naaz-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-naaz-gold/90 transition-all duration-300 inline-flex items-center gap-3 transform hover:scale-105">
              View Complete Collection 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooksCarousel;
