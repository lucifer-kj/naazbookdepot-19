
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
      {/* Hero Image with Overlay */}
      <div 
        className="absolute inset-0 bg-naaz-green"
        style={{
          backgroundImage: "url('/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl animate-fade-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-playfair font-bold text-white mb-4 md:mb-6">
            Explore our premium collection of Islamic perfumes, books, and essential items
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8">
            Discover quality products across our specialized shops with over 60 years of heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Link to="/shops" className="gold-button text-center w-full sm:w-auto">
              Visit Our Shops
            </Link>
            <Link to="/blog" className="accent-button text-center w-full sm:w-auto">
              Explore Our Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
        <ChevronDown size={32} />
      </div>
    </div>
  );
};

export default Hero;
